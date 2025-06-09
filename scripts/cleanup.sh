#!/bin/bash

# Script de nettoyage final avant publication GitHub
# Supprime tous les fichiers/dossiers non essentiels

echo "🧹 Nettoyage final du projet SwarmNode pour GitHub..."

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_info() {
    echo -e "${BLUE}📝 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Se déplacer dans le répertoire racine du projet
cd "$(dirname "$0")/.."

print_info "Suppression des fichiers de cache et temporaires..."

# Supprimer les node_modules et caches
find . -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name ".next" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name "dist" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name "build" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name ".cache" -type d -exec rm -rf {} + 2>/dev/null || true

# Supprimer les fichiers de log
find . -name "*.log" -type f -delete 2>/dev/null || true
find . -name "npm-debug.log*" -type f -delete 2>/dev/null || true
find . -name "yarn-debug.log*" -type f -delete 2>/dev/null || true
find . -name "yarn-error.log*" -type f -delete 2>/dev/null || true

# Supprimer les fichiers temporaires
find . -name "*.tmp" -type f -delete 2>/dev/null || true
find . -name "*.temp" -type f -delete 2>/dev/null || true
find . -name ".DS_Store" -type f -delete 2>/dev/null || true
find . -name "Thumbs.db" -type f -delete 2>/dev/null || true

print_success "Cache et fichiers temporaires supprimés"

print_info "Suppression des dossiers non essentiels (s'ils existent encore)..."

# Liste des dossiers à supprimer définitivement
FOLDERS_TO_REMOVE=(
    "benchmarks"
    "e2e" 
    "monitoring"
    "nginx"
    "docs-site"
    "mobile"
    "database"
    "community"
)

for folder in "${FOLDERS_TO_REMOVE[@]}"; do
    if [ -d "$folder" ]; then
        rm -rf "$folder"
        print_warning "Supprimé: $folder/"
    fi
done

print_info "Vérification des fichiers de configuration sensibles..."

# Supprimer les fichiers de configuration sensibles
SENSITIVE_FILES=(
    ".env.local"
    ".env.production"
    "docker-compose.production.yml"
    "secrets.json"
    "private-key.txt"
)

for file in "${SENSITIVE_FILES[@]}"; do
    if [ -f "$file" ]; then
        rm "$file"
        print_warning "Supprimé fichier sensible: $file"
    fi
done

print_info "Validation de la structure finale..."

# Vérifier que les dossiers essentiels existent
ESSENTIAL_FOLDERS=(
    "contracts"
    "src" 
    "website"
    "frontend"
    "scripts"
    "docs"
    "examples"
)

for folder in "${ESSENTIAL_FOLDERS[@]}"; do
    if [ ! -d "$folder" ]; then
        print_error "ERREUR: Dossier essentiel manquant: $folder/"
        exit 1
    fi
done

# Vérifier que les fichiers essentiels existent
ESSENTIAL_FILES=(
    "README.md"
    "package.json"
    "LICENSE"
    "CONTRIBUTING.md"
    "scripts/dev.sh"
    "scripts/init-git.sh"
)

for file in "${ESSENTIAL_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        print_error "ERREUR: Fichier essentiel manquant: $file"
        exit 1
    fi
done

print_success "Structure du projet validée"

print_info "Génération du fichier .gitignore final..."

cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Production builds
/build
/dist
/.next/
/out/

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# nyc test coverage
.nyc_output

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Cache directories
.npm
.eslintcache
.parcel-cache

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# Next.js build output
.next

# Nuxt.js build / generate output
.nuxt
dist

# Vite build output
dist-ssr
*.local

# Rollup build output
dist/

# Serverless directories
.serverless/

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# TernJS port file
.tern-port

# Stores VSCode versions used for testing VSCode extensions
.vscode-test

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Blockchain & Contracts
artifacts/
cache/
typechain/
typechain-types/

# Hardhat files
artifacts
cache
coverage
coverage.json
typechain
typechain-types

# Solidity
/contracts/build/

# Avalanche
avalanche-cli/
EOF

print_success "Fichier .gitignore créé"

print_success "🎉 Nettoyage final terminé avec succès!"
print_info "Le projet est maintenant prêt pour la publication sur GitHub"
print_info "Exécutez 'scripts/init-git.sh' pour initialiser le dépôt Git"
