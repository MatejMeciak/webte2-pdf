from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.user import User, Role
from app.core.security import verify_password, get_password_hash, create_access_token, create_refresh_token
from app.schemas.auth import RegisterRequest, AuthRequest, AuthResponse

class AuthService:
    def register(self, db: Session, request: RegisterRequest) -> AuthResponse:
        # Check if user already exists
        user = db.query(User).filter(User.email == request.email).first()
        if user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create new user
        user = User(
            email=request.email,
            first_name=request.first_name,
            last_name=request.last_name,
            password=get_password_hash(request.password),
            role=Role.USER,
            enabled=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
        # Generate tokens
        access_token = create_access_token(user.email)
        refresh_token = create_refresh_token(user.email)
        
        return AuthResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user_id=user.id,
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            role=user.role.value
        )
    
    def authenticate(self, db: Session, request: AuthRequest) -> AuthResponse:
        # Find user by email
        user = db.query(User).filter(User.email == request.email).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        # Verify password
        if not verify_password(request.password, user.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        # Generate tokens
        access_token = create_access_token(user.email)
        refresh_token = create_refresh_token(user.email)
        
        return AuthResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user_id=user.id,
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            role=user.role.value
        )
