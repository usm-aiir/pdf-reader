FROM python:3.11-slim
LABEL maintainer="Connor Lund <cml1010101@gmail.com>"
LABEL description="Backend for PDF Reader application"
LABEL version="1.0"

WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    libgl1-mesa-glx \
    poppler-utils \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*
COPY requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 9095
CMD ["python3", "backend.py"]