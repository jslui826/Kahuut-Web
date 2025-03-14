#!/bin/bash

# Navigate to the server directory and run the setup script
cd server || exit
echo "Setting up the server..."
./setup.sh &

if command -v gnome-terminal &> /dev/null; then
    gnome-terminal -- bash -c 'cd client && npm run dev; exec bash'
elif command -v x-terminal-emulator &> /dev/null; then
    x-terminal-emulator -e bash -c 'cd client && npm run dev; exec bash'
elif command -v konsole &> /dev/null; then
    konsole -e bash -c 'cd client && npm run dev; exec bash'
elif command -v mate-terminal &> /dev/null; then
    mate-terminal -- bash -c 'cd client && npm run dev; exec bash'
elif command -v xfce4-terminal &> /dev/null; then
    xfce4-terminal -- bash -c 'cd client && npm run dev; exec bash'
elif [[ "$OSTYPE" == "darwin"* ]]; then
    osascript -e 'tell application "Terminal" to do script "cd ~/35L_Group_Project/client && npm run dev"'
elif command -v start &> /dev/null; then
    start cmd /k "cd client && npm run dev"
else
    echo "No compatible terminal found. Please start the client manually."
fi
