from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.user import User, Role
from app.services.history_service import HistoryService
from app.schemas.history import HistoryResponse
from app.utils.dependencies import get_current_active_user, get_current_user_with_roles

router = APIRouter(prefix="/history", tags=["Operation History"])
history_service = HistoryService()

@router.get("/user", response_model=List[HistoryResponse])
def get_user_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get the operation history for the current user
    """
    return history_service.get_user_history(db, current_user.id)

@router.get("/all", response_model=List[HistoryResponse])
def get_all_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_with_roles([Role.ADMIN]))
):
    """
    Get all operation history (admin only)
    """
    return history_service.get_all_history(db)
