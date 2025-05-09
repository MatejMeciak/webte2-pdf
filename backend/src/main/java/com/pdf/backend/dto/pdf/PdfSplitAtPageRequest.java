package com.pdf.backend.dto.pdf;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PdfSplitAtPageRequest {
    private String pdfName;
    private String firstOutputName;
    private String secondOutputName;
    private int splitAtPage;
    private byte[] pdf;
}