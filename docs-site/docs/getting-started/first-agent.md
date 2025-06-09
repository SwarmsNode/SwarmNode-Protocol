---
sidebar_position: 2
---

# Créer votre premier agent

In this guide, we will create and deploy your first AI agent on SwarmNode Protocol. 🚀

## What is a SwarmNode agent?

A SwarmNode agent is an autonomous entity capable of:
- Executing specific tasks
- Interacting with DeFi protocols
- Collaborating with other agents
- Generating revenue automatically

## Étape 1 : Définir votre agent

```typescript
import { SwarmNode, AgentType } from '@swarmnode/protocol';

const agentConfig = {
  name: "DeFi Analyzer",
  description: "Agent qui analyse les opportunités DeFi",
  type: AgentType.RESEARCH,
  capabilities: [
    "PRICE_ANALYSIS",
    "YIELD_FARMING",
    "LIQUIDITY_ANALYSIS"
  ],
  parameters: {
    updateInterval: 60000, // 1 minute
    riskTolerance: "MODERATE",
    maxInvestment: ethers.utils.parseEther("100")
  }
};
```

## Étape 2 : Créer l'agent

```typescript live
function CreateAgentDemo() {
  const [agentStatus, setAgentStatus] = React.useState('Non créé');
  const [agentId, setAgentId] = React.useState(null);

  const createAgent = async () => {
    try {
      setAgentStatus('Création en cours...');
      
      // Simulation de création d'agent
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockAgentId = 'agent_' + Math.random().toString(36).substr(2, 9);
      setAgentId(mockAgentId);
      setAgentStatus('✅ Agent créé avec succès !');
    } catch (error) {
      setAgentStatus('❌ Erreur lors de la création');
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      border: '1px solid #e1e1e1', 
      borderRadius: '8px',
      marginBottom: '20px'
    }}>
      <h3>🤖 Création d'agent interactif</h3>
      <div style={{ marginBottom: '15px' }}>
        <strong>Status:</strong> {agentStatus}
      </div>
      {agentId && (
        <div style={{ marginBottom: '15px' }}>
          <strong>Agent ID:</strong> <code>{agentId}</code>
        </div>
      )}
      <button 
        onClick={createAgent}
        disabled={agentStatus === 'Création en cours...'}
        style={{ 
          padding: '10px 20px', 
          backgroundColor: '#2196F3', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px',
          cursor: 'pointer',
          opacity: agentStatus === 'Création en cours...' ? 0.6 : 1
        }}
      >
        {agentStatus === 'Création en cours...' ? 'Création...' : 'Créer l\'agent'}
      </button>
    </div>
  );
}
```

## Code complet de création

```typescript
async function createYourFirstAgent() {
  // 1. Initialiser SwarmNode
  const swarmNode = new SwarmNode({
    provider: yourProvider,
    network: 'avalanche-testnet'
  });

  // 2. Définir la configuration de l'agent
  const agentConfig = {
    name: "Mon Premier Agent",
    description: "Un agent de recherche DeFi",
    type: AgentType.RESEARCH,
    capabilities: ["PRICE_ANALYSIS", "MARKET_RESEARCH"],
    parameters: {
      updateInterval: 300000, // 5 minutes
      dataSource: "CHAINLINK",
      analysisDepth: "STANDARD"
    }
  };

  try {
    // 3. Créer l'agent
    const agent = await swarmNode.createAgent(agentConfig);
    
    console.log('Agent créé:', agent.id);
    console.log('Adresse du contrat:', agent.contractAddress);
    
    // 4. Démarrer l'agent
    await agent.start();
    
    console.log('Agent démarré avec succès !');
    
    return agent;
  } catch (error) {
    console.error('Erreur lors de la création:', error);
    throw error;
  }
}
```

## Étape 3 : Configurer les tâches

```typescript
// Ajouter des tâches à votre agent
const tasks = [
  {
    name: "Analyser les prix",
    schedule: "*/5 * * * *", // Chaque 5 minutes
    action: async (agent) => {
      const prices = await agent.analyzePrices(['AVAX', 'ETH', 'BTC']);
      return { prices, timestamp: Date.now() };
    }
  },
  {
    name: "Rechercher opportunités",
    schedule: "0 */1 * * *", // Chaque heure
    action: async (agent) => {
      const opportunities = await agent.findOpportunities();
      if (opportunities.length > 0) {
        await agent.notify('Nouvelles opportunités trouvées');
      }
      return opportunities;
    }
  }
];

// Assigner les tâches
await agent.assignTasks(tasks);
```

## Étape 4 : Monitoring et gestion

```typescript
// Surveiller les performances de l'agent
agent.on('task_completed', (result) => {
  console.log('Tâche terminée:', result);
});

agent.on('error', (error) => {
  console.error('Erreur agent:', error);
});

// Obtenir les statistiques
const stats = await agent.getStatistics();
console.log('Statistiques:', {
  tasksCompleted: stats.tasksCompleted,
  uptime: stats.uptime,
  performance: stats.performance
});
```

## Visualisation des performances

```typescript live
function AgentPerformanceChart() {
  const [data, setData] = React.useState([
    { time: '09:00', performance: 85, tasks: 12 },
    { time: '10:00', performance: 92, tasks: 18 },
    { time: '11:00', performance: 88, tasks: 15 },
    { time: '12:00', performance: 95, tasks: 22 },
    { time: '13:00', performance: 91, tasks: 19 }
  ]);

  const maxPerformance = Math.max(...data.map(d => d.performance));
  const maxTasks = Math.max(...data.map(d => d.tasks));

  return (
    <div style={{ padding: '20px', border: '1px solid #e1e1e1', borderRadius: '8px' }}>
      <h3>📊 Performance de l'agent</h3>
      <div style={{ display: 'flex', height: '200px', alignItems: 'end', gap: '10px' }}>
        {data.map((point, index) => (
          <div key={index} style={{ textAlign: 'center', flex: 1 }}>
            <div style={{
              height: `${(point.performance / maxPerformance) * 150}px`,
              backgroundColor: '#4CAF50',
              marginBottom: '5px',
              borderRadius: '3px'
            }}></div>
            <small>{point.time}</small>
            <br />
            <small>{point.performance}%</small>
          </div>
        ))}
      </div>
      <div style={{ marginTop: '15px' }}>
        <span style={{ color: '#4CAF50' }}>● Performance moyenne: 90.2%</span>
      </div>
    </div>
  );
}
```

## Types d'agents disponibles

### Agent de Trading
```typescript
const tradingAgent = await swarmNode.createAgent({
  type: AgentType.TRADING,
  parameters: {
    strategy: "MEAN_REVERSION",
    riskLevel: "LOW",
    maxTradeSize: ethers.utils.parseEther("50")
  }
});
```

### Agent de Recherche
```typescript
const researchAgent = await swarmNode.createAgent({
  type: AgentType.RESEARCH,
  parameters: {
    sources: ["TWITTER", "REDDIT", "NEWS"],
    sentiment: true,
    keywords: ["DeFi", "Avalanche", "yield"]
  }
});
```

### Agent d'Optimisation
```typescript
const optimizationAgent = await swarmNode.createAgent({
  type: AgentType.OPTIMIZATION,
  parameters: {
    target: "GAS_OPTIMIZATION",
    threshold: 0.95,
    autoApply: false
  }
});
```

## Gestion avancée

### Mise à jour de la configuration
```typescript
await agent.updateConfig({
  parameters: {
    ...agent.config.parameters,
    updateInterval: 120000 // 2 minutes
  }
});
```

### Collaboration entre agents
```typescript
// Créer un réseau d'agents
const network = await swarmNode.createNetwork([
  tradingAgent,
  researchAgent,
  optimizationAgent
]);

// Configurer la collaboration
await network.setupCollaboration({
  researchAgent: { provides: ['market_data', 'sentiment'] },
  tradingAgent: { consumes: ['market_data'], provides: ['trades'] },
  optimizationAgent: { consumes: ['trades'], provides: ['optimizations'] }
});
```

## Bonnes pratiques

1. **Start simple**: First create an agent with basic tasks
2. **Test on testnet**: Always use Fuji before mainnet
3. **Monitor performance**: Enable monitoring from the start
4. **Handle errors**: Implement robust error handling
5. **Secure your keys**: Never expose private keys

## Next steps

Now that you have created your first agent:

- [Discover advanced agent types](../agents/types)
- [Apprenez la collaboration entre agents](../agents/collaboration)
- [Explorez les intégrations DeFi](../integrations/defi)
- [Consultez les exemples avancés](../examples/advanced)

## Support

Besoin d'aide avec votre agent ?

- 📚 [Documentation complète](../api/agents)
- 💬 [Discord communautaire](https://discord.gg/swarmnode)
- 🎯 [Exemples GitHub](https://github.com/swarmnode/examples)
