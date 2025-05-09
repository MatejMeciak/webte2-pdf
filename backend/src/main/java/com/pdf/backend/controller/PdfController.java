package com.pdf.backend.controller;

import com.pdf.backend.dto.pdf.PdfExtractPagesRequest;
import com.pdf.backend.dto.pdf.PdfMergeRequest;
import com.pdf.backend.dto.pdf.PdfRemovePageRequest;
import com.pdf.backend.dto.pdf.PdfReorderPagesRequest;
import com.pdf.backend.dto.pdf.PdfResponse;
import com.pdf.backend.dto.pdf.PdfSplitAtPageRequest;
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
}