from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from jose import JWTError

from app.core.database import get_db
from app.core.security import create_access_token, create_refresh_token, decode_token
from app.services.auth_service import AuthService
from app.schemas.auth import RegisterRequest, AuthRequest, AuthResponse
from app.models.user import User

router = APIRouter(tags=["Authentication"])
auth_service = AuthService()

@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    """
    Register a new user
    """
    return auth_service.register(db, request)

@router.post("/login", response_model=AuthResponse)
def login(request: AuthRequest, db: Session = Depends(get_db)):
    """
    Authenticate a user
    """
    return auth_service.authenticate(db, request)

# Also enable OAuth2 password flow for standard clients
@router.post("/token", response_model=AuthResponse)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    auth_request = AuthRequest(email=form_data.username, password=form_data.password)
    return auth_service.authenticate(db, auth_request)

@router.post("/refresh", response_model=AuthResponse)
async def refresh_token(refresh_token: str, db: Session = Depends(get_db)):
    """
    Refresh access token
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Decode and validate refresh token
        payload = decode_token(refresh_token)
        
        # Check if it's actually a refresh token
        if payload.get("type") != "refresh":
            raise credentials_exception
            
        email = payload.get("sub")
        if email is None:
            raise credentials_exception
            
        # Get user from DB
        user = db.query(User).filter(User.email == email).first()
        if user is None or not user.enabled:
            raise credentials_exception
            
        # Generate new tokens
        new_access_token = create_access_token(user.email)
        new_refresh_token = create_refresh_token(user.email)
        
        return AuthResponse(
            access_token=new_access_token,
            refresh_token=new_refresh_token,
            user_id=user.id,
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            role=user.role.value,
            token_type="bearer"
        )
            
    except JWTError:
        raise credentials_exception
