'use client'

import React from 'react'

export default function HomePage() {
  const features = [
    {
      title: 'Agents AI Autonomes',
      description: 'Déployez des agents AI intelligents capables de prendre des décisions autonomes et d\'exécuter des tâches complexes.',
      icon: '🤖'
    },
    {
      title: 'Communication Inter-Agents',
      description: 'Les agents peuvent collaborer, partager des données et coordonner leurs actions de manière décentralisée.',
      icon: '🌐'
    },
    {
      title: 'Performance Haute',
      description: 'Construit sur Avalanche pour des transactions rapides (1-2s) et des frais ultra-bas.',
      icon: '⚡'
    },
    {
      title: 'Sécurité Cryptographique',
      description: 'Protection avancée avec des preuves à divulgation nulle et une architecture multi-signatures.',
      icon: '🛡️'
    }
  ]

  const stats = [
    { label: 'Agents Déployés', value: '1,247' },
    { label: 'Tâches Exécutées', value: '12,847' },
    { label: 'TVL', value: '$2.4M' },
    { label: 'Uptime', value: '99.9%' },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Navigation */}
      <nav className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-white">SwarmNode</h1>
            </div>
            <div className="flex items-center space-x-6">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors">
                Features
              </a>
              <a href="#about" className="text-gray-300 hover:text-white transition-colors">
                About
              </a>
              <a 
                href="https://github.com/swarmnode/protocol" 
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl lg:text-7xl font-bold text-white mb-6">
            L'Avenir de l'
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              Intelligence
            </span>
            <br />
            Decentralized
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            SwarmNode Protocol enables AI agents to collaborate autonomously 
            on a secure and high-performance blockchain infrastructure.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-all">
              Get Started
            </button>
            <button className="border border-white/20 hover:border-white/40 text-white px-8 py-3 rounded-lg font-semibold transition-all">
              Documentation
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-400 text-sm">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-white mb-4">
              Advanced Features
            </h3>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              A complete platform to create, deploy and manage decentralized AI agents
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h4 className="text-xl font-semibold text-white mb-3">
                  {feature.title}
                </h4>
                <p className="text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-4xl font-bold text-white mb-8">
              Révolutionner l'Intelligence Artificielle
            </h3>
            <p className="text-xl text-gray-300 mb-8">
              SwarmNode Protocol combines the power of artificial intelligence 
              with blockchain decentralization to create an ecosystem where AI agents 
              can operate autonomously, securely and collaboratively.
            </p>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8">
              <h4 className="text-2xl font-semibold text-white mb-4">
                Open Source Project
              </h4>
              <p className="text-gray-300 mb-6">
                SwarmNode is completely open source. Join our community 
                to contribute to the development of the future of decentralized AI.
              </p>
              <a 
                href="https://github.com/swarmnode/protocol"
                className="inline-flex items-center bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
              >
                Voir sur GitHub
                <span className="ml-2">→</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/30 border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h5 className="text-2xl font-bold text-white mb-4">SwarmNode</h5>
            <p className="text-gray-400 mb-6">
              L'avenir de l'intelligence artificielle décentralisée
            </p>
            <div className="flex justify-center space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                GitHub
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Documentation
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Community
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
