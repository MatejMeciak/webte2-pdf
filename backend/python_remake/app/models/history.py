from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base

class PdfOperationHistory(Base):
    __tablename__ = "pdf_operation_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    operation_type = Column(String, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    source_type = Column(String, nullable=False)  # API or Frontend
    ip_address = Column(String)
    country = Column(String)
    state = Column(String)
    user_agent = Column(String)
    request_details = Column(Text)
    
    # Relationships
    user = relationship("User", back_populates="operation_history")
