from fastapi import APIRouter, Depends, HTTPException, status, Request, Response, Query
from sqlalchemy.orm import Session
from typing import List
import csv
from io import StringIO

from app.core.database import get_db
from app.models.user import User, Role
from app.services.history_service import HistoryService
from app.schemas.history import HistoryResponse, PaginatedHistoryResponse
from app.utils.dependencies import get_current_user_with_roles


router = APIRouter(tags=["Operation History"])
history_service = HistoryService()

@router.get("/", response_model=PaginatedHistoryResponse)
def get_all_history(
    page: int = Query(0, ge=0, description="Page number (0-based)"),
    size: int = Query(20, gt=0, le=100, description="Items per page"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_with_roles([Role.ADMIN]))
):
    """
    Get paginated operation history with user details (admin only)
    """
    return history_service.get_all_history(db, page, size)

@router.delete("/", status_code=status.HTTP_204_NO_CONTENT)
def delete_all_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_with_roles([Role.ADMIN]))
):
    """
    Delete all operation history (admin only)
    """
    history_service.delete_all_history(db)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

@router.get("/export")
def export_history_csv(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_with_roles([Role.ADMIN]))
):
    """
    Export all operation history as CSV (admin only)
    """
    # Get all history without pagination
    history_data = history_service.get_all_history(db, page=0, size=1000000)
    history = history_data["items"]
    
    output = StringIO()
    fieldnames = ["id", "user_id", "user_name", "user_email", "operation_type", 
                  "timestamp", "source_type", "ip_address", "country", 
                  "state", "request_details"]
    
    writer = csv.DictWriter(output, fieldnames=fieldnames)
    writer.writeheader()
    
    for entry in history:
        writer.writerow({
            "id": entry["id"],
            "user_id": entry["user_id"],
            "user_name": entry["user_name"],
            "user_email": entry["user_email"],
            "operation_type": entry["operation_type"],
            "timestamp": entry["timestamp"],
            "source_type": entry["source_type"],
            "ip_address": entry["ip_address"],
            "country": entry["country"],
            "state": entry["state"],
            "request_details": entry["request_details"]
        })
    
    response = Response(content=output.getvalue())
    response.headers["Content-Disposition"] = "attachment; filename=operation_history.csv"
    response.headers["Content-Type"] = "text/csv"
    
    return response

@router.delete("/{history_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_history_item(
    history_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_with_roles([Role.ADMIN]))
):
    """
    Delete a specific operation history item by ID (admin only)
    """
    deleted = history_service.delete_history_item(db, history_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"History item with ID {history_id} not found"
        )
    return Response(status_code=status.HTTP_204_NO_CONTENT)