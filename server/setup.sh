#!/bin/bash
npm install

# Define the subprocess directory
SUBPROCESS_DIR="python_subprocesses"

# Check if virtual environment exists, create if not
if [ ! -d "$SUBPROCESS_DIR/subprocesses" ]; then
    echo "Creating virtual environment..."
    python -m venv "$SUBPROCESS_DIR/subprocesses"
fi

# Activate the virtual environment
source "$SUBPROCESS_DIR/subprocesses/bin/activate"

# Check if requirements.txt exists
if [ -f "$SUBPROCESS_DIR/requirements.txt" ]; then
    echo "Installing dependencies..."
    pip install -r "$SUBPROCESS_DIR/requirements.txt"
else
    echo "No requirements.txt found. Skipping dependency installation."
fi

nodemon dev