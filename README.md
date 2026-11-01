# Construction CRM

The frontend is a React application in `src/`. The API is an Express server in `Backend/` and uses MySQL.

## Run locally

1. From the project folder, run `npm install` if dependencies are not installed.
2. Start the frontend with `npm start`. It runs at `http://localhost:3000`.
3. In a second terminal, go to `Backend/` and run `npm start`. The API runs at `http://localhost:5000`.

The backend expects a local MySQL database named `construction_crm`; connection settings are in `Backend/Db.js`.

## Pages

The frontend includes the dashboard, customers, projects, employees, payments, reports, leads, brokers, properties, users and roles, documents, follow-ups, inventory, and project statistics.
