from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class HistoryBase(BaseModel):
    operation_type: str
    source_type: str
    request_details: Optional[str] = None

class HistoryCreate(HistoryBase):
    user_id: int
    ip_address: Optional[str] = None
    country: Optional[str] = None
    state: Optional[str] = None
    user_agent: Optional[str] = None

class HistoryResponse(HistoryBase):
    id: int
    user_id: int
    timestamp: datetime
    ip_address: Optional[str] = None
    country: Optional[str] = None
    state: Optional[str] = None
    user_agent: Optional[str] = None
    
    class Config:
        from_attributes = True
