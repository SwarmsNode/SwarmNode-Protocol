# 🤝 Contributing Guide - SwarmNode Protocol

Thank you for your interest in contributing to SwarmNode! This guide will help you get started.

## 🚀 How to Contribute

### 1. Types of Contributions

- 🐛 **Bug reports** - Report issues
- 💡 **Feature suggestions** - Propose new ideas
- 📝 **Documentation** - Improve documentation
- 💻 **Code** - Contribute to development
- 🧪 **Tests** - Add or improve tests

### 2. Development Process

1. **Fork** the repository
2. **Clone** your fork locally
3. **Create** a branch for your feature
4. **Develop** and test your changes
5. **Commit** with clear messages
6. **Push** to your fork
7. **Create** a Pull Request

### 3. Code Standards

#### Naming Conventions
- Variables: `camelCase`
- Functions: `camelCase`
- Classes: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- Files: `kebab-case`

#### TypeScript/JavaScript Style
```typescript
// ✅ good
const agentConfig: AgentConfig = {
  name: 'MyAgent',
  type: AgentType.AUTONOMOUS,
  capabilities: ['trading', 'monitoring']
}

// ❌ Avoid
var config = {name:'MyAgent',type:'autonomous'}
```

#### Smart Contracts Solidity
```solidity
// ✅ Good
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

#### Before pushing
```bash
# Tests
npm test

# Integration tests
npm run test:integration

# Linting
npm run lint

# Build
npm run build
```

#### Code Coverage
- Maintain coverage > 80%
- Add tests for new features
- Test error cases

### 5. Commit Messages

Use Conventional Commits format:

```
type(scope): description

feat(agents): add autonomous decision making
fix(contracts): resolve token transfer bug
docs(readme): update installation instructions
test(api): add integration tests for agent endpoints
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting (no code change)
- `refactor`: Refactoring
- `test`: Adding/modifying tests
- `chore`: Maintenance

### 6. Development Setup

#### Prerequisites
```bash
# Node.js 18+
node --version

# Git configured
git config --global user.name "name"
git config --global user.email "your@email.com"
```

#### Setup Local
```bash
# Clone and setup
git clone https://github.com/your-fork/swarmnode-protocol.git
cd swarmnode-protocol
npm install

# Configuration
cp .env.example .env
# Modify .env according to your needs

# Verification
npm run lint
npm test
```

### 7. Community

- 💬 [Discord](https://discord.gg/swarmnode) - Real-time discussion
- 🐦 [Twitter](https://twitter.com/swarmsnodeavax) - News
- 📧 Email: contribute@swarmnode.ai

## 🎉 Thank You!

Your contribution matters! Every line of code, every bug report, every suggestion helps us build the future of decentralized AI.

---

*This guide is evolving. Feel free to suggest improvements!*
