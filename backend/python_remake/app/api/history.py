from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from sqlalchemy.orm import Session
from typing import List
import csv
from io import StringIO

from app.core.database import get_db
from app.models.user import User, Role
from app.services.history_service import HistoryService
from app.schemas.history import HistoryResponse
from app.utils.dependencies import get_current_user_with_roles

router = APIRouter(tags=["Operation History"])
history_service = HistoryService()

@router.get("/", response_model=List[HistoryResponse])
def get_all_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_with_roles([Role.ADMIN]))
):
    """
    Get all operation history (admin only)
    """
    return history_service.get_all_history(db)

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
    history = history_service.get_all_history(db)
    output = StringIO()
    fieldnames = ["id", "user_id", "operation_type", "timestamp", "source_type", 
                  "ip_address", "country", "state", "request_details"]
    
    writer = csv.DictWriter(output, fieldnames=fieldnames)
    writer.writeheader()
    
    for entry in history:
        writer.writerow({
            "id": entry.id,
            "user_id": entry.user_id,
            "operation_type": entry.operation_type,
            "timestamp": entry.timestamp,
            "source_type": entry.source_type,
            "ip_address": entry.ip_address,
            "country": entry.country,
            "state": entry.state,
            "request_details": entry.request_details
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