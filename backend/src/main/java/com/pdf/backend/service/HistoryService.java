package com.pdf.backend.service;

import com.pdf.backend.dto.history.HistoryExportRequest;
import com.pdf.backend.dto.history.HistoryResponse;
import com.pdf.backend.dto.history.HistorySearchRequest;
import com.pdf.backend.model.PdfOperationHistory;
import com.pdf.backend.model.User;
import com.pdf.backend.repository.PdfOperationHistoryRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.PrintWriter;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class HistoryService {

    private final PdfOperationHistoryRepository historyRepository;
    private final RestTemplate restTemplate;
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    
    /**
     * Track a PDF operation in the history log (synchronous)
     * 
     * @param operationType The type of operation performed
     * @param sourceType The source of the request (API or Frontend)
     * @param requestDetails Details of the operation
     * @param request The HTTP request containing client information
     */
    public void trackOperation(String operationType, String sourceType, String requestDetails, 
                              HttpServletRequest request) {
        
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                log.warn("Attempted to track operation but no authenticated user found");
                return;
            }
            
            User user = (User) authentication.getPrincipal();
            
            // Get client IP address
            String ipAddress = getClientIpAddress(request);
            
            // Get location data based on IP address
            Map<String, String> locationData = getLocationDataFromIp(ipAddress);
            
            PdfOperationHistory history = PdfOperationHistory.builder()
                    .user(user)
                    .operationType(operationType)
                    .timestamp(LocalDateTime.now())
                    .sourceType(sourceType)
                    .ipAddress(ipAddress)
                    .country(locationData.get("country"))
                    .state(locationData.get("state"))
                    .userAgent(request.getHeader("User-Agent"))
                    .requestDetails(requestDetails)
                    .build();
            
            historyRepository.save(history);
            log.debug("Tracked operation: {} by user: {}", operationType, user.getEmail());
        } catch (Exception e) {
            log.error("Failed to track operation history", e);
        }
    }
    
    public Page<HistoryResponse> getOperationHistory(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("timestamp").descending());
        Page<PdfOperationHistory> historyPage = historyRepository.findAllByOrderByTimestampDesc(pageable);
        
        return historyPage.map(this::convertToResponse);
    }
    
    public Page<HistoryResponse> searchOperationHistory(HistorySearchRequest searchRequest, int page, int size) {
        // Implementation would filter based on search criteria
        // This is a simplified version that just returns all records
        return getOperationHistory(page, size);
    }
    
    /**
     * Export the entire history to CSV without filters
     * 
     * @return CSV file as byte array
     * @throws IOException if there's an error writing to the output stream
     */
    public byte[] exportAllHistoryToCsv() throws IOException {
        // Get all history records
        List<PdfOperationHistory> historyList = historyRepository.findAll(
            Sort.by("timestamp").descending()
        );
        
        return generateCsvFromHistory(historyList);
    }
    
    /**
     * Export filtered history to CSV (legacy method)
     * 
     * @param exportRequest filters to apply before exporting
     * @return CSV file as byte array
     * @throws IOException if there's an error writing to the output stream
     */
    public byte[] exportHistoryToCsv(HistoryExportRequest exportRequest) throws IOException {
        // Get all records or filtered records based on export request
        List<PdfOperationHistory> historyList = historyRepository.findAll();
        
        return generateCsvFromHistory(historyList);
    }
    
    /**
     * Delete a specific history entry by ID
     * 
     * @param id the ID of the history entry to delete
     * @return true if entry was found and deleted, false otherwise
     */
    public boolean deleteHistoryEntry(Long id) {
        Optional<PdfOperationHistory> historyOptional = historyRepository.findById(id);
        
        if (historyOptional.isPresent()) {
            historyRepository.deleteById(id);
            log.info("Deleted history entry with ID: {}", id);
            return true;
        } else {
            log.warn("Attempted to delete non-existent history entry with ID: {}", id);
            return false;
        }
    }
    
    /**
     * Delete all history entries
     */
    public void deleteAllHistory() {
        long count = historyRepository.count();
        historyRepository.deleteAll();
        log.info("Deleted all history entries, count: {}", count);
    }
    
    /**
     * Helper method to generate CSV from a list of history entries
     */
    private byte[] generateCsvFromHistory(List<PdfOperationHistory> historyList) throws IOException {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        try (PrintWriter writer = new PrintWriter(outputStream)) {
            // Write CSV header
            writer.println("ID,User,Email,Operation,Timestamp,Source,IP Address,Country,State,User Agent,Request Details");
            
            // Write data rows
            for (PdfOperationHistory history : historyList) {
                writer.println(
                    String.join(",",
                        history.getId().toString(),
                        escapeCsvField(history.getUser().getFirstName() + " " + history.getUser().getLastName()),
                        escapeCsvField(history.getUser().getEmail()),
                        escapeCsvField(history.getOperationType()),
                        history.getTimestamp().format(DATE_FORMAT),
                        escapeCsvField(history.getSourceType()),
                        escapeCsvField(history.getIpAddress()),
                        escapeCsvField(history.getCountry()),
                        escapeCsvField(history.getState()),
                        escapeCsvField(history.getUserAgent()),
                        escapeCsvField(history.getRequestDetails())
                    )
                );
            }
        }
        
        return outputStream.toByteArray();
    }
    
    private String escapeCsvField(String field) {
        if (field == null) {
            return "";
        }
        // Escape quotes and wrap field in quotes if it contains commas or quotes
        if (field.contains("\"") || field.contains(",")) {
            return "\"" + field.replace("\"", "\"\"") + "\"";
        }
        return field;
    }
    
    private HistoryResponse convertToResponse(PdfOperationHistory history) {
        return HistoryResponse.builder()
                .id(history.getId())
                .userId(history.getUser().getId())
                .userName(history.getUser().getFirstName() + " " + history.getUser().getLastName())
                .userEmail(history.getUser().getEmail())
                .operationType(history.getOperationType())
                .timestamp(history.getTimestamp().format(DATE_FORMAT))
                .sourceType(history.getSourceType())
                .ipAddress(history.getIpAddress())
                .country(history.getCountry())
                .state(history.getState())
                .userAgent(history.getUserAgent())
                .build();
    }
    
    private String getClientIpAddress(HttpServletRequest request) {
        String ipAddress = request.getHeader("X-Forwarded-For");
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("Proxy-Client-IP");
        }
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("HTTP_CLIENT_IP");
        }
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("HTTP_X_FORWARDED_FOR");
        }
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getRemoteAddr();
        }
        return ipAddress;
    }
    
    private Map<String, String> getLocationDataFromIp(String ipAddress) {
        Map<String, String> locationData = new HashMap<>();
        locationData.put("country", "");
        locationData.put("state", "");
        
        try {
            // Skip lookup for localhost or private IP addresses
            if (ipAddress.equals("127.0.0.1") || ipAddress.equals("0:0:0:0:0:0:0:1") ||
                ipAddress.startsWith("192.168.") || ipAddress.startsWith("10.") ||
                ipAddress.startsWith("172.")) {
                locationData.put("country", "Local");
                locationData.put("state", "Development");
                return locationData;
            }
            
            // Use a public IP geolocation API
            String apiUrl = "http://ip-api.com/json/" + ipAddress;
            Map<String, Object> response = restTemplate.getForObject(apiUrl, Map.class);
            
            if (response != null && "success".equals(response.get("status"))) {
                locationData.put("country", (String) response.get("country"));
                locationData.put("state", (String) response.get("regionName"));
            }
        } catch (Exception e) {
            // Log error but continue - geolocation is non-critical
            log.warn("Failed to get location data from IP: {}", ipAddress, e);
        }
        
        return locationData;
    }
}