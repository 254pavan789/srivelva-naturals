package com.srivelva.controller;

import com.srivelva.dto.ApiResponse;
import com.srivelva.dto.CancelOrderRequest;
import com.srivelva.dto.OrderRequest;
import com.srivelva.dto.OrderResponse;
import com.srivelva.service.OrderService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private static final Logger log = LoggerFactory.getLogger(OrderController.class);

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // ── Customer: Place order (JSON) ─────────────────────────────
    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(
            @Valid @RequestBody OrderRequest request) {

        if (request.getEmail() == null || request.getEmail().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Email address is required"));
        }
        if (!request.getEmail().matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Please provide a valid email address"));
        }

        OrderResponse created = orderService.createOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Order placed successfully", created));
    }

    // ── Customer: Get order by ID ─────────────────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderById(@PathVariable Long id) {
        return orderService.getOrderById(id)
                .<ResponseEntity<ApiResponse<OrderResponse>>>map(
                        o -> ResponseEntity.ok(ApiResponse.ok(o)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Order not found: " + id)));
    }

    // ── Customer: Cancel order ────────────────────────────────────
    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(
            @PathVariable Long id,
            @RequestBody(required = false) CancelOrderRequest body) {

        String reason = (body != null) ? body.getReason() : null;
        OrderService.CancelResult result = orderService.cancelOrder(id, reason);

        if (!result.found)
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Order not found: " + id));
        if (!result.success)
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error(result.message));
        return ResponseEntity.ok(ApiResponse.ok(result.message, result.order));
    }

    // ── Admin: Get all orders ─────────────────────────────────────
    @GetMapping
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getAllOrders() {
        return ResponseEntity.ok(ApiResponse.ok(orderService.getAllOrders()));
    }

    // ── Admin: Get cancelled orders ───────────────────────────────
    @GetMapping("/cancelled")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getCancelledOrders() {
        return ResponseEntity.ok(ApiResponse.ok(orderService.getCancelledOrders()));
    }

    // ── Admin: Confirm order ──────────────────────────────────────
    @PutMapping("/{id}/confirm")
    public ResponseEntity<ApiResponse<OrderResponse>> confirmOrder(@PathVariable Long id) {
        return orderService.confirmOrder(id)
                .<ResponseEntity<ApiResponse<OrderResponse>>>map(
                        o -> ResponseEntity.ok(ApiResponse.ok("Order confirmed", o)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Order not found: " + id)));
    }

    // ── Admin: Update order status ────────────────────────────────
    @PutMapping("/admin/{id}/status")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrderStatus(
            @PathVariable Long id, @RequestBody Map<String, String> body) {

        String status = body.get("status");
        if (status == null || status.isBlank())
            return ResponseEntity.badRequest().body(ApiResponse.error("'status' is required"));

        Set<String> allowed = Set.of("PENDING", "CONFIRMED", "PAID", "SHIPPED", "DELIVERED");
        if (!allowed.contains(status.toUpperCase()))
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Invalid status. Allowed: " + String.join(", ", allowed)));

        return orderService.updateOrderStatus(id, status)
                .<ResponseEntity<ApiResponse<OrderResponse>>>map(
                        o -> ResponseEntity.ok(ApiResponse.ok("Status updated", o)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Order not found: " + id)));
    }

    // ── Admin: Update payment verification status ─────────────────
    @PutMapping("/admin/{id}/payment-status")
    public ResponseEntity<ApiResponse<OrderResponse>> updatePaymentStatus(
            @PathVariable Long id, @RequestBody Map<String, String> body) {

        String paymentStatus = body.get("paymentStatus");
        if (paymentStatus == null || paymentStatus.isBlank())
            return ResponseEntity.badRequest().body(ApiResponse.error("'paymentStatus' is required"));

        Set<String> allowed = Set.of("PENDING_VERIFICATION", "VERIFIED", "REJECTED");
        if (!allowed.contains(paymentStatus.toUpperCase()))
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Invalid paymentStatus. Allowed: " + String.join(", ", allowed)));

        return orderService.updatePaymentStatus(id, paymentStatus)
                .<ResponseEntity<ApiResponse<OrderResponse>>>map(
                        o -> ResponseEntity.ok(ApiResponse.ok("Payment status updated", o)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Order not found: " + id)));
    }

    // ── Admin: Update refund status ───────────────────────────────
    @PutMapping("/admin/{id}/refund")
    public ResponseEntity<ApiResponse<OrderResponse>> updateRefundStatus(
            @PathVariable Long id, @RequestBody Map<String, String> body) {

        String refundStatus = body.get("refundStatus");
        if (refundStatus == null || refundStatus.isBlank())
            return ResponseEntity.badRequest().body(ApiResponse.error("'refundStatus' is required"));

        Set<String> allowed = Set.of("PENDING", "INITIATED", "REFUNDED", "NOT_APPLICABLE");
        if (!allowed.contains(refundStatus.toUpperCase()))
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Invalid refundStatus. Allowed: " + String.join(", ", allowed)));

        return orderService.updateRefundStatus(id, refundStatus)
                .<ResponseEntity<ApiResponse<OrderResponse>>>map(
                        o -> ResponseEntity.ok(ApiResponse.ok("Refund status updated", o)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Order not found: " + id)));
    }

    // ── Admin: Revenue ────────────────────────────────────────────
    @GetMapping("/revenue")
    public ResponseEntity<ApiResponse<Double>> getTotalRevenue() {
        return ResponseEntity.ok(ApiResponse.ok(orderService.getTotalRevenue()));
    }

    // ── Admin: Delete order ───────────────────────────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteOrder(@PathVariable Long id) {
        boolean deleted = orderService.deleteOrder(id);
        if (deleted)
            return ResponseEntity.ok(ApiResponse.success("Order #" + id + " deleted successfully"));
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error("Order not found: " + id));
    }
}
