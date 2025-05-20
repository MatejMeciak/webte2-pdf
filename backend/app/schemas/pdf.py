from pydantic import BaseModel
from typing import Optional, List, Dict, Any

# Base PDF Response
class PdfResponse(BaseModel):
    file_name: str
    message: str
    content: Optional[bytes] = None
    success: bool

# PDF Request Models
class PdfMergeRequest(BaseModel):
    first_pdf_name: str
    second_pdf_name: str
    output_pdf_name: str
    first_pdf: bytes
    second_pdf: bytes

class PdfExtractPagesRequest(BaseModel):
    pdf_name: str
    start_page: int
    end_page: int
    output_pdf_name: str
    pdf: bytes

class PdfSplitAtPageRequest(BaseModel):
    pdf_name: str
    split_at_page: int
    first_output_name: str
    second_output_name: str
    pdf: bytes

class PdfRemovePageRequest(BaseModel):
    pdf_name: str
    page_to_remove: int
    output_pdf_name: str
    pdf: bytes

class PdfReorderPagesRequest(BaseModel):
    pdf_name: str
    page_order: List[int]
    output_pdf_name: str
    pdf: bytes

class PdfAddPasswordRequest(BaseModel):
    pdf_name: str
    owner_password: str
    output_pdf_name: str
    pdf: bytes

class PdfRemovePasswordRequest(BaseModel):
    pdf_name: str
    password: str
    output_pdf_name: str
    pdf: bytes

class PdfToImagesRequest(BaseModel):
    pdf_name: str
    dpi: int
    pdf: bytes

class PdfRotatePagesRequest(BaseModel):
    pdf_name: str
    page_rotations: Dict[int, int]  # Page number -> rotation angle
    output_pdf_name: str
    pdf: bytes

class PdfAddWatermarkRequest(BaseModel):
    pdf: bytes
    watermark_text: str
    output_pdf_name: str
    pdf_name: str
    font_size: int = 40
    color: str = "#808080"  # Default gray color