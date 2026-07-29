package com.srivelva.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.srivelva.service.TokenService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * AdminAuthFilter — protects all /api/admin/** routes.
 *
 * Every request whose path starts with /api/admin/ must carry a valid
 * Bearer token in the Authorization header. All other paths (products,
 * orders, payment, contact, auth itself) are completely unaffected.
 *
 * Returns 401 JSON (matching ApiResponse shape) when authentication fails.
 */
@Component
public class AdminAuthFilter extends OncePerRequestFilter {

    private static final String PROTECTED_PREFIX = "/api/admin/";

    private final TokenService   tokenService;
    private final ObjectMapper   objectMapper;

    public AdminAuthFilter(TokenService tokenService, ObjectMapper objectMapper) {
        this.tokenService = tokenService;
        this.objectMapper = objectMapper;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest  request,
                                    HttpServletResponse response,
                                    FilterChain         chain)
            throws ServletException, IOException {

        String path   = request.getRequestURI();
        String method = request.getMethod();

        // Determine whether this request needs authentication.
        //
        // Protected:
        //   /api/admin/**          — all methods (admin-only CRUD)
        //   /api/products  POST/PUT/DELETE  — write mutations
        //   /api/orders    POST/PUT/DELETE  — write mutations (confirm, status update)
        //
        // Public:
        //   GET on any path
        //   OPTIONS (CORS preflight)
        //   /api/auth/**
        //   /api/contact/**
        //   /api/reviews/**
        //   /api/settings  GET only

        boolean isAdminPath = path.startsWith("/api/admin/");

        // /api/products: POST/PUT/DELETE require admin token (product management)
        boolean isWriteOnProducts = !method.equalsIgnoreCase("GET")
                                 && !method.equalsIgnoreCase("OPTIONS")
                                 && path.startsWith("/api/products");

        // /api/orders:
        //   POST /api/orders                   — PUBLIC: customer places an order
        //   PUT  /api/orders/{id}/cancel        — PUBLIC: customer cancels (no token needed)
        //   PUT  /api/orders/{id}/confirm       — ADMIN: requires token
        //   PUT  /api/orders/admin/{id}/status  — ADMIN: requires token
        //   PUT  /api/orders/admin/{id}/refund  — ADMIN: requires token
        boolean isCustomerCancelOrder = method.equalsIgnoreCase("PUT")
                                     && path.matches("/api/orders/[^/]+/cancel");

        boolean isAdminWriteOnOrders = !method.equalsIgnoreCase("GET")
                                    && !method.equalsIgnoreCase("OPTIONS")
                                    && !method.equalsIgnoreCase("POST")   // POST = customer order
                                    && !isCustomerCancelOrder             // customer cancel = public
                                    && path.startsWith("/api/orders");

        // DELETE /api/reviews/{id} — admin only (customers can create but not delete)
        boolean isDeleteOnReviews = method.equalsIgnoreCase("DELETE")
                                 && path.startsWith("/api/reviews");

        boolean requiresAuth = isAdminPath || isWriteOnProducts || isAdminWriteOnOrders || isDeleteOnReviews;

        if (!requiresAuth) {
            chain.doFilter(request, response);
            return;
        }

        // Extract Bearer token
        String header = request.getHeader("Authorization");
        String token  = (header != null && header.startsWith("Bearer "))
                        ? header.substring(7)
                        : null;

        if (tokenService.validate(token)) {
            chain.doFilter(request, response);   // valid — continue
        } else {
            // Reject with a JSON response matching the ApiResponse shape
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json;charset=UTF-8");
            // Map.of() throws NullPointerException on null values.
            // Use LinkedHashMap which allows nulls.
            Map<String, Object> body = new LinkedHashMap<>();
            body.put("success", false);
            body.put("message", "Unauthorised — please log in to access the admin panel");
            body.put("data",    null);
            response.getWriter().write(objectMapper.writeValueAsString(body));
        }
    }
}
