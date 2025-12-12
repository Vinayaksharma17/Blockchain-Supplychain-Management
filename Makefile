.PHONY: build up down logs init clean rebuild dev

# Default HOST_IP to localhost if not provided
HOST_IP ?= localhost

# Build all containers
build:
	docker-compose build

# Start all services
up:
	docker-compose up -d

# Stop all services
down:
	docker-compose down

# View logs
logs:
	docker-compose logs -f

# Initialize data (run data processor and QR generator)
# Usage: make init HOST_IP=192.168.1.100 (or any IP accessible from mobile devices)
# On macOS, you can auto-detect with: make init HOST_IP=$$(ipconfig getifaddr en0)
# On Linux, you can use: make init HOST_IP=$$(hostname -I | awk '{print $$1}')
init:
	docker build -f Dockerfile.init -t scm-init .
	docker run --rm -v $(PWD)/backend/data:/app/backend/data -e HOST_IP=$(HOST_IP) scm-init

# Clean up
clean:
	docker-compose down -v --rmi all
	docker system prune -f

# Rebuild and restart
rebuild:
	docker-compose down
	docker-compose build --no-cache
	docker-compose up -d

# Development mode with hot reload
dev:
	docker-compose -f docker-compose.dev.yml up
