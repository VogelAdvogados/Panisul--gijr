### Backend (@panisul/backend)

- Copie `.env.example` para `.env` e ajuste valores (porta, DATABASE_URL, JWT_SECRET, CORS_ORIGIN)
- Gere Prisma Client, execute migrações e rode seeds

Comandos:

```bash
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run db:seed
npm run dev
```

Endpoints de saúde:
- `GET /api/v1/health` (liveness)
- `GET /api/v1/ready` (readiness com verificação de DB)