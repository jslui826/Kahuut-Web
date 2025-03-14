# Kahuut
A browser-based quiz game named Kahuut, drawing inspiration from Kahoot. 
The application is intended to be used by UCLA students and provides a 
refreshing way to leisurely study.

## Features
* Interactive Quizzes: Engage in dynamic quiz sessions to enhance learning.
* Upload pdfs and let them be automatically parsed into quizzes with our integration with an LLM.
* User-Friendly Interface: Intuitive design for seamless navigation.
* Real-Time Feedback: Immediate responses to quiz answers for effective learning.

## Setup
Run the application preferably on Chrome.
In order to run the project locally, have the following installed:
*   Node js,
*   Node Packet Manager
*   React
*   Vite
*   Express
*   Postgres (psql)
*   pip
*   Redis
*   Python

> Make sure that you have redis installed globally in order to run the redis-server command (this is crucial for the backend).
> There is utilization of the npm redis package due to the Express in the backend

* For **Mac** users, run `brew install redis`.
* For **Windows** users, run  `choco install redis`.
Just a side note, if you using Windows, don't.

* In `client/`, run `npm run dev` to start the app on `localhost` after `npm install`ing
* In `server/`, run the bash script `setup.sh`

We have included a bash script that, assuming that the setup above is adhered to, will run the server, redis cache, and the frontend: runapplication.sh

# Project Setup Script

This repository contains a setup script for a Node.js and Python-based project. The script automates the installation of dependencies, sets up a Python virtual environment, starts a Redis server, and launches the development server.

## Features
- Automatically cleans and reinstalls Node.js dependencies.
- Creates and activates a Python virtual environment.
- Installs Python dependencies from `requirements.txt`.
- Starts a Redis server in the background.
- Runs the Node.js development server with `nodemon`.

# Running the Application

## Start the Server
Navigate to the server directory:
```bash
cd server
* Run the setup script to install dependencies and connect to the database:
* ./setup.sh

In a different terminal, navigate to the client directory:
cd client

Start the frontend:
npm run dev
