package com.iponchallenge.observer;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class InAppNotificationObserver implements NotificationObserver {

    private final List<NotificationEvent> collected = new ArrayList<>();

    @Override
    public void onNotification(NotificationEvent event) {
        collected.add(event);
    }

    public List<NotificationEvent> getEvents() {
        return Collections.unmodifiableList(collected);
    }
}
