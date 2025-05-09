package com.pdf.backend.dto.history;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class HistoryResponse {
    private Long id;
    private Long userId;
    private String userName;
    private String userEmail;
    private String operationType;
    private String timestamp;
    private String sourceType;
    private String ipAddress;
    private String country;
    private String state;
    private String userAgent;
}