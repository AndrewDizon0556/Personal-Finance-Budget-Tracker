package com.iponchallenge.controller;

import com.iponchallenge.dto.SchoolEventRequest;
import com.iponchallenge.dto.SchoolEventResponse;
import com.iponchallenge.service.SchoolEventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/school-events")
@RequiredArgsConstructor
public class SchoolEventController {

    private final SchoolEventService eventService;

    @GetMapping
    public ResponseEntity<List<SchoolEventResponse>> getAll(Authentication auth) {
        return ResponseEntity.ok(eventService.getEvents(auth.getName()));
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<SchoolEventResponse>> getUpcoming(Authentication auth) {
        return ResponseEntity.ok(eventService.getUpcomingEvents(auth.getName()));
    }

    @PostMapping
    public ResponseEntity<SchoolEventResponse> create(
            @Valid @RequestBody SchoolEventRequest request, Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(eventService.createEvent(auth.getName(), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SchoolEventResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody SchoolEventRequest request,
            Authentication auth) {
        return ResponseEntity.ok(eventService.updateEvent(auth.getName(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id, Authentication auth) {
        eventService.deleteEvent(auth.getName(), id);
        return ResponseEntity.noContent().build();
    }
}
