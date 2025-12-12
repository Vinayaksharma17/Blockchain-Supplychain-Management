.PHONY: build up down logs init clean rebuild dev

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
init:
	docker build -f Dockerfile.init -t scm-init .
	docker run --rm -v $(PWD)/backend/data:/app/backend/data -e HOST_IP=$$(ipconfig getifaddr en0 2>/dev/null || echo "localhost") scm-init

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
