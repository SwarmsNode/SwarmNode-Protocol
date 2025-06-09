import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ClipboardList, 
  Plus, 
  Search, 
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  Bot
} from 'lucide-react'

const Tasks: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, set              {searchTerm || filterStatus !== 'all' || filterPriority !== 'all'
                ? 'No tasks match your search criteria.'
                : 'You haven\'t created any tasks yet. Start by creating one!'
              }
            </p>
            <button className="btn-primary">
              <Plus className="h-5 w-5 mr-2" />
              Create your first task
            </button>tus] = useState('all')

  const tasks = [
    {
      id: 1,
      title: 'Analyse du marché DeFi',
      description: 'Analyser les opportunités de yield farming sur Avalanche',
      status: 'completed',
      agent: 'DeFi Trader Pro',
      reward: 0.5,
      priority: 'high',
      created: '2024-01-20T10:00:00Z',
      completed: '2024-01-20T12:30:00Z',
      progress: 100
    },
    {
      id: 2,
      title: 'Surveillance NFT Rare',
      description: 'Surveiller les collections NFT pour détecter les opportunités',
      status: 'in_progress',
      agent: 'NFT Monitor',
      reward: 0.8,
      priority: 'medium',
      created: '2024-01-20T14:00:00Z',
      completed: null,
      progress: 65
    },
    {
      id: 3,
      title: 'Vote Gouvernance DAO',
      description: 'Participer au vote sur la proposition #42',
      status: 'pending',
      agent: 'Governance Bot',
      reward: 0.2,
      priority: 'low',
      created: '2024-01-20T16:00:00Z',
      completed: null,
      progress: 0
    },
    {
      id: 4,
      title: 'Optimisation Portfolio',
      description: 'Rééquilibrer le portfolio selon la stratégie définie',
      status: 'failed',
      agent: 'Yield Farmer',
      reward: 1.2,
      priority: 'high',
      created: '2024-01-20T08:00:00Z',
      completed: '2024-01-20T09:15:00Z',
      progress: 0
    },
    {
      id: 5,
      title: 'Arbitrage Cross-Chain',
      description: 'Exécuter l\'arbitrage entre Avalanche et Ethereum',
      status: 'in_progress',
      agent: 'Arbitrage Hunter',
      reward: 2.1,
      priority: 'high',
      created: '2024-01-20T15:30:00Z',
      completed: null,
      progress: 80
    }
  ]

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.agent.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || task.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />
      case 'in_progress':
        return <Clock className="h-4 w-4" />
      case 'pending':
        return <AlertCircle className="h-4 w-4" />
      case 'failed':
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Terminée'
      case 'in_progress':
        return 'En cours'
      case 'pending':
        return 'En attente'
      case 'failed':
        return 'Échouée'
      default:
        return status
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500'
      case 'medium':
        return 'border-l-yellow-500'
      case 'low':
        return 'border-l-green-500'
      default:
        return 'border-l-gray-500'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Gestion des Tâches
            </h1>
            <p className="text-gray-600">
              Créez et suivez les tâches assignées à vos agents
            </p>
          </div>
          <button className="btn-primary flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            Nouvelle Tâche
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
              </div>
              <ClipboardList className="h-8 w-8 text-gray-400" />
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Terminées</p>
                <p className="text-2xl font-bold text-green-600">
                  {tasks.filter(t => t.status === 'completed').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En cours</p>
                <p className="text-2xl font-bold text-blue-600">
                  {tasks.filter(t => t.status === 'in_progress').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-400" />
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Échouées</p>
                <p className="text-2xl font-bold text-red-600">
                  {tasks.filter(t => t.status === 'failed').length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-400" />
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="card mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une tâche..."
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
                <option value="completed">Terminées</option>
                <option value="in_progress">En cours</option>
                <option value="pending">En attente</option>
                <option value="failed">Échouées</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tasks List */}
        <div className="space-y-4">
          {filteredTasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`card border-l-4 ${getPriorityColor(task.priority)} hover:shadow-lg transition-shadow duration-300`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {task.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        {task.description}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                      {getStatusIcon(task.status)}
                      <span className="ml-1">{getStatusText(task.status)}</span>
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Bot className="h-4 w-4 mr-1" />
                      {task.agent}
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      {task.reward} AVAX
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {formatDate(task.created)}
                    </div>
                    {task.completed && (
                      <div className="text-green-600">
                        Terminée le {formatDate(task.completed)}
                      </div>
                    )}
                  </div>

                  {/* Progress Bar */}
                  {task.status === 'in_progress' && (
                    <div className="mt-3">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progression</span>
                        <span>{task.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 lg:mt-0 lg:ml-6 flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    task.priority === 'high' ? 'bg-red-100 text-red-800' :
                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {task.priority === 'high' ? 'Haute' : 
                     task.priority === 'medium' ? 'Moyenne' : 'Basse'}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <ClipboardList className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No tasks found
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterStatus !== 'all' 
                ? 'Aucune tâche ne correspond à vos critères de recherche.'
                : 'Vous n\'avez pas encore créé de tâche. Commencez par en créer une !'
              }
            </p>
            <button className="btn-primary">
              <Plus className="h-5 w-5 mr-2" />
              Créer votre première tâche
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Tasks
