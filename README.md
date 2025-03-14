# Kahuut
A browser-based quiz game named Kahuut, drawing inspiration from Kahoot. 
The application is intended to be used by UCLA students and provides a 
refreshing way to leisurely study.

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

> Make sure that you have redis installed globally in order to run the redis-server command (this is crucial for the backend). There is utilization of the npm redis package due to the Express in the backend

* For **Mac** users, run `brew install redis`.
* For **Windows** users, run  `choco install redis`.
Just a side note, if you using Windows, don't.

* In `client/`, run `npm run dev` to start the app on `localhost`
* In `server/`, run the bash script `setup.sh`
