from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import Depends, HTTPException, status, Security
from jose import JWTError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.security import decode_token
from app.models.user import User, Role

# The tokenUrl should match the auth login endpoint
security = HTTPBearer()

async def get_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    return credentials.credentials

# Update the get_current_user function to use the new scheme
async def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(get_token)
) -> User:
    """
    Get the current user from the token
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_token(token)
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    if not user.enabled:
        raise HTTPException(status_code=400, detail="Inactive user")
    return user

def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """
    Get the current active user
    """
    if not current_user.enabled:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

def get_current_user_with_roles(roles: list[Role]):
    """
    Create a dependency that checks if the current user has one of the specified roles
    """
    def _get_user_with_roles(
        current_user: User = Depends(get_current_active_user),
    ) -> User:
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        return current_user
    
    return _get_user_with_roles
