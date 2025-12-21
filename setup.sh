#!/bin/bash

# ================================================================
# NEXUS - Full Stack Application Setup Script
# ================================================================
# This script sets up the NEXUS application from scratch on any VM
# It installs Docker, Docker Compose, clones the repo, and starts
# the application with PostgreSQL database.
# ================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REPO_URL="${REPO_URL:-https://github.com/your-username/nexus.git}"
# Use current directory if script is run from project root, otherwise use /opt/nexus
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -f "$SCRIPT_DIR/package.json" ]; then
    APP_DIR="$SCRIPT_DIR"
else
    APP_DIR="${APP_DIR:-/opt/nexus}"
fi
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="mypassword123"
POSTGRES_DB="nexus"

# ================================================================
# Helper Functions
# ================================================================

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_banner() {
    echo -e "${BLUE}"
    echo "================================================================"
    echo "    _   _  _______  __  __  _   _   _____ "
    echo "   | \ | ||  ___\ \/ / | | | | / __|"
    echo "   |  \| || |__  >  <  | | | | \__ \\"
    echo "   | |\  ||  __|/ /\ \ | |_| | |___) |"
    echo "   |_| \_||_|  /_/  \_\ \___/  |____/"
    echo ""
    echo "    Full Stack Application Setup"
    echo "================================================================"
    echo -e "${NC}"
}

check_root() {
    if [ "$EUID" -ne 0 ]; then
        log_error "Please run this script as root or with sudo"
        exit 1
    fi
}

# ================================================================
# Installation Functions
# ================================================================

install_dependencies() {
    log_info "Updating system packages..."

    # Detect OS
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$ID
    else
        log_error "Cannot detect OS"
        exit 1
    fi

    case $OS in
        ubuntu|debian)
            apt-get update -y
            apt-get install -y \
                curl \
                wget \
                git \
                ca-certificates \
                gnupg \
                lsb-release \
                software-properties-common
            ;;
        centos|rhel|fedora)
            yum update -y
            yum install -y \
                curl \
                wget \
                git \
                ca-certificates \
                gnupg2
            ;;
        *)
            log_warning "Unsupported OS: $OS. Attempting generic installation..."
            ;;
    esac

    log_success "System dependencies installed"
}

install_docker() {
    if command -v docker &> /dev/null; then
        log_info "Docker is already installed"
        docker --version
        return
    fi

    log_info "Installing Docker..."

    # Official Docker installation script
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh

    # Start and enable Docker
    systemctl start docker
    systemctl enable docker

    log_success "Docker installed successfully"
    docker --version
}

install_docker_compose() {
    if command -v docker-compose &> /dev/null || docker compose version &> /dev/null; then
        log_info "Docker Compose is already installed"
        docker compose version 2>/dev/null || docker-compose --version
        return
    fi

    log_info "Installing Docker Compose..."

    # Install Docker Compose plugin
    DOCKER_CONFIG=${DOCKER_CONFIG:-$HOME/.docker}
    mkdir -p $DOCKER_CONFIG/cli-plugins

    COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep -Po '"tag_name": "\K.*?(?=")')
    curl -SL "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o $DOCKER_CONFIG/cli-plugins/docker-compose
    chmod +x $DOCKER_CONFIG/cli-plugins/docker-compose

    # Also install globally
    cp $DOCKER_CONFIG/cli-plugins/docker-compose /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose

    log_success "Docker Compose installed successfully"
    docker compose version
}

# ================================================================
# Application Setup Functions
# ================================================================

setup_application() {
    log_info "Setting up NEXUS application..."

    # Create application directory
    mkdir -p "$APP_DIR"
    cd "$APP_DIR"

    # If we're already in a git repo (development), use current directory
    if [ -d ".git" ]; then
        log_info "Using existing repository..."
    elif [ -d "$APP_DIR/.git" ]; then
        log_info "Repository already exists, pulling latest changes..."
        git pull origin main || git pull origin master
    else
        # Clone the repository
        if [ "$REPO_URL" != "https://github.com/your-username/nexus.git" ]; then
            log_info "Cloning repository from $REPO_URL..."
            git clone "$REPO_URL" .
        else
            log_warning "No repository URL specified. Please copy your application files to $APP_DIR"
            log_info "Or set REPO_URL environment variable and run the script again"
        fi
    fi

    log_success "Application directory ready"
}

create_env_file() {
    log_info "Setting up environment file..."

    ENV_FILE="$APP_DIR/.env"

    if [ -f "$ENV_FILE" ]; then
        # Check if .env has real values (not template placeholders)
        if grep -q "your_key_here\|your_secret_here\|your_email@gmail.com" "$ENV_FILE"; then
            log_warning ".env file contains placeholder values. Please update with real credentials."
        else
            log_info ".env file already exists with real values. Keeping it."
            # Only update DATABASE_URL for Docker networking
            sed -i 's|postgresql://postgres:mypassword123@localhost:5432/nexus|postgresql://postgres:mypassword123@postgres:5432/nexus|g' "$ENV_FILE"
            log_success "DATABASE_URL updated for Docker networking"
            log_success "Environment file ready"
            return
        fi
    fi

    # Only copy from .env.example if .env doesn't exist
    if [ ! -f "$ENV_FILE" ]; then
        if [ -f "$APP_DIR/.env.example" ]; then
            log_info "Copying from .env.example..."
            cp "$APP_DIR/.env.example" "$ENV_FILE"
            log_warning "Please update the .env file with your actual credentials before running again"
        else
            log_warning "No .env file found. Please create .env file manually"
        fi
    fi

    log_success "Environment file ready"
}

# ================================================================
# Docker Operations
# ================================================================

build_and_start() {
    log_info "Building and starting Docker containers..."

    cd "$APP_DIR"

    # Stop any existing containers
    docker compose down 2>/dev/null || true

    # Build the application
    log_info "Building Docker images (this may take a few minutes)..."
    docker compose build --no-cache

    # Start PostgreSQL first
    log_info "Starting PostgreSQL container..."
    docker compose up -d postgres

    # Wait for PostgreSQL to be ready
    log_info "Waiting for PostgreSQL to be ready..."
    sleep 10

    # Check PostgreSQL health
    RETRIES=30
    until docker compose exec -T postgres pg_isready -U postgres -d nexus > /dev/null 2>&1; do
        RETRIES=$((RETRIES-1))
        if [ $RETRIES -eq 0 ]; then
            log_error "PostgreSQL failed to start"
            docker compose logs postgres
            exit 1
        fi
        log_info "Waiting for PostgreSQL... ($RETRIES retries left)"
        sleep 2
    done

    log_success "PostgreSQL is ready!"

    # Start the application
    log_info "Starting NEXUS application..."
    docker compose up -d app

    log_success "All containers started successfully!"
}

# ================================================================
# Development Mode (Local without Docker for app)
# ================================================================

run_dev_mode() {
    log_info "Running in development mode..."

    cd "$APP_DIR"

    # Start only PostgreSQL in Docker
    log_info "Starting PostgreSQL container..."
    docker compose up -d postgres

    # Wait for PostgreSQL
    log_info "Waiting for PostgreSQL to be ready..."
    sleep 5

    RETRIES=30
    until docker compose exec -T postgres pg_isready -U postgres -d nexus > /dev/null 2>&1; do
        RETRIES=$((RETRIES-1))
        if [ $RETRIES -eq 0 ]; then
            log_error "PostgreSQL failed to start"
            exit 1
        fi
        log_info "Waiting for PostgreSQL... ($RETRIES retries left)"
        sleep 2
    done

    log_success "PostgreSQL is ready!"

    # Check if pnpm is installed
    if ! command -v pnpm &> /dev/null; then
        log_info "Installing pnpm..."
        npm install -g pnpm
    fi

    # Install dependencies
    log_info "Installing Node.js dependencies..."
    pnpm install

    # Generate Prisma client
    log_info "Generating Prisma client..."
    pnpm prisma generate

    # Push database schema
    log_info "Pushing database schema..."
    pnpm prisma db push

    # Run seed script
    log_info "Running database seed..."
    pnpm seed

    # Start development server
    log_info "Starting development server..."
    pnpm run dev
}

# ================================================================
# Utility Functions
# ================================================================

show_status() {
    log_info "Container Status:"
    docker compose ps

    echo ""
    log_info "Container Logs (last 20 lines):"
    docker compose logs --tail=20
}

show_logs() {
    docker compose logs -f
}

stop_containers() {
    log_info "Stopping containers..."
    docker compose down
    log_success "Containers stopped"
}

cleanup() {
    log_warning "This will remove all containers, volumes, and images"
    read -p "Are you sure? (y/N): " confirm
    if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
        docker compose down -v --rmi all
        log_success "Cleanup complete"
    else
        log_info "Cleanup cancelled"
    fi
}

print_help() {
    echo "NEXUS Setup Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  install     Install Docker, Docker Compose, and set up the application (default)"
    echo "  dev         Run in development mode (PostgreSQL in Docker, app locally)"
    echo "  start       Start all containers"
    echo "  stop        Stop all containers"
    echo "  restart     Restart all containers"
    echo "  status      Show container status and logs"
    echo "  logs        Follow container logs"
    echo "  cleanup     Remove all containers, volumes, and images"
    echo "  help        Show this help message"
    echo ""
    echo "Environment Variables:"
    echo "  REPO_URL    Git repository URL (default: https://github.com/your-username/nexus.git)"
    echo "  APP_DIR     Application directory (default: /opt/nexus)"
    echo ""
    echo "Examples:"
    echo "  sudo $0 install              # Full installation"
    echo "  sudo $0 dev                  # Development mode"
    echo "  REPO_URL=https://github.com/user/repo.git sudo $0 install"
}

# ================================================================
# Main Script
# ================================================================

main() {
    print_banner

    COMMAND=${1:-install}

    case $COMMAND in
        install)
            check_root
            install_dependencies
            install_docker
            install_docker_compose
            setup_application
            create_env_file
            build_and_start
            echo ""
            log_success "NEXUS is now running!"
            log_info "Access the application at: http://localhost:3000"
            log_info "PostgreSQL is available at: localhost:5432"
            echo ""
            log_info "Default Admin Credentials:"
            echo "  Email: pritammaityofficial132@gmail.com"
            echo "  Password: Admin@123"
            echo ""
            log_info "To view logs: $0 logs"
            log_info "To stop: $0 stop"
            ;;
        dev)
            run_dev_mode
            ;;
        start)
            cd "$APP_DIR"
            docker compose up -d
            log_success "Containers started"
            ;;
        stop)
            cd "$APP_DIR"
            stop_containers
            ;;
        restart)
            cd "$APP_DIR"
            docker compose restart
            log_success "Containers restarted"
            ;;
        status)
            cd "$APP_DIR"
            show_status
            ;;
        logs)
            cd "$APP_DIR"
            show_logs
            ;;
        cleanup)
            cd "$APP_DIR"
            cleanup
            ;;
        help|--help|-h)
            print_help
            ;;
        *)
            log_error "Unknown command: $COMMAND"
            print_help
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
