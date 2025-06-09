import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Bot, 
  Plus, 
  Search, 
  Filter,
  Play,
  Pause,
  Settings,
  Trash2,
  Activity,
  DollarSign
} from 'lucide-react'

const Agents: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const agents = [
    {
      id: 1,
      name: 'DeFi Trader Pro',
      description: 'Agent de trading automatisé pour protocoles DeFi',
      status: 'active',
      tasks: 156,
      revenue: 4.2,
      uptime: 99.8,
      created: '2024-01-15',
      capabilities: ['trading', 'analysis', 'monitoring']
    },
    {
      id: 2,
      name: 'NFT Monitor',
      description: 'Surveillance et analyse du marché NFT',
      status: 'active',
      tasks: 234,
      revenue: 6.8,
      uptime: 98.5,
      created: '2024-01-10',
      capabilities: ['monitoring', 'analysis', 'alerts']
    },
    {
      id: 3,
      name: 'Governance Bot',
      description: 'Participation automatisée à la gouvernance DAO',
      status: 'paused',
      tasks: 89,
      revenue: 2.1,
      uptime: 95.2,
      created: '2024-01-08',
      capabilities: ['governance', 'voting', 'analysis']
    },
    {
      id: 4,
      name: 'Yield Farmer',
      description: 'Optimisation des rendements DeFi',
      status: 'active',
      tasks: 178,
      revenue: 8.3,
      uptime: 99.1,
      created: '2024-01-12',
      capabilities: ['farming', 'optimization', 'monitoring']
    },
    {
      id: 5,
      name: 'Arbitrage Hunter',
      description: 'Détection et exécution d\'opportunités d\'arbitrage',
      status: 'active',
      tasks: 298,
      revenue: 12.5,
      uptime: 99.9,
      created: '2024-01-05',
      capabilities: ['arbitrage', 'dex', 'execution']
    }
  ]

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || agent.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'paused':
        return 'bg-yellow-100 text-yellow-800'
      case 'stopped':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Actif'
      case 'paused':
        return 'En Pause'
      case 'stopped':
        return 'Arrêté'
      default:
        return status
    }
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Agents AI
            </h1>
            <p className="text-gray-600">
              Gérez vos agents intelligents déployés sur SwarmNode
            </p>
          </div>
          <button className="btn-primary flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            Créer un Agent
          </button>
        </div>

        {/* Search and Filter */}
        <div className="card mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un agent..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actifs</option>
                <option value="paused">En pause</option>
                <option value="stopped">Arrêtés</option>
              </select>
            </div>
          </div>
        </div>

        {/* Agents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgents.map((agent, index) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="card hover:shadow-lg transition-shadow duration-300"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <Bot className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(agent.status)}`}>
                      {getStatusText(agent.status)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <button className="p-1 text-gray-400 hover:text-gray-600">
                    {agent.status === 'active' ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </button>
                  <button className="p-1 text-gray-400 hover:text-gray-600">
                    <Settings className="h-4 w-4" />
                  </button>
                  <button className="p-1 text-gray-400 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-600 text-sm mb-4">
                {agent.description}
              </p>

              {/* Capabilities */}
              <div className="flex flex-wrap gap-1 mb-4">
                {agent.capabilities.map((capability) => (
                  <span
                    key={capability}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                  >
                    {capability}
                  </span>
                ))}
              </div>

              {/* Stats */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center text-gray-600">
                    <Activity className="h-4 w-4 mr-1" />
                    Tâches
                  </span>
                  <span className="font-medium text-gray-900">{agent.tasks}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center text-gray-600">
                    <DollarSign className="h-4 w-4 mr-1" />
                    Revenus
                  </span>
                  <span className="font-medium text-gray-900">{agent.revenue} AVAX</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Uptime</span>
                  <span className="font-medium text-gray-900">{agent.uptime}%</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${agent.uptime}%` }}
                />
              </div>

              {/* Footer */}
              <div className="text-xs text-gray-500">
                Créé le {new Date(agent.created).toLocaleDateString('fr-FR')}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredAgents.length === 0 && (
          <div className="text-center py-12">
            <Bot className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun agent trouvé
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterStatus !== 'all' 
                ? 'Aucun agent ne correspond à vos critères de recherche.'
                : 'Vous n\'avez pas encore créé d\'agent. Commencez par en créer un !'
              }
            </p>
            <button className="btn-primary">
              <Plus className="h-5 w-5 mr-2" />
              Créer votre premier agent
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Agents
