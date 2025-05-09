package com.pdf.backend.controller;

import com.pdf.backend.dto.history.HistoryExportRequest;
import com.pdf.backend.dto.history.HistoryResponse;
import com.pdf.backend.dto.history.HistorySearchRequest;
import com.pdf.backend.service.HistoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/history")
@RequiredArgsConstructor
@Tag(name = "History Operations", description = "PDF Operations History API")
public class HistoryController {

    private final HistoryService historyService;

    @Operation(summary = "Get operation history", description = "Retrieves paginated history of PDF operations")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved history"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - authentication required"),
            @ApiResponse(responseCode = "403", description = "Forbidden - admin role required")
    })
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<HistoryResponse>> getOperationHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        return ResponseEntity.ok(historyService.getOperationHistory(page, size));
    }

    @Operation(summary = "Search operation history", description = "Searches the history of PDF operations with filters")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved filtered history"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - authentication required"),
            @ApiResponse(responseCode = "403", description = "Forbidden - admin role required")
    })
    @PostMapping("/search")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<HistoryResponse>> searchOperationHistory(
            @RequestBody HistorySearchRequest searchRequest,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        return ResponseEntity.ok(historyService.searchOperationHistory(searchRequest, page, size));
    }

    @Operation(summary = "Export operation history", description = "Exports the entire history of PDF operations to CSV")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully exported history", 
                         content = @Content(mediaType = MediaType.APPLICATION_OCTET_STREAM_VALUE, 
                                           schema = @Schema(type = "string", format = "binary"))),
            @ApiResponse(responseCode = "401", description = "Unauthorized - authentication required"),
            @ApiResponse(responseCode = "403", description = "Forbidden - admin role required"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @GetMapping("/export")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> exportOperationHistory() {
        try {
            byte[] data = historyService.exportAllHistoryToCsv();
            
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd_HHmmss");
            String timestamp = LocalDateTime.now().format(formatter);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment", "pdf_operations_history_" + timestamp + ".csv");
            
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(data);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Error exporting history: " + e.getMessage());
        }
    }
    
    @Operation(summary = "Delete history entry", description = "Deletes a specific history entry by ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully deleted history entry"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - authentication required"),
            @ApiResponse(responseCode = "403", description = "Forbidden - admin role required"),
            @ApiResponse(responseCode = "404", description = "History entry not found")
    })
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteHistoryEntry(@PathVariable Long id) {
        boolean deleted = historyService.deleteHistoryEntry(id);
        
        if (deleted) {
            return ResponseEntity.ok().body("History entry deleted successfully");
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    @Operation(summary = "Delete all history", description = "Deletes all history entries")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully deleted all history entries"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - authentication required"),
            @ApiResponse(responseCode = "403", description = "Forbidden - admin role required")
    })
    @DeleteMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteAllHistory() {
        historyService.deleteAllHistory();
        return ResponseEntity.ok().body("All history entries deleted successfully");
    }
}