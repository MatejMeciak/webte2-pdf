package com.pdf.backend.dto.pdf;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PdfMergeRequest {
    private String firstPdfName;
    private String secondPdfName;
    private String outputPdfName;
    private byte[] firstPdf;
    private byte[] secondPdf;
}