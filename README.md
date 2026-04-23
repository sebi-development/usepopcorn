# usePopcorn

A full-stack personal movie tracker — search any film, rate it, and maintain your own watched list. Think of it as a lightweight personal ČSFD/Letterboxd built from scratch with a React frontend and an Express REST API backend.

---

## Project Overview

usePopcorn is split into two independent applications that run simultaneously:

- **`fe/`** — React SPA (Vite + React Router + Redux Toolkit)
- **`be/`** — Express REST API (Node.js + Prisma ORM + SQLite)

### Frontend (`fe/`)

Built with React 18 and Vite. Key libraries:

- **React Router v7** — client-side routing with loaders, actions, and protected routes
- **Redux Toolkit** — global state split into three slices: `auth` (JWT token + user), `ui` (search query, selected movie, result count), and `watched` (the user's movie list with async thunks for all API calls)
- **react-hot-toast** — non-intrusive success/error notifications
- **react-icons (hi2)** — Heroicons v2 icon set

The app has five routes:
| Path | Access | Description |
|---|---|---|
| `/landing` | Public | Landing page with feature overview |
| `/login` | Public | JWT login form |
| `/register` | Public | Registration form |
| `/` | Protected | Main app — search + watched list |
| `/profile` | Protected | Edit name and password |

Movie data is fetched from the [OMDb API](https://www.omdbapi.com/) directly from the frontend using a debounced search input.

### Backend (`be/`)

Express server exposing a REST API on port `3001`. Data is stored in a local SQLite file managed by Prisma.

**Resources:**

- **`users`** — registered accounts with hashed passwords (bcrypt) and JWT-based auth
- **`watched_movies`** — per-user list of rated and watched films (full CRUD)

**Endpoints:**

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | No | Create account, returns JWT |
| `POST` | `/auth/login` | No | Login, returns JWT |
| `GET` | `/auth/me` | Yes | Get current user |
| `PATCH` | `/auth/me` | Yes | Update name / password |
| `GET` | `/watched` | Yes | List all watched movies |
| `POST` | `/watched` | Yes | Add a movie |
| `DELETE` | `/watched/:imdbID` | Yes | Remove a movie |

Authentication uses Bearer tokens — the frontend stores the JWT in `localStorage` and attaches it to every protected request via an `Authorization` header.

---

## Getting Started

You need two terminals open simultaneously — one for the backend, one for the frontend.

**1. Start the backend**
```bash
cd be && npm i && npm run db:migrate && npm run dev
```
This installs dependencies, runs the Prisma migration to create the SQLite database schema, and starts the Express server on `http://localhost:3001`.

**2. Start the frontend**
```bash
cd fe && npm i && npm run dev
```
Starts the Vite dev server on `http://localhost:5173`.

**3. Open the app**

Navigate to `http://localhost:5173/landing` — you'll see the landing page. Click **Get started free** to register.

Example credentials you can use:
```
Email:    name@email.com
Username: name
Password: 12three
Confirm:  12three
```

---

## Usage

Once logged in you land on the main app view:

- **Search** — type any movie title in the search bar. Results appear live as you type (debounced at 500ms). Click a result to open the detail panel.
- **Rate & Add** — in the detail panel, pick a star rating and click *Add to list* to save the movie to your watched list.
- **Edit rating** — click the pencil icon on any watched movie to adjust your rating inline.
- **Delete** — click the red circle icon to remove a movie from your list.
- **Stats** — the summary at the top of your watched list shows your average IMDb score, average personal rating, and total runtime.
- **Profile** — click the avatar in the top-right navbar to access your profile, where you can update your display name or change your password.

---

## Common Errors

**`EADDRINUSE: address already in use (port 3001)`**
Something else is already running on port 3001. Stop that process (or restart Docker if it's container-related) and try again.

**`CORS ORIGIN error / registration fails`**
The backend CORS config allows only `http://localhost:5173`. Make sure nothing else is occupying that port and that the frontend is running there.

---

## Notes

The `.env` file is intentionally committed to the repository for ease of local setup — it contains only the `JWT_SECRET` used for signing tokens. Do not do this in a production environment.