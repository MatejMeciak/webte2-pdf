# PDF Processing API (Python Implementation)

This is a Python re-implementation of the original Java Spring Boot PDF processing API. It provides various operations for manipulating PDF files through a RESTful API.

## Features

- User authentication (register, login)
- PDF Operations:
  - Merge PDF files
  - Extract pages
  - Split PDF at specific page
  - Remove pages
  - Reorder pages
  - Password protection (add/remove)
  - Convert to images
  - Rotate pages
  - Add watermark
- Operation history tracking

## Tech Stack

- **FastAPI** - Web framework
- **SQLAlchemy** - ORM
- **PyJWT** - JWT authentication
- **PyMuPDF (fitz)** - PDF manipulation
- **PyPDF2** - Additional PDF operations
- **PostgreSQL** - Database
- **Pydantic** - Data validation

## Getting Started

### Prerequisites

- Python 3.9+
- PostgreSQL

### Running with Docker Compose

1. Clone the repository
2. Navigate to the project directory
3. Run with Docker Compose:

```bash
docker-compose up -d
```

The API will be available at http://localhost:8000 and Swagger documentation at http://localhost:8000/swagger-ui.html

### Running Locally

1. Create a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Make sure PostgreSQL is running and create a database:

```bash
createdb pdfdb
```

4. Run the application:

```bash
uvicorn app.main:app --reload
```

The API will be available at http://localhost:8000

## API Documentation

Once the application is running, you can access the Swagger UI documentation at:

```
http://localhost:8000/swagger-ui.html
```

## Default Users

The application creates the following default users:

- Admin: admin@example.com / admin
- User: user@example.com / user

## Environment Variables

The following environment variables can be configured in the `.env` file:

- `DATABASE_URL`: PostgreSQL connection URL
- `JWT_SECRET`: Secret key for JWT token generation
- `JWT_ACCESS_TOKEN_EXPIRE_MINUTES`: Access token expiration in minutes
- `JWT_REFRESH_TOKEN_EXPIRE_MINUTES`: Refresh token expiration in minutes
- `CORS_ORIGINS`: List of allowed CORS origins
