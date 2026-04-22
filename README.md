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

## Otestování:
Do webové URL zadejte http://localhost:5173/, poté klikněte Register
Použitelné údaje:
```
Email: jmeno@email.cz
Username: jmeno
Password: 12tri
Repeat: 12tri
```
(Pokud se nedá přihlásit, zkontrolujte ERRORY)

V kolonce Search movies... se dá vyhledat jakýkoliv film. Poté se může ohodnotit a přidat do watchlistu. Filmu se dají z vlastního seznamu mazat nebo upravovat hodnocení (CRUD OPERACE)

## ERRORY
`EADDRINUSE (port 3001)`
Vypnout proces na 3001 (nebo rovnou celý docker (jestli to je kvůli němu))

`CORS ORIGIN (Nejde udělat registraci)`
FE musí běžet na portu 5173 kvůli CORS. Vypněte proces zabírající tento port a restartujte FE