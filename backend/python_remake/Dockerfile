# Start with Python base image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . /app/

# Create data directory for GeoLite2 database
RUN mkdir -p /app/data

# Download the GeoLite2 database
RUN python -m app.services.geo_lite_2 --data-dir=/app/data

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]