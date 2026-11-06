
package com.micora.backend.controller;

import com.micora.backend.Repository.OrderRepo;
import com.micora.backend.Repository.PaymentRepo;
import com.micora.backend.Repository.ServiceRepo;
import com.micora.backend.Repository.UserRepo;
import com.micora.backend.model.Order;
import com.micora.backend.model.Payment;
import com.micora.backend.model.Service;
import com.micora.backend.model.User;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class OrderControllerTest {

    private final OrderRepo orderRepo = mock(OrderRepo.class);
    private final UserRepo userRepo = mock(UserRepo.class);
    private final ServiceRepo serviceRepo = mock(ServiceRepo.class);
    private final PaymentRepo paymentRepo = mock(PaymentRepo.class);
    private final OrderController controller =
        new OrderController(orderRepo, userRepo, serviceRepo, paymentRepo);

    private Authentication loginAs(long id) {
        return new UsernamePasswordAuthenticationToken(String.valueOf(id), null);
    }

    private User user(long id) {
        User u = new User();
        u.setId(id);
        return u;
    }

    private Service service(String price, boolean active) {
        Service s = new Service();
        s.setId(1L);
        s.setBasePrice(new BigDecimal(price));
        s.setActive(active);
        return s;
    }

    private Order order(long id, User owner, Order.Status status) {
        Order o = new Order();
        o.setId(id);
        o.setCustomer(owner);
        o.setStatus(status);
        return o;
    }

    private int codeOf(ResponseStatusException e) {
        return e.getStatusCode().value();
    }

    @Test
    void priceIsBasePriceTimesQuantity() {
        when(userRepo.findById(3L)).thenReturn(Optional.of(user(3)));
        when(serviceRepo.findById(1L)).thenReturn(Optional.of(service("2500", true)));
        when(orderRepo.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

        Order saved = controller.createOrder(
            new OrderController.CreateOrderRequest(1L, 4, null), loginAs(3));

        assertEquals(0, new BigDecimal("10000").compareTo(saved.getQuotedPrice()));
        assertEquals(Order.Status.PENDING, saved.getStatus());
    }

    @Test
    void zeroQuantityIsRejected() {
        ResponseStatusException e = assertThrows(ResponseStatusException.class,
            () -> controller.createOrder(
                new OrderController.CreateOrderRequest(1L, 0, null), loginAs(3)));
        assertEquals(400, codeOf(e));
    }

    @Test
    void inactiveServiceCannotBeOrdered() {
        when(userRepo.findById(3L)).thenReturn(Optional.of(user(3)));
        when(serviceRepo.findById(1L)).thenReturn(Optional.of(service("2500", false)));

        ResponseStatusException e = assertThrows(ResponseStatusException.class,
            () -> controller.createOrder(
                new OrderController.CreateOrderRequest(1L, 2, null), loginAs(3)));
        assertEquals(400, codeOf(e));
    }

    @Test
    void statusCannotSkipStages() {
        when(orderRepo.findById(5L))
            .thenReturn(Optional.of(order(5, user(3), Order.Status.PENDING)));

        ResponseStatusException e = assertThrows(ResponseStatusException.class,
            () -> controller.updateStatus(5L,
                new OrderController.UpdateStatusRequest(Order.Status.DELIVERED)));
        assertEquals(400, codeOf(e));
    }

    @Test
    void pendingOrderCanMoveToPrinting() {
        when(orderRepo.findById(5L))
            .thenReturn(Optional.of(order(5, user(3), Order.Status.PENDING)));
        when(orderRepo.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

        Order result = controller.updateStatus(5L,
            new OrderController.UpdateStatusRequest(Order.Status.PRINTING));

        assertEquals(Order.Status.PRINTING, result.getStatus());
    }

    @Test
    void customerCanCancelOwnUnpaidPendingOrder() {
        when(orderRepo.findById(5L))
            .thenReturn(Optional.of(order(5, user(3), Order.Status.PENDING)));
        when(orderRepo.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

        Order result = controller.cancelOrder(5L, loginAs(3));

        assertEquals(Order.Status.CANCELLED, result.getStatus());
    }

    @Test
    void paidOrderCannotBeCancelled() {
        when(orderRepo.findById(5L))
            .thenReturn(Optional.of(order(5, user(3), Order.Status.PENDING)));
        when(paymentRepo.existsByOrderIdAndStatus(5L, Payment.Status.SUCCESS)).thenReturn(true);

        ResponseStatusException e = assertThrows(ResponseStatusException.class,
            () -> controller.cancelOrder(5L, loginAs(3)));
        assertEquals(400, codeOf(e));
    }

    @Test
    void cannotCancelSomeoneElsesOrder() {
        when(orderRepo.findById(5L))
            .thenReturn(Optional.of(order(5, user(3), Order.Status.PENDING)));

        ResponseStatusException e = assertThrows(ResponseStatusException.class,
            () -> controller.cancelOrder(5L, loginAs(4)));
        assertEquals(403, codeOf(e));
    }
}