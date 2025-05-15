from typing import Optional, List
from sqlalchemy.orm import Session
from fastapi import Request

from app.models.history import PdfOperationHistory
from app.schemas.history import HistoryCreate, HistoryResponse
from app.models.user import User

class HistoryService:
    def track_operation(
        self,
        db: Session,
        operation_type: str,
        source_type: str,
        request_details: str,
        user_id: int,
        request: Optional[Request] = None,
    ) -> PdfOperationHistory:
        """
        Track a PDF operation in the history
        """
        # Extract client information from request if available
        ip_address = None
        user_agent = None
        country = None
        state = None
        
        if request:
            ip_address = request.client.host if hasattr(request, 'client') else None
            user_agent = request.headers.get("user-agent")
            # Country and state could be determined using a geo-ip service in a real implementation
        
        history_entry = PdfOperationHistory(
            user_id=user_id,
            operation_type=operation_type,
            source_type=source_type,
            ip_address=ip_address,
            country=country,
            state=state,
            user_agent=user_agent,
            request_details=request_details
        )
        
        db.add(history_entry)
        db.commit()
        db.refresh(history_entry)
        
        return history_entry
    
    def get_user_history(self, db: Session, user_id: int) -> List[HistoryResponse]:
        """
        Get operation history for a specific user
        """
        history = db.query(PdfOperationHistory).filter(
            PdfOperationHistory.user_id == user_id
        ).order_by(PdfOperationHistory.timestamp.desc()).all()
        
        return history
    
    def get_all_history(self, db: Session) -> List[HistoryResponse]:
        """
        Get all operation history (admin only)
        """
        history = db.query(PdfOperationHistory).order_by(
            PdfOperationHistory.timestamp.desc()
        ).all()
        
        return history
