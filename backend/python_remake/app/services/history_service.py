from typing import Optional, List
import os
from sqlalchemy.orm import Session
from fastapi import Request
import geoip2.database
from geoip2.errors import AddressNotFoundError

from app.models.history import PdfOperationHistory
from app.schemas.history import HistoryCreate, HistoryResponse
from app.models.user import User

class HistoryService:
    def __init__(self):
        """Initialize the history service with geolocation database"""
        # Docker path
        docker_path = "/app/data/GeoLite2-City.mmdb"
        
        # Development path (relative to the project root)
        dev_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 
                                'data', 'GeoLite2-City.mmdb')
        
        # Try Docker path first, then development path
        self.geolite_path = docker_path if os.path.exists(docker_path) else dev_path
        self.geolite_reader = None
        
        # Try to initialize the GeoIP reader if the database file exists
        if os.path.exists(self.geolite_path):
            try:
                self.geolite_reader = geoip2.database.Reader(self.geolite_path)
            except Exception as e:
                print(f"Failed to initialize GeoIP database: {e}")
    
    def get_location_from_ip(self, ip_address: str) -> tuple:
        """
        Get country and state/region information from an IP address
        Returns a tuple of (country, state)
        """
        if not self.geolite_reader or not ip_address:
            return None, None
        
        # Skip local/private IP addresses
        if ip_address in ('127.0.0.1', 'localhost', '::1') or ip_address.startswith(('10.', '172.16.', '192.168.')):
            return "Local", "Local"
            
        try:
            response = self.geolite_reader.city(ip_address)
            country = response.country.name
            # Some responses might not have subdivisions
            state = response.subdivisions.most_specific.name if response.subdivisions else None
            return country, state
        except AddressNotFoundError:
            return None, None  
        except Exception as e:
            print(f"Error getting location for IP {ip_address}: {e}")
            return None, None

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
            
            # Get country and state from IP address
            if ip_address:
                country, state = self.get_location_from_ip(ip_address)
        
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
    
    def get_all_history(self, db: Session) -> List[HistoryResponse]:
        """
        Get all operation history (admin only)
        """
        history = db.query(PdfOperationHistory).order_by(
            PdfOperationHistory.timestamp.desc()
        ).all()
        
        return history
    
    def delete_all_history(self, db: Session) -> None:
        """
        Delete all operation history records
        """
        db.query(PdfOperationHistory).delete(synchronize_session=False)
        db.commit()

    def delete_history_item(self, db: Session, history_id: int) -> bool:
        """
        Delete a single history record by ID
        Returns True if item was found and deleted, False otherwise
        """
        history_item = db.query(PdfOperationHistory).filter(PdfOperationHistory.id == history_id).first()
        if not history_item:
            return False
            
        db.delete(history_item)
        db.commit()
        return True