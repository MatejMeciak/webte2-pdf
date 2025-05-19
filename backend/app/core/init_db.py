from sqlalchemy.orm import Session
from app.core.security import get_password_hash
from app.models.user import User, Role
from app.core.database import SessionLocal

def init_db():
    """Initialize database with admin user if it doesn't exist"""
    db = SessionLocal()
    try:
        # Check if admin exists
        admin = db.query(User).filter(User.email == "admin@example.com").first()
        if not admin:
            # Create admin user
            admin = User(
                first_name="Admin",
                last_name="User",
                email="admin@example.com",
                password=get_password_hash("admin"),
                role=Role.ADMIN,
                enabled=True
            )
            db.add(admin)
            db.commit()
            print("Admin user created")
            
        # Check if test user exists
        user = db.query(User).filter(User.email == "user@example.com").first()
        if not user:
            # Create test user
            user = User(
                first_name="Test",
                last_name="User",
                email="user@example.com",
                password=get_password_hash("user"),
                role=Role.USER,
                enabled=True
            )
            db.add(user)
            db.commit()
            print("Test user created")
            
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
