# 🤝 Guide de Contribution - SwarmNode Protocol

Merci de votre intérêt pour contribuer à SwarmNode ! Ce guide vous aidera à démarrer.

## 🚀 Comment Contribuer

### 1. Types de Contributions

- 🐛 **Rapports de bugs** - Signalez des problèmes
- 💡 **Suggestions de fonctionnalités** - Proposez de nouvelles idées
- 📝 **Documentation** - Améliorez la documentation
- 💻 **Code** - Contribuez au développement
- 🧪 **Tests** - Ajoutez ou améliorez les tests

### 2. Processus de Développement

1. **Fork** le repository
2. **Clone** votre fork localement
3. **Créez** une branche pour votre fonctionnalité
4. **Développez** et testez vos changements
5. **Commit** avec des messages clairs
6. **Push** vers votre fork
7. **Créez** une Pull Request

### 3. Standards de Code

#### Conventions de Nommage
- Variables : `camelCase`
- Fonctions : `camelCase`
- Classes : `PascalCase`
- Constants : `UPPER_SNAKE_CASE`
- Fichiers : `kebab-case`

#### Style TypeScript/JavaScript
```typescript
// ✅ Bon
const agentConfig: AgentConfig = {
  name: 'MyAgent',
  type: AgentType.AUTONOMOUS,
  capabilities: ['trading', 'monitoring']
}

// ❌ Éviter
var config = {name:'MyAgent',type:'autonomous'}
```

#### Smart Contracts Solidity
```solidity
// ✅ Bon
contract AgentRegistry {
    mapping(address => Agent) public agents;
    
    function registerAgent(
        string memory _name,
        AgentType _type
    ) external {
        // Implementation
    }
}
```


### 4. Tests

#### Avant de soumettre
```bash
# Tests unitaires
npm test

# Tests d'intégration
npm run test:integration

# Linting
npm run lint

# Build
npm run build
```

#### Couverture de Code
- Maintenez une couverture > 80%
- Ajoutez des tests pour les nouvelles fonctionnalités
- Testez les cas d'erreur

### 5. Messages de Commit

Utilisez le format Conventional Commits :

```
type(scope): description

feat(agents): add autonomous decision making
fix(contracts): resolve token transfer bug
docs(readme): update installation instructions
test(api): add integration tests for agent endpoints
```

Types :
- `feat` : Nouvelle fonctionnalité
- `fix` : Correction de bug
- `docs` : Documentation
- `style` : Formatage (sans changement de code)
- `refactor` : Refactoring
- `test` : Ajout/modification de tests
- `chore` : Maintenance

### 6. Configuration de Développement

#### Prérequis
```bash
# Node.js 18+
node --version

# Git configuré
git config --global user.name "Votre Nom"
git config --global user.email "votre@email.com"
```

#### Setup Local
```bash
# Clone et setup
git clone https://github.com/votre-fork/swarmnode-protocol.git
cd swarmnode-protocol
npm install

# Configuration
cp .env.example .env
# Modifiez .env selon vos besoins

# Vérification
npm run lint
npm test
```

### 7. Communauté

- 💬 [Discord](https://discord.gg/swarmnode) - Discussion en temps réel
- 🐦 [Twitter](https://twitter.com/swarmnodeai) - Actualités
- 📧 Email : contribute@swarmnode.ai

## 🎉 Merci !

Votre contribution compte ! Chaque ligne de code, chaque rapport de bug, chaque suggestion nous aide à construire l'avenir de l'IA décentralisée.

---

*Ce guide est évolutif. N'hésitez pas à suggérer des améliorations !*
