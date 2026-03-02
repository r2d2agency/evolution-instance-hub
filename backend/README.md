# W-API Hub Backend

Backend Node.js/Express para gerenciar instâncias W-API com persistência PostgreSQL.

## Setup

1. Instale dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente (`.env`):
```env
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/wapi_hub
WAPI_TOKEN=seu_token_de_integracao_wapi
WAPI_BASE_URL=https://api.w-api.app/v1
```

3. Inicialize o banco:
```bash
npm run db:init
```

4. Inicie o servidor:
```bash
npm start
```

## Deploy no EasyPanel

1. Crie um serviço "App" apontando para esta pasta
2. Crie um serviço "Postgres" para o banco
3. Configure as variáveis de ambiente no serviço App
4. O EasyPanel detecta o `Dockerfile` e faz o build

## Endpoints

### Instâncias
| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/api/instances` | Cria instância + configura webhooks |
| `GET` | `/api/instances` | Lista todas as instâncias |
| `GET` | `/api/instances/:id` | Detalhes de uma instância |
| `DELETE` | `/api/instances/:id` | Deleta instância |
| `GET` | `/api/instances/:id/qrcode` | QR Code para conexão |
| `POST` | `/api/instances/:id/disconnect` | Desconecta instância |
| `POST` | `/api/instances/:id/restart` | Reinicia instância |
| `PUT` | `/api/instances/:id/webhooks` | Atualiza webhooks |
| `PUT` | `/api/instances/:id/auto-read` | Toggle leitura automática |
| `PUT` | `/api/instances/:id/rename` | Renomear instância |
| `GET` | `/api/instances/:id/device` | Dados do dispositivo |
| `GET` | `/api/instances/:id/status` | Status da conexão |
