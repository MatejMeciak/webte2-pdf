package com.pdf.backend.controller;

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
import com.pdf.backend.service.PdfService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;
import java.io.ByteArrayOutputStream;

@RestController
@RequestMapping("/api/pdf")
@RequiredArgsConstructor
@Tag(name = "PDF Operations", description = "PDF Processing API")
public class PdfController {

    private final PdfService pdfService;

    @Operation(summary = "Merge two PDF files", description = "Combines two PDF files into a single document", requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "PDF files to merge", required = true, content = @Content(mediaType = MediaType.MULTIPART_FORM_DATA_VALUE)))
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "PDFs merged successfully", content = @Content(mediaType = MediaType.APPLICATION_PDF_VALUE, schema = @Schema(type = "string", format = "binary"))),
            @ApiResponse(responseCode = "400", description = "Invalid request or PDF files", content = @Content(mediaType = MediaType.TEXT_PLAIN_VALUE, schema = @Schema(type = "string"))),
            @ApiResponse(responseCode = "401", description = "Unauthorized - authentication required", content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(type = "object"))),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content(mediaType = MediaType.TEXT_PLAIN_VALUE, schema = @Schema(type = "string")))
    })
    @PostMapping(value = "/merge", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> mergePdfFiles(
            @RequestPart(value = "firstPdf", required = true) MultipartFile firstPdf,
            @RequestPart(value = "secondPdf", required = true) MultipartFile secondPdf,
            @RequestPart(value = "outputName", required = false) String outputName) {

        try {
            // Validate files
            if (firstPdf.isEmpty() || secondPdf.isEmpty()) {
                return ResponseEntity.badRequest().body("PDF files cannot be empty");
            }

            // Check file types
            if (!firstPdf.getContentType().equals("application/pdf") ||
                    !secondPdf.getContentType().equals("application/pdf")) {
                return ResponseEntity.badRequest().body("Files must be PDF format");
            }

            // Prepare request
            PdfMergeRequest request = PdfMergeRequest.builder()
                    .firstPdfName(firstPdf.getOriginalFilename())
                    .secondPdfName(secondPdf.getOriginalFilename())
                    .outputPdfName(outputName != null && !outputName.isEmpty() ? outputName : "merged.pdf")
                    .firstPdf(firstPdf.getBytes())
                    .secondPdf(secondPdf.getBytes())
                    .build();

            // Process merge
            PdfResponse response = pdfService.mergePdfFiles(request);

            if (!response.isSuccess()) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(response.getMessage());
            }

            // Set up headers for file download
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", response.getFileName());

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(response.getContent());

        } catch (IOException e) {
            return ResponseEntity.badRequest().body("Error processing PDF files: " + e.getMessage());
        }
    }

    @Operation(summary = "Extract pages from PDF file", description = "Extracts pages from a PDF file based on specified page range", requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "PDF file to extract pages from and page range", required = true, content = @Content(mediaType = MediaType.MULTIPART_FORM_DATA_VALUE)))
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Pages extracted successfully", content = @Content(mediaType = MediaType.APPLICATION_PDF_VALUE, schema = @Schema(type = "string", format = "binary"))),
            @ApiResponse(responseCode = "400", description = "Invalid request, PDF file, or page range", content = @Content(mediaType = MediaType.TEXT_PLAIN_VALUE, schema = @Schema(type = "string"))),
            @ApiResponse(responseCode = "401", description = "Unauthorized - authentication required", content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(type = "object"))),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content(mediaType = MediaType.TEXT_PLAIN_VALUE, schema = @Schema(type = "string")))
    })
    @PostMapping(value = "/extract", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> extractPagesFromPdf(
            @RequestPart(value = "pdf", required = true) MultipartFile pdf,
            @RequestParam(value = "startPage", required = true) int startPage,
            @RequestParam(value = "endPage", required = true) int endPage,
            @RequestPart(value = "outputName", required = false) String outputName) {

        try {
            // Validate file
            if (pdf.isEmpty()) {
                return ResponseEntity.badRequest().body("PDF file cannot be empty");
            }

            // Check file type
            if (!pdf.getContentType().equals("application/pdf")) {
                return ResponseEntity.badRequest().body("File must be PDF format");
            }

            // Validate page range
            if (startPage < 1) {
                return ResponseEntity.badRequest().body("Start page must be 1 or greater");
            }

            if (endPage < startPage) {
                return ResponseEntity.badRequest().body("End page must be greater than or equal to start page");
            }

            // Prepare request
            PdfExtractPagesRequest request = PdfExtractPagesRequest.builder()
                    .pdfName(pdf.getOriginalFilename())
                    .startPage(startPage)
                    .endPage(endPage)
                    .outputPdfName(outputName != null && !outputName.isEmpty() ? outputName : "extracted.pdf")
                    .pdf(pdf.getBytes())
                    .build();

            // Process extraction
            PdfResponse response = pdfService.extractPagesFromPdf(request);

            if (!response.isSuccess()) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(response.getMessage());
            }

            // Set up headers for file download
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", response.getFileName());

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(response.getContent());

        } catch (IOException e) {
            return ResponseEntity.badRequest().body("Error processing PDF file: " + e.getMessage());
        }
    }

    @Operation(summary = "Split PDF file at specific page", description = "Splits a PDF file into two separate documents at the specified page", requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "PDF file to split and the page to split at", required = true, content = @Content(mediaType = MediaType.MULTIPART_FORM_DATA_VALUE)))
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "PDF split successfully", content = @Content(mediaType = MediaType.APPLICATION_OCTET_STREAM_VALUE, schema = @Schema(type = "string", format = "binary"))),
            @ApiResponse(responseCode = "400", description = "Invalid request, PDF file, or split page", content = @Content(mediaType = MediaType.TEXT_PLAIN_VALUE, schema = @Schema(type = "string"))),
            @ApiResponse(responseCode = "401", description = "Unauthorized - authentication required", content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(type = "object"))),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content(mediaType = MediaType.TEXT_PLAIN_VALUE, schema = @Schema(type = "string")))
    })
    @PostMapping(value = "/split", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> splitPdfAtPage(
            @RequestPart(value = "pdf", required = true) MultipartFile pdf,
            @RequestParam(value = "splitAtPage", required = true) int splitAtPage,
            @RequestPart(value = "firstOutputName", required = false) String firstOutputName,
            @RequestPart(value = "secondOutputName", required = false) String secondOutputName) {

        try {
            // Validate file
            if (pdf.isEmpty()) {
                return ResponseEntity.badRequest().body("PDF file cannot be empty");
            }

            // Check file type
            if (!pdf.getContentType().equals("application/pdf")) {
                return ResponseEntity.badRequest().body("File must be PDF format");
            }

            // Validate split page
            if (splitAtPage < 1) {
                return ResponseEntity.badRequest().body("Split page must be 1 or greater");
            }

            // Prepare request
            PdfSplitAtPageRequest request = PdfSplitAtPageRequest.builder()
                    .pdfName(pdf.getOriginalFilename())
                    .splitAtPage(splitAtPage)
                    .firstOutputName(
                            firstOutputName != null && !firstOutputName.isEmpty() ? firstOutputName : "part1.pdf")
                    .secondOutputName(
                            secondOutputName != null && !secondOutputName.isEmpty() ? secondOutputName : "part2.pdf")
                    .pdf(pdf.getBytes())
                    .build();

            // Process split
            Map<String, PdfResponse> responses = pdfService.splitPdfAtPage(request);

            if (responses.containsKey("error")) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(responses.get("error").getMessage());
            }

            // Create a ZIP file containing both PDF parts
            ByteArrayOutputStream zipByteOutputStream = new ByteArrayOutputStream();
            try (ZipOutputStream zipOutputStream = new ZipOutputStream(zipByteOutputStream)) {
                // Add first part
                PdfResponse firstPart = responses.get("first");
                zipOutputStream.putNextEntry(new ZipEntry(firstPart.getFileName()));
                zipOutputStream.write(firstPart.getContent());
                zipOutputStream.closeEntry();

                // Add second part
                PdfResponse secondPart = responses.get("second");
                zipOutputStream.putNextEntry(new ZipEntry(secondPart.getFileName()));
                zipOutputStream.write(secondPart.getContent());
                zipOutputStream.closeEntry();
            }

            // Set up headers for ZIP file download
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            String baseName = pdf.getOriginalFilename();
            if (baseName != null && baseName.endsWith(".pdf")) {
                baseName = baseName.substring(0, baseName.length() - 4);
            } else {
                baseName = "split";
            }
            headers.setContentDispositionFormData("attachment", baseName + "_split.zip");

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(zipByteOutputStream.toByteArray());

        } catch (IOException e) {
            return ResponseEntity.badRequest().body("Error processing PDF file: " + e.getMessage());
        }
    }

    @Operation(summary = "Remove page from PDF file", description = "Removes a specific page from a PDF document", requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "PDF file and page number to remove", required = true, content = @Content(mediaType = MediaType.MULTIPART_FORM_DATA_VALUE)))
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Page removed successfully", content = @Content(mediaType = MediaType.APPLICATION_PDF_VALUE, schema = @Schema(type = "string", format = "binary"))),
            @ApiResponse(responseCode = "400", description = "Invalid request, PDF file, or page number", content = @Content(mediaType = MediaType.TEXT_PLAIN_VALUE, schema = @Schema(type = "string"))),
            @ApiResponse(responseCode = "401", description = "Unauthorized - authentication required", content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(type = "object"))),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content(mediaType = MediaType.TEXT_PLAIN_VALUE, schema = @Schema(type = "string")))
    })
    @PostMapping(value = "/remove-page", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> removePageFromPdf(
            @RequestPart(value = "pdf", required = true) MultipartFile pdf,
            @RequestParam(value = "pageToRemove", required = true) int pageToRemove,
            @RequestPart(value = "outputName", required = false) String outputName) {

        try {
            // Validate file
            if (pdf.isEmpty()) {
                return ResponseEntity.badRequest().body("PDF file cannot be empty");
            }

            // Check file type
            if (!pdf.getContentType().equals("application/pdf")) {
                return ResponseEntity.badRequest().body("File must be PDF format");
            }

            // Validate page number
            if (pageToRemove < 1) {
                return ResponseEntity.badRequest().body("Page number must be 1 or greater");
            }

            // Prepare request
            PdfRemovePageRequest request = PdfRemovePageRequest.builder()
                    .pdfName(pdf.getOriginalFilename())
                    .pageToRemove(pageToRemove)
                    .outputPdfName(outputName != null && !outputName.isEmpty() ? outputName : "modified.pdf")
                    .pdf(pdf.getBytes())
                    .build();

            // Process page removal
            PdfResponse response = pdfService.removePageFromPdf(request);

            if (!response.isSuccess()) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(response.getMessage());
            }

            // Set up headers for file download
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", response.getFileName());

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(response.getContent());

        } catch (IOException e) {
            return ResponseEntity.badRequest().body("Error processing PDF file: " + e.getMessage());
        }
    }

    @Operation(summary = "Reorder pages in PDF file", description = "Reorganizes pages in a PDF document based on specified order", requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "PDF file and new page order", required = true, content = @Content(mediaType = MediaType.MULTIPART_FORM_DATA_VALUE)))
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Pages reordered successfully", content = @Content(mediaType = MediaType.APPLICATION_PDF_VALUE, schema = @Schema(type = "string", format = "binary"))),
            @ApiResponse(responseCode = "400", description = "Invalid request, PDF file, or page order", content = @Content(mediaType = MediaType.TEXT_PLAIN_VALUE, schema = @Schema(type = "string"))),
            @ApiResponse(responseCode = "401", description = "Unauthorized - authentication required", content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(type = "object"))),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content(mediaType = MediaType.TEXT_PLAIN_VALUE, schema = @Schema(type = "string")))
    })
    @PostMapping(value = "/reorder", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> reorderPdfPages(
            @RequestPart(value = "pdf", required = true) MultipartFile pdf,
            @RequestParam(value = "pageOrder", required = true) List<Integer> pageOrder,
            @RequestPart(value = "outputName", required = false) String outputName) {

        try {
            // Validate file
            if (pdf.isEmpty()) {
                return ResponseEntity.badRequest().body("PDF file cannot be empty");
            }

            // Check file type
            if (!pdf.getContentType().equals("application/pdf")) {
                return ResponseEntity.badRequest().body("File must be PDF format");
            }

            // Validate page order
            if (pageOrder == null || pageOrder.isEmpty()) {
                return ResponseEntity.badRequest().body("Page order list cannot be empty");
            }

            // Prepare request
            PdfReorderPagesRequest request = PdfReorderPagesRequest.builder()
                    .pdfName(pdf.getOriginalFilename())
                    .pageOrder(pageOrder)
                    .outputPdfName(outputName != null && !outputName.isEmpty() ? outputName : "reordered.pdf")
                    .pdf(pdf.getBytes())
                    .build();

            // Process page reordering
            PdfResponse response = pdfService.reorderPdfPages(request);

            if (!response.isSuccess()) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(response.getMessage());
            }

            // Set up headers for file download
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", response.getFileName());

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(response.getContent());

        } catch (IOException e) {
            return ResponseEntity.badRequest().body("Error processing PDF file: " + e.getMessage());
        }
    }

    @Operation(summary = "Add password to PDF file", description = "Encrypts a PDF file with a password", requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "PDF file and password to set", required = true, content = @Content(mediaType = MediaType.MULTIPART_FORM_DATA_VALUE)))
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Password added successfully", content = @Content(mediaType = MediaType.APPLICATION_PDF_VALUE, schema = @Schema(type = "string", format = "binary"))),
            @ApiResponse(responseCode = "400", description = "Invalid request or PDF file", content = @Content(mediaType = MediaType.TEXT_PLAIN_VALUE, schema = @Schema(type = "string"))),
            @ApiResponse(responseCode = "401", description = "Unauthorized - authentication required", content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(type = "object"))),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content(mediaType = MediaType.TEXT_PLAIN_VALUE, schema = @Schema(type = "string")))
    })
    @PostMapping(value = "/add-password", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> addPasswordToPdf(
            @RequestPart(value = "pdf", required = true) MultipartFile pdf,
            @RequestParam(value = "password", required = true) String password,
            @RequestPart(value = "outputName", required = false) String outputName) {

        try {
            // Validate file
            if (pdf.isEmpty()) {
                return ResponseEntity.badRequest().body("PDF file cannot be empty");
            }

            // Check file type
            if (!pdf.getContentType().equals("application/pdf")) {
                return ResponseEntity.badRequest().body("File must be PDF format");
            }

            // Validate password
            if (password == null || password.isEmpty()) {
                return ResponseEntity.badRequest().body("Password cannot be empty");
            }

            // Prepare request
            PdfAddPasswordRequest request = PdfAddPasswordRequest.builder()
                    .pdfName(pdf.getOriginalFilename())
                    .ownerPassword(password)
                    .outputPdfName(outputName != null && !outputName.isEmpty() ? outputName : "protected.pdf")
                    .pdf(pdf.getBytes())
                    .build();

            // Process password protection
            PdfResponse response = pdfService.addPasswordToPdf(request);

            if (!response.isSuccess()) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(response.getMessage());
            }

            // Set up headers for file download
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", response.getFileName());

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(response.getContent());

        } catch (IOException e) {
            return ResponseEntity.badRequest().body("Error processing PDF file: " + e.getMessage());
        }
    }

    @Operation(summary = "Remove password from PDF file", description = "Removes password protection from a PDF file", requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "PDF file and its password", required = true, content = @Content(mediaType = MediaType.MULTIPART_FORM_DATA_VALUE)))
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Password removed successfully", content = @Content(mediaType = MediaType.APPLICATION_PDF_VALUE, schema = @Schema(type = "string", format = "binary"))),
            @ApiResponse(responseCode = "400", description = "Invalid request, PDF file, or password", content = @Content(mediaType = MediaType.TEXT_PLAIN_VALUE, schema = @Schema(type = "string"))),
            @ApiResponse(responseCode = "401", description = "Unauthorized - authentication required", content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(type = "object"))),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content(mediaType = MediaType.TEXT_PLAIN_VALUE, schema = @Schema(type = "string")))
    })
    @PostMapping(value = "/remove-password", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> removePasswordFromPdf(
            @RequestPart(value = "pdf", required = true) MultipartFile pdf,
            @RequestParam(value = "password", required = true) String password,
            @RequestPart(value = "outputName", required = false) String outputName) {

        try {
            // Validate file
            if (pdf.isEmpty()) {
                return ResponseEntity.badRequest().body("PDF file cannot be empty");
            }

            // Check file type
            if (!pdf.getContentType().equals("application/pdf")) {
                return ResponseEntity.badRequest().body("File must be PDF format");
            }

            // Validate password
            if (password == null || password.isEmpty()) {
                return ResponseEntity.badRequest().body("Password cannot be empty");
            }

            // Prepare request
            PdfRemovePasswordRequest request = PdfRemovePasswordRequest.builder()
                    .pdfName(pdf.getOriginalFilename())
                    .password(password)
                    .outputPdfName(outputName != null && !outputName.isEmpty() ? outputName : "unprotected.pdf")
                    .pdf(pdf.getBytes())
                    .build();

            // Process password removal
            PdfResponse response = pdfService.removePasswordFromPdf(request);

            if (!response.isSuccess()) {
                // Check if the error message indicates an invalid password
                if (response.getMessage() != null && response.getMessage().toLowerCase().contains("invalid password")) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(response.getMessage());
                } else {
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .body(response.getMessage());
                }
            }

            // Set up headers for file download
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", response.getFileName());

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(response.getContent());

        } catch (IOException e) {
            return ResponseEntity.badRequest().body("Error processing PDF file: " + e.getMessage());
        }
    }

    @Operation(summary = "Convert PDF to images", description = "Converts each page of a PDF file to PNG images", requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "PDF file to convert", required = true, content = @Content(mediaType = MediaType.MULTIPART_FORM_DATA_VALUE)))
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "PDF converted to images successfully", content = @Content(mediaType = MediaType.APPLICATION_OCTET_STREAM_VALUE, schema = @Schema(type = "string", format = "binary"))),
            @ApiResponse(responseCode = "400", description = "Invalid request or PDF file", content = @Content(mediaType = MediaType.TEXT_PLAIN_VALUE, schema = @Schema(type = "string"))),
            @ApiResponse(responseCode = "401", description = "Unauthorized - authentication required", content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(type = "object"))),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content(mediaType = MediaType.TEXT_PLAIN_VALUE, schema = @Schema(type = "string")))
    })
    @PostMapping(value = "/to-images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> convertPdfToImages(
            @RequestPart(value = "pdf", required = true) MultipartFile pdf,
            @RequestParam(value = "dpi", required = false, defaultValue = "150") int dpi) {

        try {
            // Validate file
            if (pdf.isEmpty()) {
                return ResponseEntity.badRequest().body("PDF file cannot be empty");
            }

            // Check file type
            if (!pdf.getContentType().equals("application/pdf")) {
                return ResponseEntity.badRequest().body("File must be PDF format");
            }

            // Validate DPI
            if (dpi <= 0) {
                dpi = 150; // Use default if invalid
            }

            // Prepare request
            PdfToImagesRequest request = PdfToImagesRequest.builder()
                    .pdfName(pdf.getOriginalFilename())
                    .dpi(dpi)
                    .pdf(pdf.getBytes())
                    .build();

            // Process conversion
            Map<String, byte[]> images = pdfService.convertPdfToImages(request);

            if (images.isEmpty()) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Failed to convert PDF to images");
            }

            // Create a ZIP file containing all images
            ByteArrayOutputStream zipByteOutputStream = new ByteArrayOutputStream();
            try (ZipOutputStream zipOutputStream = new ZipOutputStream(zipByteOutputStream)) {
                // Add each image to the ZIP
                for (Map.Entry<String, byte[]> entry : images.entrySet()) {
                    zipOutputStream.putNextEntry(new ZipEntry(entry.getKey()));
                    zipOutputStream.write(entry.getValue());
                    zipOutputStream.closeEntry();
                }
            }

            // Get base name for the output ZIP file
            String baseName = pdf.getOriginalFilename();
            if (baseName != null && baseName.endsWith(".pdf")) {
                baseName = baseName.substring(0, baseName.length() - 4);
            } else {
                baseName = "pdf";
            }

            // Set up headers for ZIP file download
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment", baseName + "_images.zip");

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(zipByteOutputStream.toByteArray());

        } catch (IOException e) {
            return ResponseEntity.badRequest().body("Error processing PDF file: " + e.getMessage());
        }
    }

    @Operation(summary = "Rotate PDF pages", description = "Rotates specific pages in a PDF document", requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "PDF file and page rotation details", required = true, content = @Content(mediaType = MediaType.MULTIPART_FORM_DATA_VALUE)))
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Pages rotated successfully", content = @Content(mediaType = MediaType.APPLICATION_PDF_VALUE, schema = @Schema(type = "string", format = "binary"))),
            @ApiResponse(responseCode = "400", description = "Invalid request, PDF file, or rotation parameters", content = @Content(mediaType = MediaType.TEXT_PLAIN_VALUE, schema = @Schema(type = "string"))),
            @ApiResponse(responseCode = "401", description = "Unauthorized - authentication required", content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(type = "object"))),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content(mediaType = MediaType.TEXT_PLAIN_VALUE, schema = @Schema(type = "string")))
    })
    @PostMapping(value = "/rotate", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> rotatePdfPages(
            @RequestPart(value = "pdf", required = true) MultipartFile pdf,
            @RequestParam(value = "pages") List<Integer> pages,
            @RequestParam(value = "rotations") List<Integer> rotations,
            @RequestPart(value = "outputName", required = false) String outputName) {

        try {
            // Validate file
            if (pdf.isEmpty()) {
                return ResponseEntity.badRequest().body("PDF file cannot be empty");
            }

            // Check file type
            if (!pdf.getContentType().equals("application/pdf")) {
                return ResponseEntity.badRequest().body("File must be PDF format");
            }

            // Validate pages and rotations lists
            if (pages == null || pages.isEmpty()) {
                return ResponseEntity.badRequest().body("Page list cannot be empty");
            }

            if (rotations == null || rotations.isEmpty()) {
                return ResponseEntity.badRequest().body("Rotation list cannot be empty");
            }

            if (pages.size() != rotations.size()) {
                return ResponseEntity.badRequest().body("Number of pages and rotations must match");
            }

            // Create a map of page numbers to rotation angles
            Map<Integer, Integer> pageRotations = new HashMap<>();
            for (int i = 0; i < pages.size(); i++) {
                pageRotations.put(pages.get(i), rotations.get(i));
            }

            // Prepare request
            PdfRotatePagesRequest request = PdfRotatePagesRequest.builder()
                    .pdfName(pdf.getOriginalFilename())
                    .pageRotations(pageRotations)
                    .outputPdfName(outputName != null && !outputName.isEmpty() ? outputName : "rotated.pdf")
                    .pdf(pdf.getBytes())
                    .build();

            // Process page rotation
            PdfResponse response = pdfService.rotatePdfPages(request);

            if (!response.isSuccess()) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(response.getMessage());
            }

            // Set up headers for file download
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", response.getFileName());

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(response.getContent());

        } catch (IOException e) {
            return ResponseEntity.badRequest().body("Error processing PDF file: " + e.getMessage());
        }
    }

    @Operation(summary = "Add watermark to PDF", description = "Adds a text watermark to each page of a PDF document", requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "PDF file and watermark details", required = true, content = @Content(mediaType = MediaType.MULTIPART_FORM_DATA_VALUE)))
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Watermark added successfully", content = @Content(mediaType = MediaType.APPLICATION_PDF_VALUE, schema = @Schema(type = "string", format = "binary"))),
            @ApiResponse(responseCode = "400", description = "Invalid request or PDF file", content = @Content(mediaType = MediaType.TEXT_PLAIN_VALUE, schema = @Schema(type = "string"))),
            @ApiResponse(responseCode = "401", description = "Unauthorized - authentication required", content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(type = "object"))),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content(mediaType = MediaType.TEXT_PLAIN_VALUE, schema = @Schema(type = "string")))
    })
    @PostMapping(value = "/add-watermark", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> addWatermarkToPdf(
            @RequestPart(value = "pdf", required = true) MultipartFile pdf,
            @RequestParam(value = "watermarkText", required = true) String watermarkText,
            @RequestParam(value = "opacity", required = false, defaultValue = "0.3") float opacity,
            @RequestParam(value = "fontSize", required = false, defaultValue = "40") int fontSize,
            @RequestParam(value = "color", required = false, defaultValue = "#888888") String color,
            @RequestParam(value = "rotation", required = false, defaultValue = "45") int rotation,
            @RequestPart(value = "outputName", required = false) String outputName) {

        try {
            // Validate file
            if (pdf.isEmpty()) {
                return ResponseEntity.badRequest().body("PDF file cannot be empty");
            }

            // Check file type
            if (!pdf.getContentType().equals("application/pdf")) {
                return ResponseEntity.badRequest().body("File must be PDF format");
            }

            // Validate watermark text
            if (watermarkText == null || watermarkText.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Watermark text cannot be empty");
            }

            // Validate opacity
            if (opacity < 0 || opacity > 1) {
                return ResponseEntity.badRequest().body("Opacity must be between 0.0 and 1.0");
            }

            // Prepare request
            PdfAddWatermarkRequest request = PdfAddWatermarkRequest.builder()
                    .pdfName(pdf.getOriginalFilename())
                    .watermarkText(watermarkText)
                    .opacity(opacity)
                    .fontSize(fontSize)
                    .color(color)
                    .rotation(rotation)
                    .outputPdfName(outputName != null && !outputName.isEmpty() ? outputName : "watermarked.pdf")
                    .pdf(pdf.getBytes())
                    .build();

            // Process watermark addition
            PdfResponse response = pdfService.addWatermarkToPdf(request);

            if (!response.isSuccess()) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(response.getMessage());
            }

            // Set up headers for file download
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", response.getFileName());

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(response.getContent());

        } catch (IOException e) {
            return ResponseEntity.badRequest().body("Error processing PDF file: " + e.getMessage());
        }
    }
}