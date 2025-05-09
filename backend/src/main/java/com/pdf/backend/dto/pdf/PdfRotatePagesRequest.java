package com.pdf.backend.dto.pdf;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PdfRotatePagesRequest {
    private String pdfName;
    private String outputPdfName;
    private Map<Integer, Integer> pageRotations; // Key: page number (1-based), Value: rotation degree (90, 180, 270)
    private byte[] pdf;
}