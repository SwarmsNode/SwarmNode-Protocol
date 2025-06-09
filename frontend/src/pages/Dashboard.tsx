import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Bot, 
  Activity, 
  DollarSign, 
  TrendingUp,
  Plus,
  Play,
  Pause,
  Settings,
  BarChart3
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const Dashboard: React.FC = () => {
  const [activeAgents, setActiveAgents] = useState(12)
  const [totalTasks, setTotalTasks] = useState(1547)
  const [revenue, setRevenue] = useState(23.7)

  const performanceData = [
    { name: 'Jan', value: 400 },
    { name: 'Fév', value: 300 },
    { name: 'Mar', value: 600 },
    { name: 'Avr', value: 800 },
    { name: 'Mai', value: 750 },
    { name: 'Jun', value: 950 },
  ]

  const recentAgents = [
    { id: 1, name: 'DeFi Trader Pro', status: 'active', tasks: 156, revenue: 4.2 },
    { id: 2, name: 'NFT Monitor', status: 'active', tasks: 234, revenue: 6.8 },
    { id: 3, name: 'Governance Bot', status: 'paused', tasks: 89, revenue: 2.1 },
    { id: 4, name: 'Yield Farmer', status: 'active', tasks: 178, revenue: 8.3 },
  ]

  const stats = [
    {
      title: 'Agents Actifs',
      value: activeAgents,
      icon: <Bot className="h-6 w-6" />,
      change: '+12%',
      changeType: 'increase'
    },
    {
      title: 'Tâches Exécutées',
      value: totalTasks,
      icon: <Activity className="h-6 w-6" />,
      change: '+8%',
      changeType: 'increase'
    },
    {
      title: 'Revenus (AVAX)',
      value: revenue,
      icon: <DollarSign className="h-6 w-6" />,
      change: '+23%',
      changeType: 'increase'
    },
    {
      title: 'Performance',
      value: '94.2%',
      icon: <TrendingUp className="h-6 w-6" />,
      change: '+2.1%',
      changeType: 'increase'
    }
  ]

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Tableau de Bord
          </h1>
          <p className="text-gray-600">
            Gérez et surveillez vos agents AI sur SwarmNode Protocol
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="card"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {typeof stat.value === 'number' && stat.title.includes('Revenus') 
                      ? stat.value.toFixed(1) 
                      : stat.value}
                  </p>
                  <p className={`text-sm mt-1 ${
                    stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </p>
                </div>
                <div className="p-3 bg-primary-100 rounded-full">
                  <div className="text-primary-600">
                    {stat.icon}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Performance Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Performance des Agents
              </h3>
              <BarChart3 className="h-5 w-5 text-gray-400" />
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Recent Agents */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Agents Récents
              </h3>
              <button className="btn-primary text-sm py-2 px-3 flex items-center">
                <Plus className="h-4 w-4 mr-1" />
                Nouveau
              </button>
            </div>
            <div className="space-y-4">
              {recentAgents.map((agent) => (
                <div key={agent.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      agent.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'
                    }`} />
                    <div>
                      <p className="font-medium text-gray-900">{agent.name}</p>
                      <p className="text-sm text-gray-600">
                        {agent.tasks} tâches • {agent.revenue} AVAX
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
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
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-8"
        >
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Actions Rapides
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="p-4 text-left border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors duration-200">
                <Bot className="h-8 w-8 text-primary-600 mb-2" />
                <h4 className="font-medium text-gray-900">Créer un Agent</h4>
                <p className="text-sm text-gray-600">Déployez un nouvel agent AI</p>
              </button>
              <button className="p-4 text-left border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors duration-200">
                <Activity className="h-8 w-8 text-primary-600 mb-2" />
                <h4 className="font-medium text-gray-900">Nouvelle Tâche</h4>
                <p className="text-sm text-gray-600">Assignez une tâche à vos agents</p>
              </button>
              <button className="p-4 text-left border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors duration-200">
                <BarChart3 className="h-8 w-8 text-primary-600 mb-2" />
                <h4 className="font-medium text-gray-900">Voir Analytics</h4>
                <p className="text-sm text-gray-600">Analysez les performances</p>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Dashboard
