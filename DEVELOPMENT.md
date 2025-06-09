# Configuration du workspace SwarmNode Protocol

## Scripts de développement
{
  "scripts": {
    "dev": "npm run dev:contracts & npm run dev:sdk & npm run dev:frontend",
    "dev:contracts": "npx hardhat node",
    "dev:sdk": "npm run build:sdk -- --watch",
    "dev:frontend": "cd frontend && npm run dev",
    "setup": "npm run setup:env && npm run setup:contracts && npm run setup:frontend",
    "setup:env": "cp .env.example .env && echo 'Please configure your .env file'",
    "setup:contracts": "npm ci && npx hardhat compile",
    "setup:frontend": "cd frontend && npm ci",
    "test": "npm run test:contracts && npm run test:sdk && npm run test:frontend",
    "test:contracts": "npx hardhat test",
    "test:sdk": "jest src/**/*.test.ts",
    "test:frontend": "cd frontend && npm test",
    "build": "npm run build:contracts && npm run build:sdk && npm run build:frontend",
    "build:contracts": "npx hardhat compile",
    "build:sdk": "tsc && rollup -c",
    "build:frontend": "cd frontend && npm run build",
    "deploy:local": "npx hardhat deploy --network localhost",
    "deploy:testnet": "npx hardhat deploy --network fuji",
    "deploy:mainnet": "npx hardhat deploy --network mainnet",
    "verify:testnet": "npx hardhat verify --network fuji",
    "verify:mainnet": "npx hardhat verify --network mainnet",
    "docs:generate": "npx hardhat docgen && npx typedoc",
    "docs:serve": "npx docsify serve docs",
    "lint": "npm run lint:contracts && npm run lint:sdk && npm run lint:frontend",
    "lint:contracts": "npx solhint 'contracts/**/*.sol'",
    "lint:sdk": "eslint src/**/*.ts",
    "lint:frontend": "cd frontend && npm run lint",
    "format": "prettier --write .",
    "clean": "rm -rf artifacts cache coverage dist node_modules frontend/node_modules",
    "security:audit": "npm audit && npx slither . && npx mythx analyze",
    "update-metrics": "node scripts/updateMetrics.js"
  }
}

## Structure recommandée pour le développement

```
swarms/
├── .github/workflows/          # CI/CD et automatisation
├── contracts/                  # Smart contracts Solidity
├── src/                       # SDK TypeScript
├── frontend/                  # Interface utilisateur React
├── examples/                  # Exemples d'agents et d'usage
├── docs/                      # Documentation
├── test/                      # Tests
├── scripts/                   # Scripts utilitaires
├── deployments/              # Déploiements sur différents réseaux
└── tools/                    # Outils de développement
```

## Configuration de l'éditeur (VS Code)

### Extensions recommandées
- Solidity (Juan Blanco)
- ESLint
- Prettier
- TypeScript Importer
- GitLens
- Thunder Client (pour tester les APIs)
- Hardhat for Visual Studio Code

### Paramètres VS Code (.vscode/settings.json)
```json
{
  "solidity.defaultCompiler": "localNodeModule",
  "solidity.compileUsingRemoteVersion": "v0.8.19+commit.7dd6d404",
  "solidity.formatter": "prettier",
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.associations": {
    "*.sol": "solidity"
  }
}
```

## Variables d'environnement (.env)

### Développement local
```
# Réseau
NETWORK=localhost
RPC_URL=http://localhost:8545

# Clés privées (TESTNET SEULEMENT)
PRIVATE_KEY=0x...
MNEMONIC=test test test...

# APIs
INFURA_API_KEY=your_infura_key
ALCHEMY_API_KEY=your_alchemy_key
SNOWTRACE_API_KEY=your_snowtrace_key

# Base de données
DATABASE_URL=postgresql://user:pass@localhost:5432/swarmnode

# Services externes
IPFS_GATEWAY=https://ipfs.io/ipfs/
ARWEAVE_GATEWAY=https://arweave.net/

# Configuration frontend
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
VITE_CHAIN_ID=43113
```

### Production
```
# Réseau
NETWORK=mainnet
RPC_URL=https://api.avax.network/ext/bc/C/rpc

# Sécurité (via secrets GitHub/Vercel)
PRIVATE_KEY_ENCRYPTED=...
DATABASE_URL_ENCRYPTED=...

# Monitoring
SENTRY_DSN=...
MIXPANEL_TOKEN=...
```

## Hooks Git recommandés (.husky/)

### pre-commit
```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm run lint
npm run test:contracts
```

### pre-push
```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm run test
npm run build
```

## Configuration Docker (optionnel)

### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

### docker-compose.yml
```yaml
version: '3.8'
services:
  swarmnode:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    volumes:
      - ./logs:/app/logs
  
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: swarmnode
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

