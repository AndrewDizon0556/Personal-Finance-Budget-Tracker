package com.iponchallenge.observer;

import java.util.ArrayList;
import java.util.List;

public class NotificationPublisher {

    private final List<NotificationObserver> observers = new ArrayList<>();

    public void addObserver(NotificationObserver observer) {
        observers.add(observer);
    }

    public void publish(NotificationEvent event) {
        observers.forEach(observer -> observer.onNotification(event));
    }
}
