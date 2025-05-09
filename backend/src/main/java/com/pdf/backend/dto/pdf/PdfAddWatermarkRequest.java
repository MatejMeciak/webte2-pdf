package com.pdf.backend.dto.pdf;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PdfAddWatermarkRequest {
    private String pdfName;
    private String outputPdfName;
    private String watermarkText;
    private float opacity; // 0.0 to 1.0
    private int fontSize;
    private String color; // HTML color string (e.g., "#FF0000" for red)
    private int rotation; // degrees
    private byte[] pdf;
}