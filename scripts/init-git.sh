#!/bin/bash

echo "🔧 Git initialization for GitHub..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if it's already a Git repo
if [ ! -d ".git" ]; then
    git init
    echo "📁 Git repository initialized"
fi

# Add all files
git add .

# First commit
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

echo "✅ Project ready for GitHub !"
echo ""
echo "🚀 Next steps:"
echo "1. Create a new repository on GitHub"
echo "2. ${BLUE}git remote add origin https://github.com/your-username/swarmnode-protocol.git${NC}"
echo "3. ${BLUE}git branch -M main${NC}"
echo "4. ${BLUE}git push -u origin main${NC}"
echo ""
echo "💡 To start development:"
echo "  ${BLUE}./scripts/dev.sh${NC}"
