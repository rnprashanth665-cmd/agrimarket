# AgriMarket — Frontend

React (Vite) frontend for **AgriMarket**, an agricultural marketplace connecting farmers directly with buyers. Built to talk to a FastAPI + PostgreSQL backend running at `http://127.0.0.1:8000`.

## Tech stack

- React 18 + Vite
- React Router v6
- Axios (with a centralized instance + JWT interceptor)
- Plain modern CSS (no UI framework), agriculture-themed design system

## Getting started

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173`. Make sure your FastAPI backend is running at `http://127.0.0.1:8000` (configured in `src/api/axios.js`).

## Project structure

```
src/
├── api/            # Axios instance + one file per API domain
├── components/     # Reusable UI: Navbar, Sidebar, cards, tables, badges...
├── context/         # AuthContext (JWT/role/user state)
├── pages/          # One file per route/page
├── App.jsx         # Route definitions + protected routes
├── main.jsx        # App entry point
└── index.css       # Design system (tokens, layout, components)
```

## Authentication

- JWT token, role and user id are stored in `localStorage` after login.
- Axios automatically attaches `Authorization: Bearer <token>` to every request.
- `ProtectedRoute` redirects unauthenticated users to `/login`, and redirects users with the wrong role to `/unauthorized`.
- A `401` response anywhere clears the session and redirects to `/login` automatically.

## Backend endpoints expected

The API layer (`src/api/*.js`) assumes the following FastAPI routes exist. Adjust the paths in those files if your backend uses different ones:

- `POST /auth/farmer/login`, `POST /auth/buyer/login`
- `POST /auth/farmer/register`, `POST /auth/buyer/register`
- `GET/PUT /farmer/profile`, `GET/PUT /buyer/profile`
- `GET /products`, `GET /farmer/products`, `POST /farmer/products`, `PUT /farmer/products/:id`, `DELETE /farmer/products/:id`
- `POST /buyer/orders`, `GET /buyer/orders`, `GET /farmer/orders`, `PUT /farmer/orders/:id/accept`, `PUT /farmer/orders/:id/reject`
- `GET /farmer/vehicles`, `POST /farmer/vehicles`, `DELETE /farmer/vehicles/:id`
- `GET /farmer/deliveries`, `POST /farmer/deliveries`, `PUT /farmer/deliveries/:id/status`
- `GET /ai/demand-forecast`, `GET /ai/price-prediction`, `GET /ai/route-optimization`, `GET /ai/dashboard`

## Notes

- No mock/dummy data is used anywhere — every list/dashboard fetches from the API and shows a loading state, an empty state, or an error message as appropriate.
- Sidebar collapses into a hamburger menu on screens under 900px; tables scroll horizontally on small screens.
