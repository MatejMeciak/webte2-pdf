from pydantic import BaseModel, EmailStr
from typing import Optional

from app.models.user import Role

class UserBase(BaseModel):
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    role: Role
    enabled: bool
    
    class Config:
        from_attributes = True

# Auth schemas
class RegisterRequest(UserCreate):
    pass

class AuthRequest(BaseModel):
    email: EmailStr
    password: str

class AuthResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user_id: int
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role: str
