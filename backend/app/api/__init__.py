from fastapi import APIRouter

from app.api import auth, pdf, history

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(pdf.router, prefix="/pdf", tags=["PDF Operations"])
api_router.include_router(history.router, prefix="/history", tags=["Operation History"])
