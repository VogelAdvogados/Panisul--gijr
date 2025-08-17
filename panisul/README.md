## PaniSul Monorepo

- apps/backend: API Express/Prisma/TS
- apps/contracts: Tipos/DTOs compartilhados (zod)
- apps/frontend: React (a criar)
- docs/openapi-v1.yaml: OpenAPI v1

### Requisitos
- Node >= 18.17
- Docker (para Postgres)

### Primeiros passos
```bash
# subir Postgres
docker compose up -d

# instalar deps
npm install

# gerar prisma client
npm run --workspace @panisul/backend prisma:generate

# rodar o backend
npm run dev:backend
```