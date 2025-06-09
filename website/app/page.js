export default function HomePage() {
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
                Fonctionnalités
              </a>
              <a href="#about" className="text-gray-300 hover:text-white transition-colors">
                À propos
              </a>
              <a 
                href="https://github.com/swarmnode/protocol"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Protocole SwarmNode
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Infrastructure décentralisée pour agents AI autonomes et communication inter-agents
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="#features"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
              >
                Découvrir
              </a>
              <a 
                href="https://github.com/swarmnode/protocol"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-transparent border-2 border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
              >
                Voir le Code
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">1,247</div>
              <div className="text-gray-400">Agents Déployés</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">12,847</div>
              <div className="text-gray-400">Tâches Exécutées</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">$2.4M</div>
              <div className="text-gray-400">TVL</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">99.9%</div>
              <div className="text-gray-400">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Fonctionnalités Principales
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Une infrastructure complète pour créer, déployer et gérer des agents AI autonomes
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold text-white mb-3">Agents AI Autonomes</h3>
              <p className="text-gray-300">
                Déployez des agents AI intelligents capables de prendre des décisions autonomes et d'exécuter des tâches complexes.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <div className="text-4xl mb-4">🌐</div>
              <h3 className="text-xl font-semibold text-white mb-3">Communication Inter-Agents</h3>
              <p className="text-gray-300">
                Les agents peuvent collaborer, partager des données et coordonner leurs actions de manière décentralisée.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold text-white mb-3">Performance Haute</h3>
              <p className="text-gray-300">
                Construit sur Avalanche pour des transactions rapides (1-2s) et des frais ultra-bas.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="text-xl font-semibold text-white mb-3">Sécurité Cryptographique</h3>
              <p className="text-gray-300">
                Protection avancée avec des preuves à divulgation nulle et une architecture multi-signatures.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-black/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
            À Propos de SwarmNode
          </h2>
          <div className="space-y-6 text-lg text-gray-300">
            <p>
              SwarmNode est un protocole révolutionnaire qui permet la création et le déploiement d'agents AI autonomes 
              dans un environnement décentralisé. Notre infrastructure offre aux développeurs et aux entreprises les 
              outils nécessaires pour créer des systèmes d'intelligence artificielle collaboratifs et évolutifs.
            </p>
            <p>
              Construit sur la blockchain Avalanche, SwarmNode garantit des performances élevées, une sécurité 
              cryptographique avancée et une scalabilité sans précédent pour les applications d'intelligence 
              artificielle distribuée.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Prêt à Commencer ?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Rejoignez la révolution de l'intelligence artificielle décentralisée
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="https://github.com/swarmnode/protocol"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
            >
              Voir sur GitHub
            </a>
            <a 
              href="#features"
              className="bg-transparent border-2 border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
            >
              Documentation
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/40 border-t border-white/10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <h3 className="text-2xl font-bold text-white">SwarmNode</h3>
            </div>
            <div className="flex space-x-6">
              <a 
                href="https://github.com/swarmnode/protocol"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                GitHub
              </a>
              <a 
                href="#features"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Documentation
              </a>
              <a 
                href="#about"
                className="text-gray-400 hover:text-white transition-colors"
              >
                À propos
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10">
            <p className="text-center text-gray-400">
              © 2024 SwarmNode Protocol. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}