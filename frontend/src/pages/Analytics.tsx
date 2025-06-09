import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Bot,
  Activity,
  Calendar,
  Download
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts'

const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d')

  const performanceData = [
    { name: 'Lun', agents: 8, tasks: 124, revenue: 2.3 },
    { name: 'Mar', agents: 12, tasks: 156, revenue: 3.1 },
    { name: 'Mer', agents: 10, tasks: 178, revenue: 4.2 },
    { name: 'Jeu', agents: 15, tasks: 203, revenue: 5.8 },
    { name: 'Ven', agents: 14, tasks: 189, revenue: 4.9 },
    { name: 'Sam', agents: 11, tasks: 167, revenue: 3.7 },
    { name: 'Dim', agents: 9, tasks: 134, revenue: 2.8 },
  ]

  const agentTypeData = [
    { name: 'DeFi Trading', value: 35, color: '#3b82f6' },
    { name: 'NFT Monitoring', value: 25, color: '#8b5cf6' },
    { name: 'Yield Farming', value: 20, color: '#06d6a0' },
    { name: 'Gouvernance', value: 15, color: '#f59e0b' },
    { name: 'Arbitrage', value: 5, color: '#ef4444' },
  ]

  const revenueData = [
    { name: 'Jan', revenue: 12.5 },
    { name: 'Fév', revenue: 18.3 },
    { name: 'Mar', revenue: 24.1 },
    { name: 'Avr', revenue: 32.8 },
    { name: 'Mai', revenue: 28.9 },
    { name: 'Jun', revenue: 35.7 },
  ]

  const taskSuccessData = [
    { name: 'Sem 1', success: 94, failed: 6 },
    { name: 'Sem 2', success: 96, failed: 4 },
    { name: 'Sem 3', success: 92, failed: 8 },
    { name: 'Sem 4', success: 98, failed: 2 },
  ]

  const stats = [
    {
      title: 'Revenus Totaux',
      value: '142.3 AVAX',
      change: '+23.5%',
      changeType: 'increase',
      icon: <DollarSign className="h-6 w-6" />
    },
    {
      title: 'Agents Actifs',
      value: '24',
      change: '+12.0%',
      changeType: 'increase',
      icon: <Bot className="h-6 w-6" />
    },
    {
      title: 'Taux de Succès',
      value: '96.2%',
      change: '+2.1%',
      changeType: 'increase',
      icon: <TrendingUp className="h-6 w-6" />
    },
    {
      title: 'Tâches/Jour',
      value: '1,247',
      change: '+8.3%',
      changeType: 'increase',
      icon: <Activity className="h-6 w-6" />
    }
  ]

  const topAgents = [
    { name: 'Arbitrage Hunter', revenue: 25.8, tasks: 342, success: 98.5 },
    { name: 'DeFi Trader Pro', revenue: 18.3, tasks: 298, success: 96.2 },
    { name: 'Yield Optimizer', revenue: 15.7, tasks: 256, success: 94.8 },
    { name: 'NFT Sentinel', revenue: 12.4, tasks: 189, success: 97.1 },
    { name: 'Governance Bot', revenue: 8.9, tasks: 134, success: 93.2 },
  ]

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Analytics
            </h1>
            <p className="text-gray-600">
              Analysez les performances de vos agents et tâches
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="24h">24 heures</option>
              <option value="7d">7 jours</option>
              <option value="30d">30 jours</option>
              <option value="90d">90 jours</option>
            </select>
            <button className="btn-secondary flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </button>
          </div>
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
                    {stat.value}
                  </p>
                  <p className={`text-sm mt-1 flex items-center ${
                    stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change === 'increase' ? (
                      <TrendingUp className="h-4 w-4 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 mr-1" />
                    )}
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

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Performance Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Performance Globale
              </h3>
              <BarChart3 className="h-5 w-5 text-gray-400" />
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3b82f6" 
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Agent Types Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Répartition des Agents
              </h3>
              <Bot className="h-5 w-5 text-gray-400" />
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={agentTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {agentTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {agentTypeData.map((item) => (
                <div key={item.name} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-600">{item.name}</span>
                  <span className="text-sm font-medium text-gray-900">{item.value}%</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Revenue and Success Rate */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Évolution des Revenus
              </h3>
              <DollarSign className="h-5 w-5 text-gray-400" />
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Task Success Rate */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Taux de Succès des Tâches
              </h3>
              <Activity className="h-5 w-5 text-gray-400" />
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={taskSuccessData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="success" stackId="a" fill="#10b981" />
                  <Bar dataKey="failed" stackId="a" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Top Agents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Top Agents par Performance
            </h3>
            <TrendingUp className="h-5 w-5 text-gray-400" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Agent</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Revenus (AVAX)</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Tâches</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Taux de Succès</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Performance</th>
                </tr>
              </thead>
              <tbody>
                {topAgents.map((agent, index) => (
                  <tr key={agent.name} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <span className="flex items-center justify-center w-8 h-8 bg-primary-100 text-primary-600 rounded-full text-sm font-medium">
                          {index + 1}
                        </span>
                        <span className="font-medium text-gray-900">{agent.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-900">{agent.revenue}</td>
                    <td className="py-3 px-4 text-gray-900">{agent.tasks}</td>
                    <td className="py-3 px-4">
                      <span className="text-green-600 font-medium">{agent.success}%</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary-600 h-2 rounded-full"
                          style={{ width: `${agent.success}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Analytics
