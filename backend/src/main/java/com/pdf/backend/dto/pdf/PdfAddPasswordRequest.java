package com.pdf.backend.dto.pdf;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PdfAddPasswordRequest {
    private String pdfName;
    private String outputPdfName;
    private String ownerPassword;
    private byte[] pdf;
}