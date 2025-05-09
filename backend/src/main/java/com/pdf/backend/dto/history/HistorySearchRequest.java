package com.pdf.backend.dto.history;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class HistorySearchRequest {
    private Long userId;
    private String operationType;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String country;
    private String sourceType;
}