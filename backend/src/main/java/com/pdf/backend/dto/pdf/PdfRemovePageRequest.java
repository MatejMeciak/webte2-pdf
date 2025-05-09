package com.pdf.backend.dto.pdf;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PdfRemovePageRequest {
    private String pdfName;
    private String outputPdfName;
    private int pageToRemove;
    private byte[] pdf;
}