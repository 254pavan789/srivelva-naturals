package com.srivelva.repository;

import com.srivelva.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    /** All orders sorted newest-first for the admin dashboard. */
    List<Order> findAllByOrderByCreatedAtDesc();

    /** Filtered by status — used for cancelled orders tab. */
    List<Order> findByStatusOrderByCreatedAtDesc(String status);

    /** Revenue total — excludes cancelled orders. */
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status != 'CANCELLED'")
    Double sumTotalRevenue();
}
