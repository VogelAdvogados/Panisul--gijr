## PaniSul Monorepo

- apps/backend: API Express/Prisma/TS
- apps/contracts: Tipos/DTOs compartilhados (zod)
- apps/frontend: React (Vite)
- docs/openapi-v1.yaml: OpenAPI v1

### Requisitos
- Node >= 18.17
- Postgres acessível (ajuste `DATABASE_URL` em `apps/backend/.env`)

### Setup automático
```bash
# instalar deps
npm install

# backend: gerar client, migrar e seed
# OBS: se não visualizar apps/backend/.env.example, use apps/backend/ENV.EXAMPLE
[ -f apps/backend/.env ] || cp apps/backend/.env.example apps/backend/.env 2>/dev/null || cp apps/backend/ENV.EXAMPLE apps/backend/.env
npm run --workspace @panisul/backend prisma:generate
npm run --workspace @panisul/backend prisma:migrate
npm run --workspace @panisul/backend db:seed

# subir apps (back e front)
npm run dev
```

Observação: o ambiente desta máquina não possui Docker. Se preferir usar Docker, utilize o `docker-compose.yml` localmente na sua máquina.