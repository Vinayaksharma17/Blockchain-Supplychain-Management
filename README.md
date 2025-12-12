# Blockchain Supply Chain Management

A containerized supply chain management application with blockchain-based tracking.

## Prerequisites

- Docker & Docker Compose
- Make (optional, for convenience commands)

## Quick Start

### 1. Build and Start (Production)

```bash
make build    # Build all containers
make up       # Start all services
```

### 2. Development Mode (Hot Reload)

```bash
make dev      # Start with hot reload for frontend & backend
```

### 3. Initialize Data (Optional)

Generate QR codes and process initial data:

```bash
# Default (uses localhost)
make init

# With specific IP (for mobile device access)
make init HOST_IP=192.168.1.100

# macOS auto-detect local IP
make init HOST_IP=$(ipconfig getifaddr en0)

# Linux auto-detect local IP
make init HOST_IP=$(hostname -I | awk '{print $1}')
```

## Access

| Service     | URL                        |
| ----------- | -------------------------- |
| Frontend    | http://localhost:5173      |
| Backend API | http://localhost:8000      |
| API Docs    | http://localhost:8000/docs |

## Makefile Commands

| Command        | Description                      |
| -------------- | -------------------------------- |
| `make build`   | Build all Docker containers      |
| `make up`      | Start services in background     |
| `make down`    | Stop all services                |
| `make dev`     | Development mode with hot reload |
| `make logs`    | View container logs              |
| `make init`    | Initialize data (QR codes, etc.) |
| `make clean`   | Remove containers and images     |
| `make rebuild` | Rebuild and restart containers   |

## Manual Docker Commands

```bash
# Build
docker-compose build

# Start
docker-compose up -d

# Development mode
docker-compose -f docker-compose.dev.yml up

# Stop
docker-compose down

# View logs
docker-compose logs -f
```

## Project Structure

```
├── backend/           # FastAPI Python backend
│   ├── Dockerfile
│   ├── main.py
│   ├── models.py
│   ├── repository.py
│   └── data/          # Data files and QR codes
├── frontend/          # React + Vite + TypeScript frontend
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   └── src/
├── docker-compose.yml      # Production compose
├── docker-compose.dev.yml  # Development compose
├── Dockerfile.init         # Data initialization
├── Makefile               # Convenience commands
└── requirements.txt       # Python dependencies
```

## Configuration

### npm Registry (Frontend)

By default, the frontend uses the official npm registry. To use a mirror:

```bash
docker-compose build --build-arg NPM_REGISTRY=https://registry.npmmirror.com
```

### Environment Variables

| Variable       | Default                 | Description                       |
| -------------- | ----------------------- | --------------------------------- |
| `VITE_API_URL` | `http://localhost:8000` | Backend API URL for frontend      |
| `HOST_IP`      | `localhost`             | IP address for QR code generation |
