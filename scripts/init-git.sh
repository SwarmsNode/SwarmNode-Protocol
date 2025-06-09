#!/bin/bash

echo "🔧 Initialisation Git pour GitHub..."

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Vérifier si c'est déjà un repo Git
if [ ! -d ".git" ]; then
    git init
    echo "📁 Repository Git initialisé"
fi

# Ajouter tous les fichiers
git add .

# Premier commit
git commit -m "🎉 Initial commit: SwarmNode Protocol

✨ Features:
- Clean project structure ready for open source
- Modern website with Tailwind CSS and clean design
- Smart contracts for agent registry and task management
- Frontend dashboard for monitoring and control
- Comprehensive documentation and contribution guidelines
- CI/CD pipeline with GitHub Actions
- Development scripts for easy setup

🏗️ Architecture:
- Next.js website with modern UI
- React/Vite frontend dashboard
- Solidity smart contracts on Avalanche
- TypeScript throughout the stack
- Tailwind CSS for styling

📚 Documentation:
- Professional README with clear instructions
- Contribution guidelines for open source collaboration
- API documentation and agent development guide
- Comprehensive project structure overview

🚀 Ready for:
- GitHub publication
- Open source collaboration
- Community contributions
- Production deployment"

echo "✅ Projet prêt pour GitHub !"
echo ""
echo "🚀 Prochaines étapes :"
echo "1. Créez un nouveau repository sur GitHub"
echo "2. ${BLUE}git remote add origin https://github.com/votre-username/swarmnode-protocol.git${NC}"
echo "3. ${BLUE}git branch -M main${NC}"
echo "4. ${BLUE}git push -u origin main${NC}"
echo ""
echo "💡 Pour démarrer le développement :"
echo "  ${BLUE}./scripts/dev.sh${NC}"
