package com.iponchallenge.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SyncResponseDto {

    private List<String> synced;     // queueIds successfully processed
    private List<String> failed;     // queueIds that errored
    private List<IdMappingDto> idMappings; // offlineId → serverId for CREATEs

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class IdMappingDto {
        private String offlineId;
        private String serverId;
    }
}
