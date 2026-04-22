# Fake ČSFD

React + Express aplikace jako MVP verze osobního ČSFD pro vyhledávání filmů a správu vlastního seznamu zhlednutých a ohodnocených filmů.

Splněno: React SPA s routovaním, Express REST API, SQLite + Prisma ORM, dva propojené resources (`users`, `watched_movies`), CRUD pro filmy v seznamu a zakladni operace nad uživatelem.

Navíc: Přihlášení a registrace přes JWT, chráněné API endpointy.

Poznámka: Pro zjednodušení spuštění je `.env` ponechaný v repozitáři (odebraný z `.gitignore`), aby nebylo nutné ručně vyplňovat `JWT_SECRET`.

## Spuštění

```cmd v root
cd be && npm i && npm run db:migrate && npm run dev
```

```cmd v root
cd fe && npm i && npm run dev
```

## Chyba EADDRINUSE (port 3001)
Vypnout docker (radši do budoucna)