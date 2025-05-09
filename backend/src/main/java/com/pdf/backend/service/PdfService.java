package com.pdf.backend.service;

import com.pdf.backend.dto.pdf.PdfAddPasswordRequest;
import com.pdf.backend.dto.pdf.PdfAddWatermarkRequest;
import com.pdf.backend.dto.pdf.PdfExtractPagesRequest;
import com.pdf.backend.dto.pdf.PdfMergeRequest;
import com.pdf.backend.dto.pdf.PdfRemovePageRequest;
import com.pdf.backend.dto.pdf.PdfRemovePasswordRequest;
import com.pdf.backend.dto.pdf.PdfReorderPagesRequest;
import com.pdf.backend.dto.pdf.PdfResponse;
import com.pdf.backend.dto.pdf.PdfRotatePagesRequest;
import com.pdf.backend.dto.pdf.PdfSplitAtPageRequest;
import com.pdf.backend.dto.pdf.PdfToImagesRequest;

import org.apache.pdfbox.multipdf.PDFMergerUtility;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.encryption.AccessPermission;
import org.apache.pdfbox.pdmodel.encryption.StandardProtectionPolicy;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.graphics.state.PDExtendedGraphicsState;
import org.apache.pdfbox.pdmodel.graphics.state.RenderingMode;
import org.apache.pdfbox.rendering.ImageType;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.apache.pdfbox.util.Matrix;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

import javax.imageio.ImageIO;

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

    public PdfResponse addPasswordToPdf(PdfAddPasswordRequest request) {
        try {
            // Load PDF document
            PDDocument document = PDDocument.load(request.getPdf());

            // Create protection policy
            AccessPermission accessPermission = new AccessPermission();
            // Using the same password for both owner and user password
            StandardProtectionPolicy protectionPolicy = new StandardProtectionPolicy(
                    request.getOwnerPassword(),
                    request.getOwnerPassword(), // Use owner password for user password too
                    accessPermission);

            // Set encryption key length
            protectionPolicy.setEncryptionKeyLength(128);

            // Apply protection
            document.protect(protectionPolicy);

            // Save the protected document
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            document.save(outputStream);
            byte[] protectedContent = outputStream.toByteArray();

            // Clean up
            document.close();
            outputStream.close();

            String outputFileName = request.getOutputPdfName();
            if (outputFileName == null || outputFileName.isEmpty()) {
                outputFileName = "protected.pdf";
            }

            return PdfResponse.builder()
                    .fileName(outputFileName)
                    .message("PDF successfully protected with password")
                    .content(protectedContent)
                    .success(true)
                    .build();

        } catch (Exception e) {
            logger.error("Error adding password to PDF file", e);
            return PdfResponse.builder()
                    .message("Failed to add password to PDF file: " + e.getMessage())
                    .success(false)
                    .build();
        }
    }

    public PdfResponse removePasswordFromPdf(PdfRemovePasswordRequest request) {
        try {
            // Load PDF document with password
            PDDocument document = PDDocument.load(request.getPdf(), request.getPassword());

            // Check if document is encrypted
            if (!document.isEncrypted()) {
                document.close();
                return PdfResponse.builder()
                        .message("The PDF is not password protected")
                        .success(false)
                        .build();
            }

            // Create a new document without encryption
            PDDocument unprotectedDoc = new PDDocument();

            // Copy all pages to the new document
            for (int i = 0; i < document.getNumberOfPages(); i++) {
                unprotectedDoc.addPage(document.getPage(i));
            }

            // Save the unprotected document
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            unprotectedDoc.save(outputStream);
            byte[] unprotectedContent = outputStream.toByteArray();

            // Clean up
            document.close();
            unprotectedDoc.close();
            outputStream.close();

            String outputFileName = request.getOutputPdfName();
            if (outputFileName == null || outputFileName.isEmpty()) {
                outputFileName = "unprotected.pdf";
            }

            return PdfResponse.builder()
                    .fileName(outputFileName)
                    .message("Password successfully removed from PDF")
                    .content(unprotectedContent)
                    .success(true)
                    .build();

        } catch (org.apache.pdfbox.pdmodel.encryption.InvalidPasswordException e) {
            logger.error("Invalid password for PDF file", e);
            return PdfResponse.builder()
                    .message("Invalid password: The password provided is incorrect")
                    .success(false)
                    .build();
        } catch (Exception e) {
            logger.error("Error removing password from PDF file", e);
            return PdfResponse.builder()
                    .message("Failed to remove password from PDF file: " + e.getMessage())
                    .success(false)
                    .build();
        }
    }

    public Map<String, byte[]> convertPdfToImages(PdfToImagesRequest request) {
        Map<String, byte[]> images = new HashMap<>();

        try {
            // Load PDF document
            PDDocument document = PDDocument.load(request.getPdf());

            // Calculate reasonable DPI value if not provided
            int dpi = request.getDpi();
            if (dpi <= 0) {
                dpi = 150; // Default DPI value
            }

            // Create PDF renderer
            PDFRenderer renderer = new PDFRenderer(document);

            // Convert each page to image
            for (int i = 0; i < document.getNumberOfPages(); i++) {
                // Render page as BufferedImage (using RGB colorspace)
                BufferedImage image = renderer.renderImageWithDPI(i, dpi, ImageType.RGB);

                // Convert BufferedImage to byte array (PNG format)
                ByteArrayOutputStream imageStream = new ByteArrayOutputStream();
                ImageIO.write(image, "png", imageStream);
                byte[] imageBytes = imageStream.toByteArray();

                // Use 1-based page numbers for the output filenames (more user-friendly)
                String fileName = String.format("page_%d.png", i + 1);
                images.put(fileName, imageBytes);

                // Clean up resources
                imageStream.close();
            }

            // Clean up
            document.close();

            return images;

        } catch (Exception e) {
            logger.error("Error converting PDF to images", e);
            // Return empty map in case of error
            return images;
        }
    }

    public PdfResponse rotatePdfPages(PdfRotatePagesRequest request) {
        try {
            // Load PDF document
            PDDocument document = PDDocument.load(request.getPdf());

            // Validate page numbers
            int totalPages = document.getNumberOfPages();
            for (Map.Entry<Integer, Integer> entry : request.getPageRotations().entrySet()) {
                Integer pageNum = entry.getKey();
                Integer rotation = entry.getValue();

                // Validate page number
                if (pageNum < 1 || pageNum > totalPages) {
                    document.close();
                    return PdfResponse.builder()
                            .message("Page number " + pageNum + " is out of range. Valid range is 1 to " + totalPages)
                            .success(false)
                            .build();
                }

                // Validate rotation angle
                if (rotation % 90 != 0) {
                    document.close();
                    return PdfResponse.builder()
                            .message("Rotation angle must be a multiple of 90 degrees")
                            .success(false)
                            .build();
                }

                // Apply rotation (PDFBox uses 0-based page indices)
                PDPage page = document.getPage(pageNum - 1);

                // Get the current rotation and add the new rotation
                int currentRotation = page.getRotation();
                int newRotation = (currentRotation + rotation) % 360;
                page.setRotation(newRotation);
            }

            // Save the document with rotated pages
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            document.save(outputStream);
            byte[] rotatedContent = outputStream.toByteArray();

            // Clean up
            document.close();
            outputStream.close();

            String outputFileName = request.getOutputPdfName();
            if (outputFileName == null || outputFileName.isEmpty()) {
                outputFileName = "rotated.pdf";
            }

            return PdfResponse.builder()
                    .fileName(outputFileName)
                    .message("Pages rotated successfully")
                    .content(rotatedContent)
                    .success(true)
                    .build();

        } catch (Exception e) {
            logger.error("Error rotating pages in PDF file", e);
            return PdfResponse.builder()
                    .message("Failed to rotate pages in PDF file: " + e.getMessage())
                    .success(false)
                    .build();
        }
    }

    public PdfResponse addWatermarkToPdf(PdfAddWatermarkRequest request) {
        try {
            // Load PDF document
            PDDocument document = PDDocument.load(request.getPdf());

            // Parse the color (hex format like #FF0000)
            String colorStr = request.getColor();
            if (colorStr == null || colorStr.isEmpty()) {
                colorStr = "#888888"; // Default color - gray
            }
            java.awt.Color color;
            try {
                color = java.awt.Color.decode(colorStr);
            } catch (NumberFormatException e) {
                color = new java.awt.Color(136, 136, 136); // Default gray if color parsing fails
            }

            // Setup font and opacity
            int fontSize = request.getFontSize();
            if (fontSize <= 0) {
                fontSize = 40; // Default font size
            }

            float opacity = request.getOpacity();
            if (opacity < 0 || opacity > 1) {
                opacity = 0.3f; // Default opacity
            }

            int rotation = request.getRotation();

            // Process each page
            for (PDPage page : document.getPages()) {
                // Page dimensions
                PDRectangle pageRect = page.getMediaBox();
                float pageWidth = pageRect.getWidth();
                float pageHeight = pageRect.getHeight();

                // Start a new content stream for adding the watermark
                PDPageContentStream contentStream = new PDPageContentStream(
                        document, page, PDPageContentStream.AppendMode.APPEND, true, true);

                // Set font and color
                PDFont font = PDType1Font.HELVETICA;
                contentStream.setFont(font, fontSize);
                contentStream.setNonStrokingColor(color);

                // Set the text rendering mode to fill with transparency
                contentStream.setRenderingMode(RenderingMode.FILL);

                // Calculate text dimensions
                float stringWidth = font.getStringWidth(request.getWatermarkText()) * fontSize / 1000f;

                // Apply watermark at center of page
                contentStream.beginText();

                // Set the text matrix for positioning and rotation
                // Move to center of page
                contentStream.setTextMatrix(
                        Matrix.getRotateInstance(
                                (float) Math.toRadians(rotation), // Rotation angle in radians
                                pageWidth / 2, // Center x
                                pageHeight / 2 // Center y
                        ));

                // Center the text
                contentStream.newLineAtOffset(-stringWidth / 2, 0);

                // Set transparency
                PDExtendedGraphicsState graphicsState = new PDExtendedGraphicsState();
                graphicsState.setNonStrokingAlphaConstant(opacity);
                contentStream.setGraphicsStateParameters(graphicsState);

                // Add the watermark text
                contentStream.showText(request.getWatermarkText());
                contentStream.endText();

                // Close the content stream
                contentStream.close();
            }

            // Save the watermarked document
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            document.save(outputStream);
            byte[] watermarkedContent = outputStream.toByteArray();

            // Clean up
            document.close();
            outputStream.close();

            String outputFileName = request.getOutputPdfName();
            if (outputFileName == null || outputFileName.isEmpty()) {
                outputFileName = "watermarked.pdf";
            }

            return PdfResponse.builder()
                    .fileName(outputFileName)
                    .message("Watermark added successfully")
                    .content(watermarkedContent)
                    .success(true)
                    .build();

        } catch (Exception e) {
            logger.error("Error adding watermark to PDF file", e);
            return PdfResponse.builder()
                    .message("Failed to add watermark to PDF file: " + e.getMessage())
                    .success(false)
                    .build();
        }
    }
}