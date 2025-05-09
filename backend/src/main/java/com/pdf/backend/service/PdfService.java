package com.pdf.backend.service;

import com.pdf.backend.dto.pdf.PdfExtractPagesRequest;
import com.pdf.backend.dto.pdf.PdfMergeRequest;
import com.pdf.backend.dto.pdf.PdfRemovePageRequest;
import com.pdf.backend.dto.pdf.PdfReorderPagesRequest;
import com.pdf.backend.dto.pdf.PdfResponse;
import com.pdf.backend.dto.pdf.PdfSplitAtPageRequest;
import org.apache.pdfbox.multipdf.PDFMergerUtility;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

@Service
public class PdfService {
    private static final Logger logger = LoggerFactory.getLogger(PdfService.class);

    public PdfResponse mergePdfFiles(PdfMergeRequest request) {
        try {
            // Create PDF merger
            PDFMergerUtility merger = new PDFMergerUtility();

            // Set the destination
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            merger.setDestinationStream(outputStream);

            // Add source PDFs
            InputStream firstPdfStream = new ByteArrayInputStream(request.getFirstPdf());
            InputStream secondPdfStream = new ByteArrayInputStream(request.getSecondPdf());

            merger.addSource(firstPdfStream);
            merger.addSource(secondPdfStream);

            // Merge the documents
            merger.mergeDocuments(null);

            // Get the merged content
            byte[] mergedContent = outputStream.toByteArray();

            // Clean up
            outputStream.close();
            firstPdfStream.close();
            secondPdfStream.close();

            String outputFileName = request.getOutputPdfName();
            if (outputFileName == null || outputFileName.isEmpty()) {
                outputFileName = "merged.pdf";
            }

            return PdfResponse.builder()
                    .fileName(outputFileName)
                    .message("PDF files merged successfully")
                    .content(mergedContent)
                    .success(true)
                    .build();

        } catch (Exception e) {
            logger.error("Error merging PDF files", e);
            return PdfResponse.builder()
                    .message("Failed to merge PDF files: " + e.getMessage())
                    .success(false)
                    .build();
        }
    }

    public PdfResponse extractPagesFromPdf(PdfExtractPagesRequest request) {
        try {
            // Load PDF document
            PDDocument document = PDDocument.load(request.getPdf());

            // Validate page range
            int totalPages = document.getNumberOfPages();
            if (request.getStartPage() > totalPages) {
                document.close();
                return PdfResponse.builder()
                        .message("Start page is beyond the document's page count")
                        .success(false)
                        .build();
            }

            int endPage = Math.min(request.getEndPage(), totalPages);

            // Create a custom page range extractor
            PDDocument extractedDoc = new PDDocument();
            for (int i = request.getStartPage(); i <= endPage; i++) {
                // PDFBox page indices are 0-based, while user input is 1-based
                extractedDoc.addPage(document.getPage(i - 1));
            }

            // Save the extracted document
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            extractedDoc.save(outputStream);
            byte[] extractedContent = outputStream.toByteArray();

            // Clean up
            document.close();
            extractedDoc.close();
            outputStream.close();

            String outputFileName = request.getOutputPdfName();
            if (outputFileName == null || outputFileName.isEmpty()) {
                outputFileName = "extracted.pdf";
            }

            return PdfResponse.builder()
                    .fileName(outputFileName)
                    .message("Pages extracted successfully")
                    .content(extractedContent)
                    .success(true)
                    .build();

        } catch (Exception e) {
            logger.error("Error extracting pages from PDF file", e);
            return PdfResponse.builder()
                    .message("Failed to extract pages from PDF file: " + e.getMessage())
                    .success(false)
                    .build();
        }
    }

    public Map<String, PdfResponse> splitPdfAtPage(PdfSplitAtPageRequest request) {
        Map<String, PdfResponse> result = new HashMap<>();

        try {
            // Load PDF document
            PDDocument document = PDDocument.load(request.getPdf());

            // Validate page number
            int totalPages = document.getNumberOfPages();
            if (request.getSplitAtPage() < 1 || request.getSplitAtPage() >= totalPages) {
                document.close();

                PdfResponse errorResponse = PdfResponse.builder()
                        .message("Split page is out of range. Valid range is 1 to " + (totalPages - 1))
                        .success(false)
                        .build();

                result.put("error", errorResponse);
                return result;
            }

            // Create the first document (pages 1 to splitAtPage)
            PDDocument firstDoc = new PDDocument();
            for (int i = 0; i < request.getSplitAtPage(); i++) {
                firstDoc.addPage(document.getPage(i));
            }

            // Create the second document (pages splitAtPage to end)
            PDDocument secondDoc = new PDDocument();
            for (int i = request.getSplitAtPage(); i < totalPages; i++) {
                secondDoc.addPage(document.getPage(i));
            }

            // Save the first document
            ByteArrayOutputStream firstOutputStream = new ByteArrayOutputStream();
            firstDoc.save(firstOutputStream);
            byte[] firstContent = firstOutputStream.toByteArray();

            // Save the second document
            ByteArrayOutputStream secondOutputStream = new ByteArrayOutputStream();
            secondDoc.save(secondOutputStream);
            byte[] secondContent = secondOutputStream.toByteArray();

            // Clean up
            document.close();
            firstDoc.close();
            secondDoc.close();
            firstOutputStream.close();
            secondOutputStream.close();

            // Set output filenames
            String firstFileName = request.getFirstOutputName();
            if (firstFileName == null || firstFileName.isEmpty()) {
                firstFileName = "part1.pdf";
            }

            String secondFileName = request.getSecondOutputName();
            if (secondFileName == null || secondFileName.isEmpty()) {
                secondFileName = "part2.pdf";
            }

            // Create responses
            PdfResponse firstResponse = PdfResponse.builder()
                    .fileName(firstFileName)
                    .message("First part of split PDF (pages 1-" + (request.getSplitAtPage() - 1) + ")")
                    .content(firstContent)
                    .success(true)
                    .build();

            PdfResponse secondResponse = PdfResponse.builder()
                    .fileName(secondFileName)
                    .message("Second part of split PDF (pages " + request.getSplitAtPage() + "-" + totalPages + ")")
                    .content(secondContent)
                    .success(true)
                    .build();

            // Add responses to result map
            result.put("first", firstResponse);
            result.put("second", secondResponse);

            return result;

        } catch (Exception e) {
            logger.error("Error splitting PDF file", e);

            PdfResponse errorResponse = PdfResponse.builder()
                    .message("Failed to split PDF file: " + e.getMessage())
                    .success(false)
                    .build();

            result.put("error", errorResponse);
            return result;
        }
    }

    public PdfResponse removePageFromPdf(PdfRemovePageRequest request) {
        try {
            // Load PDF document
            PDDocument document = PDDocument.load(request.getPdf());

            // Validate page number
            int totalPages = document.getNumberOfPages();
            if (request.getPageToRemove() < 1 || request.getPageToRemove() > totalPages) {
                document.close();
                return PdfResponse.builder()
                        .message("Page number is out of range. Valid range is 1 to " + totalPages)
                        .success(false)
                        .build();
            }

            // Create a new document without the specified page
            PDDocument resultDoc = new PDDocument();

            // Copy all pages except the one to remove
            // Remember: PDFBox uses 0-based page indices, while user input is 1-based
            for (int i = 0; i < totalPages; i++) {
                if (i != request.getPageToRemove() - 1) {
                    resultDoc.addPage(document.getPage(i));
                }
            }

            // Save the modified document
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            resultDoc.save(outputStream);
            byte[] modifiedContent = outputStream.toByteArray();

            // Clean up
            document.close();
            resultDoc.close();
            outputStream.close();

            String outputFileName = request.getOutputPdfName();
            if (outputFileName == null || outputFileName.isEmpty()) {
                outputFileName = "modified.pdf";
            }

            return PdfResponse.builder()
                    .fileName(outputFileName)
                    .message("Page " + request.getPageToRemove() + " removed successfully")
                    .content(modifiedContent)
                    .success(true)
                    .build();

        } catch (Exception e) {
            logger.error("Error removing page from PDF file", e);
            return PdfResponse.builder()
                    .message("Failed to remove page from PDF file: " + e.getMessage())
                    .success(false)
                    .build();
        }
    }

    public PdfResponse reorderPdfPages(PdfReorderPagesRequest request) {
        try {
            // Load PDF document
            PDDocument document = PDDocument.load(request.getPdf());

            // Validate page numbers in the order list
            int totalPages = document.getNumberOfPages();
            for (Integer pageNum : request.getPageOrder()) {
                if (pageNum < 1 || pageNum > totalPages) {
                    document.close();
                    return PdfResponse.builder()
                            .message("Page number " + pageNum + " is out of range. Valid range is 1 to " + totalPages)
                            .success(false)
                            .build();
                }
            }

            // Create a new document with reordered pages
            PDDocument resultDoc = new PDDocument();

            // Add pages in the specified order
            // Note: PDFBox uses 0-based indices, while input is 1-based
            for (Integer pageNum : request.getPageOrder()) {
                resultDoc.addPage(document.getPage(pageNum - 1));
            }

            // Save the reordered document
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            resultDoc.save(outputStream);
            byte[] reorderedContent = outputStream.toByteArray();

            // Clean up
            document.close();
            resultDoc.close();
            outputStream.close();

            String outputFileName = request.getOutputPdfName();
            if (outputFileName == null || outputFileName.isEmpty()) {
                outputFileName = "reordered.pdf";
            }

            return PdfResponse.builder()
                    .fileName(outputFileName)
                    .message("Pages reordered successfully")
                    .content(reorderedContent)
                    .success(true)
                    .build();

        } catch (Exception e) {
            logger.error("Error reordering pages in PDF file", e);
            return PdfResponse.builder()
                    .message("Failed to reorder pages in PDF file: " + e.getMessage())
                    .success(false)
                    .build();
        }
    }
}