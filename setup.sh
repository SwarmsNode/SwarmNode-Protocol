#!/bin/bash

# Script de configuration rapide pour SwarmNode Protocol
# Ce script configure l'environnement de développement complet

set -e

echo "🚀 Configuration de SwarmNode Protocol..."

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Vérification des prérequis
check_prerequisites() {
    log_info "Vérification des prérequis..."
    
    # Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js n'est pas installé. Veuillez l'installer depuis https://nodejs.org/"
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 16 ]; then
        log_error "Node.js version 16+ requise. Version actuelle: $(node --version)"
        exit 1
    fi
    
    # npm
    if ! command -v npm &> /dev/null; then
        log_error "npm n'est pas installé."
        exit 1
    fi
    
    # Git
    if ! command -v git &> /dev/null; then
        log_warning "Git n'est pas installé. Certaines fonctionnalités peuvent ne pas fonctionner."
    fi
    
    log_success "Prérequis vérifiés"
}

# Configuration de l'environnement
setup_environment() {
    log_info "Configuration de l'environnement..."
    
    # Copie du fichier .env
    if [ ! -f .env ]; then
        cp .env.example .env
        log_success "Fichier .env créé à partir de .env.example"
        log_warning "Veuillez configurer vos variables d'environnement dans .env"
    else
        log_info "Fichier .env existe déjà"
    fi
    
    # Configuration Git hooks (si Git est disponible)
    if command -v git &> /dev/null && [ -d .git ]; then
        if [ ! -d .husky ]; then
            npx husky-init
            log_success "Hooks Git configurés avec Husky"
        fi
    fi
}

# Installation des dépendances
install_dependencies() {
    log_info "Installation des dépendances du projet principal..."
    npm install
    log_success "Dépendances principales installées"
    
    log_info "Installation des dépendances du frontend..."
    cd frontend
    npm install
    cd ..
    log_success "Dépendances frontend installées"
}

# Compilation des contrats
compile_contracts() {
    log_info "Compilation des smart contracts..."
    npx hardhat compile
    log_success "Smart contracts compilés"
}

# Construction du SDK
build_sdk() {
    log_info "Construction du SDK TypeScript..."
    npm run build:sdk 2>/dev/null || {
        log_warning "Script build:sdk non trouvé, compilation manuelle..."
        npx tsc
    }
    log_success "SDK construit"
}

# Tests
run_tests() {
    log_info "Exécution des tests..."
    
    # Tests des contrats
    log_info "Tests des smart contracts..."
    npx hardhat test
    log_success "Tests des contrats passés"
    
    # Tests du frontend (si configurés)
    if [ -f frontend/package.json ]; then
        cd frontend
        if npm run test --silent 2>/dev/null; then
            log_success "Tests frontend passés"
        else
            log_warning "Tests frontend non configurés ou échoués"
        fi
        cd ..
    fi
}

# Démarrage du réseau local
start_local_network() {
    log_info "Démarrage du réseau Hardhat local..."
    
    # Vérifier si le réseau est déjà en cours d'exécution
    if lsof -Pi :8545 -sTCP:LISTEN -t >/dev/null; then
        log_warning "Un réseau local semble déjà fonctionner sur le port 8545"
        return
    fi
    
    # Démarrer le réseau en arrière-plan
    npx hardhat node &
    HARDHAT_PID=$!
    
    # Attendre que le réseau soit prêt
    log_info "Attente du démarrage du réseau..."
    sleep 5
    
    if kill -0 $HARDHAT_PID 2>/dev/null; then
        log_success "Réseau local démarré (PID: $HARDHAT_PID)"
        echo $HARDHAT_PID > .hardhat.pid
    else
        log_error "Échec du démarrage du réseau local"
    fi
}

# Déploiement local
deploy_local() {
    log_info "Déploiement sur le réseau local..."
    
    # Attendre un peu pour s'assurer que le réseau est prêt
    sleep 2
    
    npx hardhat run scripts/deploy.ts --network localhost
    log_success "Contrats déployés sur le réseau local"
}

# Génération de la documentation
generate_docs() {
    log_info "Génération de la documentation..."
    
    # Documentation des contrats
    if command -v solidity-docgen &> /dev/null; then
        npx hardhat docgen
        log_success "Documentation des contrats générée"
    else
        log_warning "solidity-docgen non installé, installation..."
        npm install --save-dev solidity-docgen
        npx hardhat docgen
        log_success "Documentation des contrats générée"
    fi
    
    # Documentation du SDK
    if command -v typedoc &> /dev/null; then
        npx typedoc --out docs/api src/index.ts
        log_success "Documentation du SDK générée"
    else
        log_warning "typedoc non installé, sautant la génération de la doc SDK"
    fi
}

# Menu interactif
show_menu() {
    echo ""
    echo "🎯 Configuration SwarmNode Protocol"
    echo "=================================="
    echo "1. Installation complète (recommandée)"
    echo "2. Installation des dépendances uniquement"
    echo "3. Compilation des contrats"
    echo "4. Tests"
    echo "5. Démarrage du réseau local"
    echo "6. Déploiement local"
    echo "7. Génération de la documentation"
    echo "8. Configuration environnement de développement"
    echo "9. Tout nettoyer et recommencer"
    echo "0. Quitter"
    echo ""
    read -p "Choisissez une option (0-9): " choice
}

# Installation complète
full_setup() {
    log_info "🚀 Installation complète de SwarmNode Protocol..."
    
    check_prerequisites
    setup_environment
    install_dependencies
    compile_contracts
    build_sdk
    run_tests
    start_local_network
    deploy_local
    generate_docs
    
    echo ""
    log_success "🎉 Installation complète terminée !"
    echo ""
    echo "📋 Prochaines étapes :"
    echo "   1. Configurez vos variables d'environnement dans .env"
    echo "   2. Consultez la documentation dans docs/"
    echo "   3. Explorez les exemples dans examples/"
    echo "   4. Démarrez le frontend : cd frontend && npm run dev"
    echo ""
    echo "🔗 Liens utiles :"
    echo "   - Réseau local : http://localhost:8545"
    echo "   - Frontend : http://localhost:3000"
    echo "   - Documentation : docs/README.md"
    echo ""
}

# Nettoyage
clean_all() {
    log_warning "🧹 Nettoyage de tous les fichiers générés..."
    
    read -p "Êtes-vous sûr de vouloir supprimer tous les fichiers générés ? (y/N): " confirm
    if [[ $confirm != [yY] ]]; then
        log_info "Nettoyage annulé"
        return
    fi
    
    # Arrêt du réseau local s'il fonctionne
    if [ -f .hardhat.pid ]; then
        HARDHAT_PID=$(cat .hardhat.pid)
        if kill -0 $HARDHAT_PID 2>/dev/null; then
            kill $HARDHAT_PID
            log_info "Réseau local arrêté"
        fi
        rm .hardhat.pid
    fi
    
    # Suppression des dossiers de build
    rm -rf artifacts cache coverage dist node_modules frontend/node_modules
    rm -rf docs/api docs/contracts
    
    log_success "Nettoyage terminé"
}

# Configuration de l'environnement de développement
setup_dev_environment() {
    log_info "Configuration de l'environnement de développement..."
    
    # Installation des outils de développement
    npm install --save-dev husky lint-staged prettier eslint
    
    # Configuration de Prettier
    cat > .prettierrc << EOF
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
EOF
    
    # Configuration d'ESLint
    if [ ! -f .eslintrc.js ]; then
        npx eslint --init
    fi
    
    # Configuration VS Code
    mkdir -p .vscode
    cat > .vscode/settings.json << EOF
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
EOF
    
    cat > .vscode/extensions.json << EOF
{
  "recommendations": [
    "juanblanco.solidity",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "eamodio.gitlens",
    "rangav.vscode-thunder-client"
  ]
}
EOF
    
    log_success "Environnement de développement configuré"
}

# Boucle principale
main() {
    echo "🌟 Bienvenue dans le configurateur SwarmNode Protocol !"
    echo ""
    
    # Si des arguments sont passés, exécuter directement
    if [ $# -gt 0 ]; then
        case $1 in
            --full)
                full_setup
                exit 0
                ;;
            --deps)
                check_prerequisites
                install_dependencies
                exit 0
                ;;
            --clean)
                clean_all
                exit 0
                ;;
            --help)
                echo "Usage: $0 [--full|--deps|--clean|--help]"
                echo "  --full   Installation complète"
                echo "  --deps   Installation des dépendances uniquement"
                echo "  --clean  Nettoyage complet"
                echo "  --help   Afficher cette aide"
                exit 0
                ;;
        esac
    fi
    
    # Menu interactif
    while true; do
        show_menu
        
        case $choice in
            1)
                full_setup
                ;;
            2)
                check_prerequisites
                install_dependencies
                ;;
            3)
                compile_contracts
                ;;
            4)
                run_tests
                ;;
            5)
                start_local_network
                ;;
            6)
                deploy_local
                ;;
            7)
                generate_docs
                ;;
            8)
                setup_dev_environment
                ;;
            9)
                clean_all
                ;;
            0)
                log_info "Au revoir !"
                exit 0
                ;;
            *)
                log_error "Option invalide. Veuillez choisir entre 0 et 9."
                ;;
        esac
        
        echo ""
        read -p "Appuyez sur Entrée pour continuer..."
    done
}

# Exécution du script principal
main "$@"
