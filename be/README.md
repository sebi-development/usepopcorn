# Backend

Node.js + Express + Prisma + SQLite backend for `usepopcorn`.

## Run

1. In `be`, install dependencies:
   `npm install`
2. Create `.env` from `.env.example`.
3. Run the first migration:
   `npm run db:migrate -- --name init`
4. Start the server:
   `npm run dev`

Default URL: `http://localhost:3001`

## Environment

```env
PORT=3001
DATABASE_URL="file:./backend.db"
JWT_SECRET="replace-with-a-long-random-secret"
```

## Endpoints

### Auth

- `POST /auth/register`
- `POST /auth/login`

Request body:

```json
{
  "email": "user@example.com",
  "password": "secret123"
}
```

Response:

```json
{
  "token": "jwt",
  "user": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

### Watched

All watched endpoints require:

`Authorization: Bearer <token>`

- `GET /watched`
- `POST /watched`
- `PATCH /watched/:imdbID`
- `DELETE /watched/:imdbID`

Watched movie shape:

```json
{
  "imdbID": "tt0133093",
  "title": "The Matrix",
  "year": "1999",
  "poster": "https://...",
  "imdbRating": 8.7,
  "runtime": 136,
  "userRating": 9,
  "isViewed": true
}
```

## Error responses

The API always returns errors as:

```json
{
  "error": "message"
}
```
## Project VAJ

### Instructions

You will find instrucions on https://github.com/vsb-vaj

Split your projects into 2 JS projects. You will have 2x package.json. One will be for BE in folder be, one will be for FE in folder fe. 

You can write instructions to your project either in this README ind in separeate README files in the folders be, fe. 

Delete this text after you finish :) 

Good luck!

