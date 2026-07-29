package com.srivelva.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.srivelva.dto.OrderRequest;
import com.srivelva.dto.OrderResponse;
import com.srivelva.model.Order;
import com.srivelva.repository.OrderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@Transactional
public class OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    private final OrderRepository orderRepository;
    private final ObjectMapper    objectMapper;
    private final WhatsAppService whatsAppService;
    private final EmailService    emailService;

    public OrderService(OrderRepository orderRepository,
                        ObjectMapper    objectMapper,
                        WhatsAppService whatsAppService,
                        EmailService    emailService) {
        this.orderRepository = orderRepository;
        this.objectMapper    = objectMapper;
        this.whatsAppService = whatsAppService;
        this.emailService    = emailService;
    }

    // ── Read ─────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc()
                              .stream().map(OrderResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public Optional<OrderResponse> getOrderById(Long id) {
        return orderRepository.findById(id).map(OrderResponse::from);
    }

    @Transactional(readOnly = true)
    public Double getTotalRevenue() {
        return orderRepository.sumTotalRevenue();
    }

    // ── Create order (UPI/QR payment — no transaction ID needed) ─

    public OrderResponse createOrder(OrderRequest request) {
        Order order = new Order();
        order.setCustomerName(request.getCustomerName());
        order.setPhone(request.getPhone());
        order.setEmail(request.getEmail());
        order.setAddress(request.getAddress());
        order.setNotes(request.getNotes());
        order.setTotalAmount(request.getTotalAmount());
        order.setStatus("PENDING");
        order.setPaymentStatus("PENDING_VERIFICATION");

        if (request.getItems() != null && !request.getItems().isEmpty()) {
            try {
                order.setItemsJson(objectMapper.writeValueAsString(request.getItems()));
            } catch (Exception e) {
                log.warn("Could not serialise order items: {}", e.getMessage());
                order.setItemsJson("[]");
            }
        } else {
            order.setItemsJson("[]");
        }

        Order saved = orderRepository.save(order);
        log.info("[Order] Created #{} for {} — ₹{}", saved.getId(),
                 saved.getCustomerName(), saved.getTotalAmount());

        whatsAppService.notifyAdminNewOrder(
            saved.getId(), saved.getCustomerName(),
            saved.getPhone(), saved.getTotalAmount());

        return OrderResponse.from(saved);
    }

    // ── Admin: confirm ────────────────────────────────────────────

    public Optional<OrderResponse> confirmOrder(Long id) {
        return orderRepository.findById(id).map(order -> {
            order.setStatus("CONFIRMED");
            Order saved = orderRepository.save(order);
            log.info("[Order] Confirmed #{}", saved.getId());

            whatsAppService.notifyOrderConfirmed(
                saved.getId(), saved.getCustomerName(),
                saved.getPhone(), saved.getTotalAmount());

            emailService.sendOrderStatusUpdate(
                saved.getEmail(), saved.getCustomerName(),
                saved.getId(), "CONFIRMED");

            return OrderResponse.from(saved);
        });
    }

    // ── Admin: update payment verification status ─────────────────

    public Optional<OrderResponse> updatePaymentStatus(Long id, String paymentStatus) {
        return orderRepository.findById(id).map(order -> {
            order.setPaymentStatus(paymentStatus.toUpperCase());
            Order saved = orderRepository.save(order);
            log.info("[Order] Payment status of #{} → {}", saved.getId(), paymentStatus);
            return OrderResponse.from(saved);
        });
    }

    // ── Admin: generic status update ──────────────────────────────

    public Optional<OrderResponse> updateOrderStatus(Long id, String status) {
        return orderRepository.findById(id).map(order -> {
            order.setStatus(status.toUpperCase());
            Order saved = orderRepository.save(order);
            log.info("[Order] Status of #{} → {}", saved.getId(), status);

            emailService.sendOrderStatusUpdate(
                saved.getEmail(), saved.getCustomerName(),
                saved.getId(), status.toUpperCase());

            return OrderResponse.from(saved);
        });
    }

    // ── Admin: delete ─────────────────────────────────────────────

    public boolean deleteOrder(Long id) {
        if (!orderRepository.existsById(id)) return false;
        orderRepository.deleteById(id);
        return true;
    }

    // ── Cancellation ──────────────────────────────────────────────

    private static final Set<String> CANCELLABLE = Set.of("PENDING", "CONFIRMED", "PROCESSING");

    public CancelResult cancelOrder(Long id, String reason) {
        Optional<Order> opt = orderRepository.findById(id);
        if (opt.isEmpty()) return CancelResult.notFound();

        Order order = opt.get();
        String current = order.getStatus() == null ? "PENDING" : order.getStatus().toUpperCase();

        if (!CANCELLABLE.contains(current))
            return CancelResult.cannotCancel(
                "Order cannot be cancelled — current status is " + current +
                ". Only PENDING, CONFIRMED or PROCESSING orders can be cancelled.");

        order.setStatus("CANCELLED");
        order.setCancellationReason(reason != null ? reason.trim() : "");
        order.setCancelledAt(LocalDateTime.now());

        boolean wasPaid = "VERIFIED".equals(order.getPaymentStatus());
        order.setRefundStatus(wasPaid ? "PENDING" : "NOT_APPLICABLE");

        Order saved = orderRepository.save(order);
        log.info("[Order] #{} cancelled. Reason: {}. Refund: {}",
                 saved.getId(), saved.getCancellationReason(), saved.getRefundStatus());

        try {
            emailService.sendOrderStatusUpdate(
                saved.getEmail(), saved.getCustomerName(), saved.getId(), "CANCELLED");
        } catch (Exception e) {
            log.warn("[Order] Failed to send cancellation email: {}", e.getMessage());
        }

        return CancelResult.success(OrderResponse.from(saved));
    }

    public Optional<OrderResponse> updateRefundStatus(Long id, String refundStatus) {
        return orderRepository.findById(id).map(order -> {
            order.setRefundStatus(refundStatus.toUpperCase());
            Order saved = orderRepository.save(order);
            log.info("[Order] Refund status of #{} → {}", saved.getId(), refundStatus);
            return OrderResponse.from(saved);
        });
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getCancelledOrders() {
        return orderRepository.findByStatusOrderByCreatedAtDesc("CANCELLED")
                              .stream().map(OrderResponse::from).toList();
    }

    // ── CancelResult value object ─────────────────────────────────

    public static class CancelResult {
        public final boolean       found;
        public final boolean       success;
        public final String        message;
        public final OrderResponse order;

        private CancelResult(boolean found, boolean success, String message, OrderResponse order) {
            this.found   = found;
            this.success = success;
            this.message = message;
            this.order   = order;
        }

        public static CancelResult notFound()               { return new CancelResult(false, false, "Order not found", null); }
        public static CancelResult cannotCancel(String msg) { return new CancelResult(true,  false, msg, null); }
        public static CancelResult success(OrderResponse o) { return new CancelResult(true,  true,  "Order cancelled successfully", o); }
    }
}
