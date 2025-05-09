package com.pdf.backend.dto.pdf;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PdfExtractPagesRequest {
    private String pdfName;
    private String outputPdfName;
    private int startPage;
    private int endPage;
    private byte[] pdf;
}