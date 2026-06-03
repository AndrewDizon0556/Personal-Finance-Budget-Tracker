package com.iponchallenge.service;

import com.iponchallenge.dto.SchoolEventRequest;
import com.iponchallenge.dto.SchoolEventResponse;
import com.iponchallenge.entity.SchoolEvent;
import com.iponchallenge.entity.User;
import com.iponchallenge.exception.BadRequestException;
import com.iponchallenge.exception.ResourceNotFoundException;
import com.iponchallenge.mapper.SchoolEventMapper;
import com.iponchallenge.repository.SchoolEventRepository;
import com.iponchallenge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SchoolEventService {

    private final SchoolEventRepository eventRepository;
    private final UserRepository userRepository;
    private final SchoolEventMapper eventMapper;

    public List<SchoolEventResponse> getEvents(String email) {
        User user = getUser(email);
        return eventRepository.findByUserOrderByDateAsc(user)
                .stream().map(eventMapper::toResponse).collect(Collectors.toList());
    }

    public List<SchoolEventResponse> getUpcomingEvents(String email) {
        User user = getUser(email);
        LocalDate today = LocalDate.now();
        return eventRepository.findByUserAndDateBetweenOrderByDateAsc(user, today, today.plusDays(30))
                .stream().map(eventMapper::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public SchoolEventResponse createEvent(String email, SchoolEventRequest request) {
        if (request.getDate().isBefore(LocalDate.now().minusYears(1))) {
            throw new BadRequestException("Event date cannot be more than 1 year in the past");
        }
        User user = getUser(email);
        SchoolEvent event = SchoolEvent.builder()
                .user(user)
                .title(request.getTitle().trim())
                .date(request.getDate())
                .category(request.getCategory())
                .estimatedCost(request.getEstimatedCost())
                .notes(request.getNotes())
                .build();
        return eventMapper.toResponse(eventRepository.save(event));
    }

    @Transactional
    public SchoolEventResponse updateEvent(String email, UUID id, SchoolEventRequest request) {
        User user = getUser(email);
        SchoolEvent event = findOwned(user, id);

        event.setTitle(request.getTitle().trim());
        event.setDate(request.getDate());
        event.setCategory(request.getCategory());
        event.setEstimatedCost(request.getEstimatedCost());
        event.setNotes(request.getNotes());

        return eventMapper.toResponse(eventRepository.save(event));
    }

    @Transactional
    public void deleteEvent(String email, UUID id) {
        User user = getUser(email);
        SchoolEvent event = findOwned(user, id);
        eventRepository.delete(event);
    }

    private SchoolEvent findOwned(User user, UUID id) {
        return eventRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("School event not found"));
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found"));
    }
}
