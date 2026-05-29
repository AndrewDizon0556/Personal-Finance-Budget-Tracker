package com.iponchallenge.controller;

import com.iponchallenge.observer.NotificationEvent;
import com.iponchallenge.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<NotificationEvent>> getNotifications(Authentication auth) {
        return ResponseEntity.ok(notificationService.getNotifications(auth.getName()));
    }
}
