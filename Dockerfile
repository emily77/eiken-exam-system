FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    git \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy frontend
COPY frontend ./frontend
WORKDIR /app/frontend
RUN npm install && npm run build
WORKDIR /app

# Copy backend
COPY backend.py .
COPY seed.py .

# Expose ports
EXPOSE 8000

# Initialize database and start server
CMD python3 -c "from backend import init_db; init_db()" && \
    python3 seed.py && \
    python3 -m uvicorn backend:app --host 0.0.0.0 --port 8000
