## PaniSul Monorepo

Sistema de gestão para padaria com controle de vendas, estoque, clientes e produção.

### Arquitetura
- **Backend**: API Express/Prisma/TypeScript com validação Zod
- **Frontend**: React (Vite) com Tailwind CSS
- **Contracts**: Tipos/DTOs compartilhados (zod)
- **Database**: PostgreSQL com Prisma ORM
- **Docs**: OpenAPI v1

### Melhorias Implementadas

#### 🔒 Segurança
- **Rate Limiting**: Proteção contra ataques de força bruta (20 tentativas/15min)
- **JWT Seguro**: Configuração obrigatória de JWT_SECRET mínimo 32 caracteres
- **CORS Configurável**: Origens permitidas via CORS_ORIGINS
- **Helmet**: Headers de segurança HTTP
- **Validação Robusta**: Middleware global de validação com Zod

#### 📊 Monitoramento & Logs
- **Pino Logger**: Logs estruturados com pretty printing em desenvolvimento
- **Trace ID**: Rastreamento de requisições end-to-end
- **Health Check**: Endpoint `/api/v1/health` para monitoramento
- **Error Handling**: Tratamento padronizado de erros com códigos específicos

#### 🧪 Testes
- **Jest + Supertest**: Testes de integração para auth e vendas
- **Cobertura**: Testes de rate limiting, validação e fluxos críticos
- **TypeScript**: Configuração completa para testes ESM

#### 🎨 Frontend
- **Error Handling**: Interceptor 401/403 com redirecionamento automático
- **Loading States**: Feedback visual durante operações
- **UX Melhorada**: Interface moderna com Tailwind CSS
- **API Client**: Axios configurado com timeout e retry logic

#### ⚙️ Configuração
- **Environment**: Validação robusta de variáveis de ambiente
- **Defaults**: Valores padrão seguros para desenvolvimento
- **Flexibilidade**: Configuração por ambiente (dev/prod/test)

### Requisitos
- Node >= 18.17
- PostgreSQL acessível

### Setup Automático
```bash
# Instalar dependências
npm install

# Configurar ambiente
cp apps/backend/ENV.EXAMPLE apps/backend/.env

# Setup do banco (gerar client, migrar e seed)
npm run setup

# Subir aplicações (back e front)
npm run dev
```

### Scripts Disponíveis
```bash
# Desenvolvimento
npm run dev                    # Backend + Frontend
npm run dev:backend           # Apenas backend
npm run dev:frontend          # Apenas frontend

# Build & Deploy
npm run build                 # Build completo
npm run start                 # Produção

# Qualidade
npm run typecheck            # Verificação de tipos
npm run test                 # Executar testes
npm run test:coverage        # Cobertura de testes

# Banco de dados
npm run db:reset             # Reset completo do banco
npm run prisma:studio        # Interface visual do banco
```

### Variáveis de Ambiente
```env
PORT=4000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/panisul?schema=public"
JWT_SECRET="change-me-to-a-secure-secret-with-at-least-32-characters"
JWT_EXPIRES_IN=7d
CORS_ORIGINS="http://localhost:3000,http://localhost:5173"
LOG_LEVEL=debug
```

### Endpoints Principais
- `GET /api/v1/health` - Health check
- `POST /api/v1/auth/login` - Autenticação
- `POST /api/v1/auth/register` - Registro
- `GET /api/v1/docs` - Documentação OpenAPI

### Observações
- Ambiente sem Docker: use `docker-compose.yml` localmente se preferir
- Logs coloridos em desenvolvimento
- Rate limiting ativo nas rotas de autenticação
- Validação automática de tipos em tempo de compilação