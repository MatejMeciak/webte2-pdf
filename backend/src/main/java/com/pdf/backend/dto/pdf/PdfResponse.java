package com.pdf.backend.dto.pdf;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PdfResponse {
    private String fileName;
    private String message;
    private byte[] content;
    private boolean success;
}