#!/bin/bash

# Script de développement SwarmNode
# Lance tous les services en développement

echo "🚀 Lancement de SwarmNode en mode développement..."

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
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

# Fonction pour tuer les processus à la fin
cleanup() {
    print_info "Arrêt des services..."
    kill $(jobs -p) 2>/dev/null
    exit 0
}

# Trap pour nettoyer à la sortie
trap cleanup SIGINT SIGTERM

# Se déplacer dans le répertoire racine
cd "$(dirname "$0")/.."

print_info "Installation des dépendances..."

# Installation des dépendances pour chaque service
if [ -d "website" ]; then
    print_info "Installation des dépendances du site web..."
    cd website && npm install --silent && cd ..
    print_success "Dépendances du site web installées"
fi

if [ -d "frontend" ]; then
    print_info "Installation des dépendances du frontend..."
    cd frontend && npm install --silent && cd ..
    print_success "Dépendances du frontend installées"
fi

if [ -f "package.json" ]; then
    print_info "Installation des dépendances principales..."
    npm install --silent
    print_success "Dépendances principales installées"
fi

print_success "Toutes les dépendances sont installées"

echo ""
print_info "Lancement des services..."

# Démarrer le site web
if [ -d "website" ]; then
    print_info "Démarrage du site web (port 3000)..."
    cd website
    npm run dev &
    cd ..
    print_success "Site web démarré"
fi

# Démarrer le frontend
if [ -d "frontend" ]; then
    print_info "Démarrage du frontend (port 5173)..."
    cd frontend
    npm run dev &
    cd ..
    print_success "Frontend démarré"
fi

echo ""
print_success "🎉 Tous les services sont démarrés !"
echo ""
print_info "Services accessibles :"
if [ -d "website" ]; then
    echo -e "  ${GREEN}• Site web:${NC} http://localhost:3000"
fi
if [ -d "frontend" ]; then
    echo -e "  ${GREEN}• Frontend:${NC} http://localhost:5173"
fi
echo ""
print_warning "Appuyez sur Ctrl+C pour arrêter tous les services"

# Attendre indéfiniment (les processus en arrière-plan continuent)
wait

trap cleanup SIGINT SIGTERM

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé"
    exit 1
fi

# Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
    print_info "Installation des dépendances racine..."
    npm install
fi

# Lancer Hardhat en arrière-plan
print_info "Démarrage du nœud Hardhat local..."
npx hardhat node &
HARDHAT_PID=$!
sleep 3

# Déployer les contracts
print_info "Déploiement des smart contracts..."
npx hardhat run scripts/deploy.ts --network localhost || print_warning "Échec du déploiement - continuons quand même"

# Lancer le frontend
print_info "Démarrage du frontend..."
if [ -d "frontend" ]; then
    cd frontend
    if [ ! -d "node_modules" ]; then
        npm install
    fi
    npm run dev &
    FRONTEND_PID=$!
    cd ..
fi

# Lancer le site web
print_info "Démarrage du site web..."
if [ -d "website" ]; then
    cd website
    if [ ! -d "node_modules" ]; then
        npm install
    fi
    npm run dev &
    WEBSITE_PID=$!
    cd ..
fi

print_success "Tous les services sont lancés !"
echo ""
echo "🌐 Services disponibles :"
echo "  - Blockchain locale : http://localhost:8545"
if [ -d "frontend" ]; then
    echo "  - Frontend Dashboard : http://localhost:5173"
fi
if [ -d "website" ]; then
    echo "  - Site Web : http://localhost:3000"
fi
echo ""
echo "Appuyez sur Ctrl+C pour arrêter tous les services"

# Attendre
wait
