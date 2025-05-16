import io
import zipfile
from typing import List, Optional
from fastapi import APIRouter, Depends, File, Form, UploadFile, HTTPException, status, Request
from fastapi.responses import Response, StreamingResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User, Role
from app.services.pdf_service import PdfService
from app.services.history_service import HistoryService
from app.utils.dependencies import get_current_active_user, get_current_user_with_roles
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

router = APIRouter(tags=["PDF Operations"])
pdf_service = PdfService()
history_service = HistoryService()

def determine_source_type(request: Request) -> str:
    """Helper method to determine if the request is coming from the frontend or API"""
    source_type = request.headers.get("X-Source-Type")
    return source_type if source_type else "API"

@router.post("/merge")
async def merge_pdf_files(
    first_pdf: UploadFile = File(...),
    second_pdf: UploadFile = File(...),
    output_name: Optional[str] = Form(None),
    request: Request = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_with_roles([Role.USER, Role.ADMIN]))
):
    """
    Merge two PDF files into a single document
    """
    try:
        # Validate files
        if first_pdf.content_type != "application/pdf" or second_pdf.content_type != "application/pdf":
            raise HTTPException(status_code=400, detail="Files must be PDF format")
        
        # Read file contents
        first_content = await first_pdf.read()
        second_content = await second_pdf.read()
        
        if not first_content or not second_content:
            raise HTTPException(status_code=400, detail="PDF files cannot be empty")
        
        # Use default output name if not provided
        final_output_name = output_name if output_name else "merged.pdf"
        
        # Create merge request
        merge_request = PdfMergeRequest(
            first_pdf_name=first_pdf.filename,
            second_pdf_name=second_pdf.filename,
            output_pdf_name=final_output_name,
            first_pdf=first_content,
            second_pdf=second_content
        )
        
        # Process merge
        result = pdf_service.merge_pdf_files(merge_request)
        
        # Track operation
        request_details = f"Merged files: {first_pdf.filename} and {second_pdf.filename} into {final_output_name}"
        history_service.track_operation(
            db=db,
            operation_type="MERGE_PDF",
            source_type=determine_source_type(request),
            request_details=request_details,
            user_id=current_user.id,
            request=request
        )
        
        if not result.success:
            raise HTTPException(status_code=500, detail=result.message)
        
        # Return the merged PDF
        return StreamingResponse(
            io.BytesIO(result.content),
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{result.file_name}"'}
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing PDF files: {str(e)}")

@router.post("/extract")
async def extract_pages_from_pdf(
    pdf: UploadFile = File(...),
    start_page: int = Form(...),
    end_page: int = Form(...),
    output_name: Optional[str] = Form(None),
    request: Request = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_with_roles([Role.USER, Role.ADMIN]))
):
    """
    Extract pages from a PDF file based on specified page range
    """
    try:
        # Validate file
        if pdf.content_type != "application/pdf":
            raise HTTPException(status_code=400, detail="File must be PDF format")
        
        # Validate page range
        if start_page < 1:
            raise HTTPException(status_code=400, detail="Start page must be 1 or greater")
        
        if end_page < start_page:
            raise HTTPException(status_code=400, detail="End page must be greater than or equal to start page")
        
        # Read file content
        pdf_content = await pdf.read()
        
        if not pdf_content:
            raise HTTPException(status_code=400, detail="PDF file cannot be empty")
        
        # Use default output name if not provided
        final_output_name = output_name if output_name else "extracted.pdf"
        
        # Create extract request
        extract_request = PdfExtractPagesRequest(
            pdf_name=pdf.filename,
            start_page=start_page,
            end_page=end_page,
            output_pdf_name=final_output_name,
            pdf=pdf_content
        )
        
        # Process extraction
        result = pdf_service.extract_pages_from_pdf(extract_request)
        
        # Track operation
        request_details = f"Extracted pages {start_page}-{end_page} from {pdf.filename} into {final_output_name}"
        history_service.track_operation(
            db=db,
            operation_type="EXTRACT_PAGES",
            source_type=determine_source_type(request),
            request_details=request_details,
            user_id=current_user.id,
            request=request
        )
        
        if not result.success:
            raise HTTPException(status_code=500, detail=result.message)
        
        # Return the extracted PDF
        return StreamingResponse(
            io.BytesIO(result.content),
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{result.file_name}"'}
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing PDF file: {str(e)}")

@router.post("/split")
async def split_pdf_at_page(
    pdf: UploadFile = File(...),
    split_at_page: int = Form(...),
    first_output_name: Optional[str] = Form(None),
    second_output_name: Optional[str] = Form(None),
    request: Request = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_with_roles([Role.USER, Role.ADMIN]))
):
    """
    Split a PDF file into two separate documents at the specified page
    """
    try:
        # Validate file
        if pdf.content_type != "application/pdf":
            raise HTTPException(status_code=400, detail="File must be PDF format")
        
        # Validate split page
        if split_at_page < 1:
            raise HTTPException(status_code=400, detail="Split page must be 1 or greater")
        
        # Read file content
        pdf_content = await pdf.read()
        
        if not pdf_content:
            raise HTTPException(status_code=400, detail="PDF file cannot be empty")
        
        # Use default output names if not provided
        first_name = first_output_name if first_output_name else "part1.pdf"
        second_name = second_output_name if second_output_name else "part2.pdf"
        
        # Create split request
        split_request = PdfSplitAtPageRequest(
            pdf_name=pdf.filename,
            split_at_page=split_at_page,
            first_output_name=first_name,
            second_output_name=second_name,
            pdf=pdf_content
        )
        
        # Process split
        results = pdf_service.split_pdf_at_page(split_request)
        
        if "error" in results:
            raise HTTPException(status_code=500, detail=results["error"].message)
        
        # Track operation
        request_details = f"Split {pdf.filename} at page {split_at_page} into {first_name} and {second_name}"
        history_service.track_operation(
            db=db,
            operation_type="SPLIT_PDF",
            source_type=determine_source_type(request),
            request_details=request_details,
            user_id=current_user.id,
            request=request
        )
        
        # Create a ZIP file containing both parts
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, 'w') as zip_file:
            # Add first part
            first_part = results["first"]
            zip_file.writestr(first_part.file_name, first_part.content)
            
            # Add second part
            second_part = results["second"]
            zip_file.writestr(second_part.file_name, second_part.content)
        
        zip_buffer.seek(0)
        
        # Determine ZIP file name
        base_name = pdf.filename
        if base_name.lower().endswith(".pdf"):
            base_name = base_name[:-4]
        
        # Return the ZIP file
        return StreamingResponse(
            zip_buffer,
            media_type="application/zip",
            headers={"Content-Disposition": f'attachment; filename="{base_name}_split.zip"'}
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing PDF file: {str(e)}")

@router.post("/remove-page")
async def remove_page_from_pdf(
    pdf: UploadFile = File(...),
    page_to_remove: int = Form(...),
    output_name: Optional[str] = Form(None),
    request: Request = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_with_roles([Role.USER, Role.ADMIN]))
):
    """
    Remove a specific page from a PDF document
    """
    try:
        # Validate file
        if pdf.content_type != "application/pdf":
            raise HTTPException(status_code=400, detail="File must be PDF format")
        
        # Validate page number
        if page_to_remove < 1:
            raise HTTPException(status_code=400, detail="Page number must be 1 or greater")
        
        # Read file content
        pdf_content = await pdf.read()
        
        if not pdf_content:
            raise HTTPException(status_code=400, detail="PDF file cannot be empty")
        
        # Use default output name if not provided
        final_output_name = output_name if output_name else "modified.pdf"
        
        # Create remove page request
        remove_request = PdfRemovePageRequest(
            pdf_name=pdf.filename,
            page_to_remove=page_to_remove,
            output_pdf_name=final_output_name,
            pdf=pdf_content
        )
        
        # Process page removal
        result = pdf_service.remove_page_from_pdf(remove_request)
        
        # Track operation
        request_details = f"Removed page {page_to_remove} from {pdf.filename}, output: {final_output_name}"
        history_service.track_operation(
            db=db,
            operation_type="REMOVE_PAGE",
            source_type=determine_source_type(request),
            request_details=request_details,
            user_id=current_user.id,
            request=request
        )
        
        if not result.success:
            raise HTTPException(status_code=500, detail=result.message)
        
        # Return the modified PDF
        return StreamingResponse(
            io.BytesIO(result.content),
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{result.file_name}"'}
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing PDF file: {str(e)}")

@router.post("/reorder")
async def reorder_pdf_pages(
    pdf: UploadFile = File(...),
    page_order: str = Form(...),  # Change from List[int] to str
    output_name: Optional[str] = Form(None),
    request: Request = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_with_roles([Role.USER, Role.ADMIN]))
):
    """
    Reorganize pages in a PDF document based on specified order
    """
    try:
        # Validate file
        if pdf.content_type != "application/pdf":
            raise HTTPException(status_code=400, detail="File must be PDF format")
        
        # Parse and validate page order
        try:
            # Parse comma-separated integers
            page_order_list = [int(page.strip()) for page in page_order.split(',')]
            
            if not page_order_list:
                raise HTTPException(status_code=400, detail="Page order list cannot be empty")
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid page order format. Use comma-separated integers (e.g., '1,2,3')")
        
        # Read file content
        pdf_content = await pdf.read()
        
        if not pdf_content:
            raise HTTPException(status_code=400, detail="PDF file cannot be empty")
        
        # Use default output name if not provided
        final_output_name = output_name if output_name else "reordered.pdf"
        
        # Create reorder request
        reorder_request = PdfReorderPagesRequest(
            pdf_name=pdf.filename,
            page_order=page_order_list,  # Use the parsed list
            output_pdf_name=final_output_name,
            pdf=pdf_content
        )
        
        # Process page reordering
        result = pdf_service.reorder_pdf_pages(reorder_request)
        
        # Track operation
        request_details = f"Reordered pages in {pdf.filename} with order {page_order}, output: {final_output_name}"
        history_service.track_operation(
            db=db,
            operation_type="REORDER_PAGES",
            source_type=determine_source_type(request),
            request_details=request_details,
            user_id=current_user.id,
            request=request
        )
        
        if not result.success:
            raise HTTPException(status_code=500, detail=result.message)
        
        # Return the reordered PDF
        return StreamingResponse(
            io.BytesIO(result.content),
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{result.file_name}"'}
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing PDF file: {str(e)}")

@router.post("/add-password")
async def add_password_to_pdf(
    pdf: UploadFile = File(...),
    password: str = Form(...),
    output_name: Optional[str] = Form(None),
    request: Request = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_with_roles([Role.USER, Role.ADMIN]))
):
    """
    Encrypt a PDF file with a password
    """
    try:
        # Validate file
        if pdf.content_type != "application/pdf":
            raise HTTPException(status_code=400, detail="File must be PDF format")
        
        # Validate password
        if not password:
            raise HTTPException(status_code=400, detail="Password cannot be empty")
        
        # Read file content
        pdf_content = await pdf.read()
        
        if not pdf_content:
            raise HTTPException(status_code=400, detail="PDF file cannot be empty")
        
        # Use default output name if not provided
        final_output_name = output_name if output_name else "protected.pdf"
        
        # Create add password request
        password_request = PdfAddPasswordRequest(
            pdf_name=pdf.filename,
            owner_password=password,
            output_pdf_name=final_output_name,
            pdf=pdf_content
        )
        
        # Process password protection
        result = pdf_service.add_password_to_pdf(password_request)
        
        # Track operation
        request_details = f"Added password protection to {pdf.filename}, output: {final_output_name}"
        history_service.track_operation(
            db=db,
            operation_type="ADD_PASSWORD",
            source_type=determine_source_type(request),
            request_details=request_details,
            user_id=current_user.id,
            request=request
        )
        
        if not result.success:
            raise HTTPException(status_code=500, detail=result.message)
        
        # Return the password-protected PDF
        return StreamingResponse(
            io.BytesIO(result.content),
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{result.file_name}"'}
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing PDF file: {str(e)}")

@router.post("/remove-password")
async def remove_password_from_pdf(
    pdf: UploadFile = File(...),
    password: str = Form(...),
    output_name: Optional[str] = Form(None),
    request: Request = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_with_roles([Role.USER, Role.ADMIN]))
):
    """
    Remove password protection from a PDF file
    """
    try:
        # Validate file
        if pdf.content_type != "application/pdf":
            raise HTTPException(status_code=400, detail="File must be PDF format")
        
        # Validate password
        if not password:
            raise HTTPException(status_code=400, detail="Password cannot be empty")
        
        # Read file content
        pdf_content = await pdf.read()
        
        if not pdf_content:
            raise HTTPException(status_code=400, detail="PDF file cannot be empty")
        
        # Use default output name if not provided
        final_output_name = output_name if output_name else "unprotected.pdf"
        
        # Create remove password request
        password_request = PdfRemovePasswordRequest(
            pdf_name=pdf.filename,
            password=password,
            output_pdf_name=final_output_name,
            pdf=pdf_content
        )
        
        # Process password removal
        result = pdf_service.remove_password_from_pdf(password_request)
        
        # Track operation
        request_details = f"Removed password protection from {pdf.filename}, output: {final_output_name}"
        history_service.track_operation(
            db=db,
            operation_type="REMOVE_PASSWORD",
            source_type=determine_source_type(request),
            request_details=request_details,
            user_id=current_user.id,
            request=request
        )
        
        if not result.success:
            # Handle invalid password specifically
            if "invalid password" in result.message.lower():
                raise HTTPException(status_code=400, detail=result.message)
            else:
                raise HTTPException(status_code=500, detail=result.message)
        
        # Return the unprotected PDF
        return StreamingResponse(
            io.BytesIO(result.content),
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{result.file_name}"'}
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing PDF file: {str(e)}")

@router.post("/to-images")
async def convert_pdf_to_images(
    pdf: UploadFile = File(...),
    dpi: int = Form(150),
    request: Request = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_with_roles([Role.USER, Role.ADMIN]))
):
    """
    Convert each page of a PDF file to PNG images
    """
    try:
        # Validate file
        if pdf.content_type != "application/pdf":
            raise HTTPException(status_code=400, detail="File must be PDF format")
        
        # Validate DPI
        if dpi <= 0:
            dpi = 150  # Use default if invalid
        
        # Read file content
        pdf_content = await pdf.read()
        
        if not pdf_content:
            raise HTTPException(status_code=400, detail="PDF file cannot be empty")
        
        # Create to-images request
        image_request = PdfToImagesRequest(
            pdf_name=pdf.filename,
            dpi=dpi,
            pdf=pdf_content
        )
        
        # Process conversion
        images = pdf_service.convert_pdf_to_images(image_request)
        
        if not images:
            raise HTTPException(status_code=500, detail="Failed to convert PDF to images")
        
        # Track operation
        request_details = f"Converted {pdf.filename} to images with DPI={dpi}"
        history_service.track_operation(
            db=db,
            operation_type="PDF_TO_IMAGES",
            source_type=determine_source_type(request),
            request_details=request_details,
            user_id=current_user.id,
            request=request
        )
        
        # Create a ZIP file containing all images
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, 'w') as zip_file:
            for img_name, img_data in images.items():
                zip_file.writestr(img_name, img_data)
        
        zip_buffer.seek(0)
        
        # Get base name for the output ZIP file
        base_name = pdf.filename
        if base_name.lower().endswith(".pdf"):
            base_name = base_name[:-4]
        
        # Return the ZIP file
        return StreamingResponse(
            zip_buffer,
            media_type="application/zip",
            headers={"Content-Disposition": f'attachment; filename="{base_name}_images.zip"'}
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing PDF file: {str(e)}")

@router.post("/rotate")
async def rotate_pdf_pages(
    pdf: UploadFile = File(...),
    pages: str = Form(...),  # Change from List[int] to str
    rotations: str = Form(...),  # Change from List[int] to str
    output_name: Optional[str] = Form(None),
    request: Request = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_with_roles([Role.USER, Role.ADMIN]))
):
    """
    Rotate specific pages in a PDF document
    """
    try:
        # Validate file
        if pdf.content_type != "application/pdf":
            raise HTTPException(status_code=400, detail="File must be PDF format")
        
        # Parse and validate pages and rotations
        try:
            # Parse comma-separated integers
            pages_list = [int(page.strip()) for page in pages.split(',')]
            rotations_list = [int(rotation.strip()) for rotation in rotations.split(',')]
            
            if not pages_list:
                raise HTTPException(status_code=400, detail="Page list cannot be empty")
            
            if not rotations_list:
                raise HTTPException(status_code=400, detail="Rotation list cannot be empty")
            
            if len(pages_list) != len(rotations_list):
                raise HTTPException(status_code=400, detail="Number of pages and rotations must match")
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid format. Use comma-separated integers (e.g., '1,2,3')")
        
        # Read file content
        pdf_content = await pdf.read()
        
        if not pdf_content:
            raise HTTPException(status_code=400, detail="PDF file cannot be empty")
        
        # Use default output name if not provided
        final_output_name = output_name if output_name else "rotated.pdf"
        
        # Create a map of page numbers to rotation angles
        page_rotations = {pages_list[i]: rotations_list[i] for i in range(len(pages_list))}
        
        # Create rotate request
        rotate_request = PdfRotatePagesRequest(
            pdf_name=pdf.filename,
            page_rotations=page_rotations,
            output_pdf_name=final_output_name,
            pdf=pdf_content
        )
        
        # Process rotation
        result = pdf_service.rotate_pdf_pages(rotate_request)
        
        # Track operation
        rotation_details = ", ".join(f"Page {pages_list[i]} rotated {rotations_list[i]}°" for i in range(len(pages_list)))
        request_details = f"Rotated pages in {pdf.filename} ({rotation_details}), output: {final_output_name}"
        history_service.track_operation(
            db=db,
            operation_type="ROTATE_PAGES",
            source_type=determine_source_type(request),
            request_details=request_details,
            user_id=current_user.id,
            request=request
        )
        
        if not result.success:
            raise HTTPException(status_code=500, detail=result.message)
        
        # Return the rotated PDF
        return StreamingResponse(
            io.BytesIO(result.content),
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{result.file_name}"'}
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing PDF file: {str(e)}")

@router.post("/add-watermark")
async def add_watermark_to_pdf(
    pdf: UploadFile = File(...),
    watermark_text: str = Form(...),
    output_name: Optional[str] = Form(None),
    request: Request = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_with_roles([Role.USER, Role.ADMIN]))
):
    """
    Add a text watermark to each page of a PDF document
    
    - **pdf**: PDF file to add watermark to
    - **watermark_text**: Text to use as watermark
    - **output_name**: Custom filename for the output PDF (optional)
    """
    try:
        # Validate file
        if pdf.content_type != "application/pdf":
            raise HTTPException(status_code=400, detail="File must be PDF format")
        
        # Validate watermark parameters
        if not watermark_text:
            raise HTTPException(status_code=400, detail="Watermark text cannot be empty")
        
        # Read file content
        pdf_content = await pdf.read()
        
        if not pdf_content:
            raise HTTPException(status_code=400, detail="PDF file cannot be empty")
        
        # Use default output name if not provided
        final_output_name = output_name if output_name else "watermarked.pdf"
        
        # Create watermark request
        watermark_request = PdfAddWatermarkRequest(
            pdf_name=pdf.filename,
            watermark_text=watermark_text,
            output_pdf_name=final_output_name,
            pdf=pdf_content,
            font_size=40  # Default font size
        )
        
        # Process watermark addition
        result = pdf_service.add_watermark_to_pdf(watermark_request)
        
        # Track operation
        request_details = f'Added watermark "{watermark_text}" to {pdf.filename}, output: {final_output_name}'
        history_service.track_operation(
            db=db,
            operation_type="ADD_WATERMARK",
            source_type=determine_source_type(request),
            request_details=request_details,
            user_id=current_user.id,
            request=request
        )
        
        if not result.success:
            raise HTTPException(status_code=500, detail=result.message)
        
        # Return the watermarked PDF
        return StreamingResponse(
            io.BytesIO(result.content),
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{result.file_name}"'}
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing PDF file: {str(e)}")
