#!/bin/bash

# Function to create pyton virtual environment
create_python_environment() {
    echo "Creating Python Virtual Environment.."
    python -m venv .venv
    source .venv/bin/activate
}

install_python_requirements() {
    echo "Installing latest pip, setuptools and wheel.."
    python -m pip install --upgrade pip setuptools wheel

    echo "Installing Python requirements.."
    python -m pip install pycryptodome eth-hash[pycryptodome] eth-utils

    python -m pip install pandas numpy pillow "qrcode[pil]" scikit-learn joblib uvicorn fastapi fastapi[standard]
}

install_npm_dependencies() {
    echo "Deleting existing node_modules if any.."
    rm -rf frontend/node_modules

    echo "Installing NPM dependencies.."
    cd frontend
    npm install
    cd ..
}

build_npm_project() {
    echo "Building NPM project.."
    cd frontend
    npm run build
    cd ..
}

main() {
    create_python_environment
    install_python_requirements
    install_npm_dependencies
    build_npm_project
}

main