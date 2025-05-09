package com.pdf.backend.dto.pdf;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PdfReorderPagesRequest {
    private String pdfName;
    private String outputPdfName;
    private List<Integer> pageOrder;
    private byte[] pdf;
}