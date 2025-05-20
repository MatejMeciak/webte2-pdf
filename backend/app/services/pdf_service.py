import io
import fitz  # PyMuPDF
from pypdf import PdfReader, PdfWriter, PdfMerger, PageObject
from typing import Dict, List, Any, Tuple, Optional
from PIL import Image, ImageDraw, ImageFont
import re
import os
from datetime import datetime

from app.schemas.pdf import (
    PdfResponse,
    PdfMergeRequest,
    PdfExtractPagesRequest,
    PdfSplitAtPageRequest,
    PdfRemovePageRequest,
    PdfReorderPagesRequest,
    PdfAddPasswordRequest,
    PdfRemovePasswordRequest,
    PdfToImagesRequest,
    PdfRotatePagesRequest,
    PdfAddWatermarkRequest
)

class PdfService:
    def merge_pdf_files(self, request: PdfMergeRequest) -> PdfResponse:
        """
        Merge two PDF files into one
        """
        try:
            # Create PDF merger
            merger = PdfMerger()

            # Add source PDFs
            first_pdf_stream = io.BytesIO(request.first_pdf)
            second_pdf_stream = io.BytesIO(request.second_pdf)

            merger.append(first_pdf_stream)
            merger.append(second_pdf_stream)

            # Write to BytesIO buffer
            output_stream = io.BytesIO()
            merger.write(output_stream)
            merger.close()

            # Get the merged content
            output_stream.seek(0)
            merged_content = output_stream.getvalue()

            return PdfResponse(
                file_name=request.output_pdf_name,
                message="PDF files merged successfully",
                content=merged_content,
                success=True
            )

        except Exception as e:
            return PdfResponse(
                file_name="",
                message=f"Failed to merge PDF files: {str(e)}",
                success=False
            )

    def extract_pages_from_pdf(self, request: PdfExtractPagesRequest) -> PdfResponse:
        """
        Extract a range of pages from a PDF file
        """
        try:
            # Load PDF document
            reader = PdfReader(io.BytesIO(request.pdf))
            writer = PdfWriter()

            # Validate page range
            total_pages = len(reader.pages)
            if request.start_page > total_pages:
                return PdfResponse(
                    file_name="",
                    message=f"Start page {request.start_page} exceeds the number of pages in the document ({total_pages})",
                    success=False
                )

            # Adjust end page if needed
            end_page = min(request.end_page, total_pages)
            
            # PDFReader uses 0-based indexing for pages
            for i in range(request.start_page - 1, end_page):
                writer.add_page(reader.pages[i])

            # Save to BytesIO buffer
            output_stream = io.BytesIO()
            writer.write(output_stream)
            
            # Get the extracted content
            output_stream.seek(0)
            extracted_content = output_stream.getvalue()

            return PdfResponse(
                file_name=request.output_pdf_name,
                message=f"Pages {request.start_page} to {end_page} extracted successfully",
                content=extracted_content,
                success=True
            )

        except Exception as e:
            return PdfResponse(
                file_name="",
                message=f"Failed to extract pages from PDF: {str(e)}",
                success=False
            )

    def split_pdf_at_page(self, request: PdfSplitAtPageRequest) -> Dict[str, PdfResponse]:
        """
        Split a PDF file at a specific page into two separate documents
        """
        try:
            # Load PDF document
            reader = PdfReader(io.BytesIO(request.pdf))
            first_writer = PdfWriter()
            second_writer = PdfWriter()

            # Validate page range
            total_pages = len(reader.pages)
            if request.split_at_page > total_pages:
                return {"error": PdfResponse(
                    file_name="",
                    message=f"Split page {request.split_at_page} exceeds the number of pages in the document ({total_pages})",
                    success=False
                )}

            # Add pages to first document (1 to split_at_page)
            for i in range(0, request.split_at_page):
                first_writer.add_page(reader.pages[i])

            # Add pages to second document (split_at_page+1 to end)
            for i in range(request.split_at_page, total_pages):
                second_writer.add_page(reader.pages[i])

            # Save first part
            first_output = io.BytesIO()
            first_writer.write(first_output)
            first_output.seek(0)
            first_content = first_output.getvalue()

            # Save second part
            second_output = io.BytesIO()
            second_writer.write(second_output)
            second_output.seek(0)
            second_content = second_output.getvalue()

            return {
                "first": PdfResponse(
                    file_name=request.first_output_name,
                    message="First part of split PDF",
                    content=first_content,
                    success=True
                ),
                "second": PdfResponse(
                    file_name=request.second_output_name,
                    message="Second part of split PDF",
                    content=second_content,
                    success=True
                )
            }

        except Exception as e:
            return {"error": PdfResponse(
                file_name="",
                message=f"Failed to split PDF: {str(e)}",
                success=False
            )}

    def remove_page_from_pdf(self, request: PdfRemovePageRequest) -> PdfResponse:
        """
        Remove a specific page from a PDF file
        """
        try:
            # Load PDF document
            reader = PdfReader(io.BytesIO(request.pdf))
            writer = PdfWriter()

            # Validate page number
            total_pages = len(reader.pages)
            if request.page_to_remove > total_pages:
                return PdfResponse(
                    file_name="",
                    message=f"Page {request.page_to_remove} exceeds the number of pages in the document ({total_pages})",
                    success=False
                )

            # Add all pages except the one to remove
            for i in range(total_pages):
                if i != (request.page_to_remove - 1):  # Adjust for 0-based indexing
                    writer.add_page(reader.pages[i])

            # Save to BytesIO buffer
            output_stream = io.BytesIO()
            writer.write(output_stream)
            
            # Get the modified content
            output_stream.seek(0)
            modified_content = output_stream.getvalue()

            return PdfResponse(
                file_name=request.output_pdf_name,
                message=f"Page {request.page_to_remove} removed successfully",
                content=modified_content,
                success=True
            )

        except Exception as e:
            return PdfResponse(
                file_name="",
                message=f"Failed to remove page from PDF: {str(e)}",
                success=False
            )

    def reorder_pdf_pages(self, request: PdfReorderPagesRequest) -> PdfResponse:
        """
        Reorder pages in a PDF file according to specified order
        """
        try:
            # Load PDF document
            reader = PdfReader(io.BytesIO(request.pdf))
            writer = PdfWriter()

            # Validate page order
            total_pages = len(reader.pages)
            for page_num in request.page_order:
                if page_num < 1 or page_num > total_pages:
                    return PdfResponse(
                        file_name="",
                        message=f"Invalid page number {page_num} in page order. Document has {total_pages} pages.",
                        success=False
                    )

            # Add pages in the specified order
            for page_num in request.page_order:
                writer.add_page(reader.pages[page_num - 1])  # Adjust for 0-based indexing

            # Save to BytesIO buffer
            output_stream = io.BytesIO()
            writer.write(output_stream)
            
            # Get the reordered content
            output_stream.seek(0)
            reordered_content = output_stream.getvalue()

            return PdfResponse(
                file_name=request.output_pdf_name,
                message="PDF pages reordered successfully",
                content=reordered_content,
                success=True
            )

        except Exception as e:
            return PdfResponse(
                file_name="",
                message=f"Failed to reorder PDF pages: {str(e)}",
                success=False
            )

    def add_password_to_pdf(self, request: PdfAddPasswordRequest) -> PdfResponse:
        """
        Add password protection to a PDF file
        """
        try:
            # Load PDF document with PyMuPDF for better encryption support
            doc = fitz.open(stream=request.pdf, filetype="pdf")
            
            # Create a BytesIO buffer for the output
            output_buffer = io.BytesIO()
            
            # Set password and save directly to the buffer
            doc.save(
                output_buffer,
                encryption=fitz.PDF_ENCRYPT_AES_256,
                owner_pw=request.owner_password,
                user_pw=request.owner_password  # Using same password for both
            )
            
            # Close the original document
            doc.close()
            
            # Get the encrypted content from the buffer
            output_buffer.seek(0)
            encrypted_bytes = output_buffer.getvalue()
            
            return PdfResponse(
                file_name=request.output_pdf_name,
                message="Password added successfully",
                content=encrypted_bytes,
                success=True
            )

        except Exception as e:
            return PdfResponse(
                file_name="",
                message=f"Failed to add password to PDF: {str(e)}",
                success=False
            )

    def remove_password_from_pdf(self, request: PdfRemovePasswordRequest) -> PdfResponse:
        """
        Remove password protection from a PDF file
        """
        try:
            # Load PDF document with PyMuPDF
            doc = fitz.open(stream=request.pdf, filetype="pdf")
            
            # Check if document is encrypted
            if not doc.is_encrypted:
                return PdfResponse(
                    file_name="",
                    message="Document is not password protected",
                    success=False
                )
                
            # Try to authenticate with the provided password
            if not doc.authenticate(request.password):
                return PdfResponse(
                    file_name="",
                    message="Invalid password",
                    success=False
                )
            
            # Create a new document without encryption
            doc.save(
                request.output_pdf_name,
                encryption=fitz.PDF_ENCRYPT_NONE
            )
            
            # Get the unencrypted content
            output_bytes = doc.tobytes()
            
            return PdfResponse(
                file_name=request.output_pdf_name,
                message="Password removed successfully",
                content=output_bytes,
                success=True
            )

        except Exception as e:
            return PdfResponse(
                file_name="",
                message=f"Failed to remove password from PDF: {str(e)}",
                success=False
            )

    def convert_pdf_to_images(self, request: PdfToImagesRequest) -> Dict[str, bytes]:
        """
        Convert each page of a PDF to PNG images
        """
        try:
            result = {}
            
            # Load PDF document with PyMuPDF
            doc = fitz.open(stream=request.pdf, filetype="pdf")
            
            # Get base name for images
            base_name = request.pdf_name
            if base_name.lower().endswith(".pdf"):
                base_name = base_name[:-4]
            
            # Process each page
            for page_num in range(len(doc)):
                page = doc.load_page(page_num)
                
                # Get the pixmap (image) for the page
                pix = page.get_pixmap(dpi=request.dpi)
                
                # Convert to PIL Image
                img_data = pix.tobytes("png")
                
                # Create image filename
                img_name = f"{base_name}_page_{page_num + 1}.png"
                
                # Add to result
                result[img_name] = img_data
            
            return result

        except Exception as e:
            print(f"Error converting PDF to images: {str(e)}")
            return {}

    def rotate_pdf_pages(self, request: PdfRotatePagesRequest) -> PdfResponse:
        """
        Rotate specific pages in a PDF file by specified angles
        """
        try:
            # Load PDF document
            doc = fitz.open(stream=request.pdf, filetype="pdf")
            
            # Validate page numbers
            total_pages = len(doc)
            for page_num in request.page_rotations.keys():
                if page_num < 1 or page_num > total_pages:
                    return PdfResponse(
                        file_name="",
                        message=f"Invalid page number {page_num}. Document has {total_pages} pages.",
                        success=False
                    )
            
            # Rotate each specified page
            for page_num, rotation in request.page_rotations.items():
                # PyMuPDF uses 0-based indexing
                page = doc.load_page(page_num - 1)
                
                # Get current rotation
                current_rotation = page.rotation
                
                # Apply new rotation (must be multiple of 90)
                rotation = (rotation // 90) * 90  # Round to nearest 90 degrees
                page.set_rotation(current_rotation + rotation)
            
            # Save the document
            doc.save(request.output_pdf_name)
            
            # Get the rotated content
            output_bytes = doc.tobytes()
            
            return PdfResponse(
                file_name=request.output_pdf_name,
                message="PDF pages rotated successfully",
                content=output_bytes,
                success=True
            )

        except Exception as e:
            return PdfResponse(
                file_name="",
                message=f"Failed to rotate PDF pages: {str(e)}",
                success=False
            )

    def add_watermark_to_pdf(self, request: PdfAddWatermarkRequest) -> PdfResponse:
        """
        Add a text watermark to each page of a PDF file.
        Simple version with basic positioning in the center of the page.
        """
        try:
            # Load PDF document
            doc = fitz.open(stream=request.pdf, filetype="pdf")
            
            # Process each page
            for page_num in range(len(doc)):
                page = doc.load_page(page_num)
                
                # Get page dimensions
                rect = page.rect
                
                # Use center position and basic gray color
                x = rect.width / 2
                y = rect.height / 2
                
                # Create a watermark using the page's annotation method
                # This is the most basic and reliable way to add text to a PDF
                page.insert_text(
                    point=(x, y),
                    text=request.watermark_text,
                    fontsize=40,
                    color=(0.5, 0.5, 0.5),  # Gray color
                    fill_opacity=0.3,       # 30% opacity for transparency
                    )
            
            # Save the document to a BytesIO buffer
            output_buffer = io.BytesIO()
            doc.save(output_buffer)
            doc.close()
            
            # Get the watermarked content
            output_buffer.seek(0)
            output_bytes = output_buffer.getvalue()
            
            return PdfResponse(
                file_name=request.output_pdf_name,
                message="Watermark added successfully",
                content=output_bytes,
                success=True
            )

        except Exception as e:
            return PdfResponse(
                file_name="",
                message=f"Failed to add watermark to PDF: {str(e)}",
                success=False
            )