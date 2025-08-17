### Backend (@panisul/backend)

- Copy `.env.example` to `.env` and adjust values
- Run Postgres via docker compose at repo root
- Generate Prisma client and run dev server

Commands:

```bash
cp .env.example .env
npm run prisma:generate
npm run dev
```