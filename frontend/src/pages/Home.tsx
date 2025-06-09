import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Bot, 
  Zap, 
  Shield, 
  Network, 
  ArrowRight, 
  CheckCircle,
  TrendingUp,
  Users,
  Code
} from 'lucide-react'

const Home: React.FC = () => {
  const features = [
    {
      icon: <Bot className="h-8 w-8 text-primary-600" />,
      title: "Agents AI Autonomes",
      description: "Déployez des agents intelligents capables d'exécuter des tâches complexes de manière autonome sur la blockchain."
    },
    {
      icon: <Network className="h-8 w-8 text-primary-600" />,
      title: "Réseau Décentralisé",
      description: "Coordonnez vos agents au sein d'un réseau décentralisé pour une collaboration efficace et transparente."
    },
    {
      icon: <Shield className="h-8 w-8 text-primary-600" />,
      title: "Sécurité Blockchain",
      description: "Bénéficiez de la sécurité et de la transparence de la blockchain Avalanche pour vos opérations critiques."
    },
    {
      icon: <Zap className="h-8 w-8 text-primary-600" />,
      title: "Performance Optimale",
      description: "Exploitez la vitesse et l'efficacité d'Avalanche pour des exécutions de tâches ultra-rapides."
    }
  ]

  const stats = [
    { value: "10K+", label: "Agents Déployés" },
    { value: "500K+", label: "Tâches Exécutées" },
    { value: "99.9%", label: "Uptime" },
    { value: "1M+", label: "Transactions" }
  ]

  const useCases = [
    {
      title: "Finance Décentralisée",
      description: "Automatisez vos stratégies de trading et de yield farming",
      icon: <TrendingUp className="h-6 w-6" />
    },
    {
      title: "Gouvernance DAO",
      description: "Gérez automatiquement les propositions et votes",
      icon: <Users className="h-6 w-6" />
    },
    {
      title: "Développement Web3",
      description: "Intégrez l'IA dans vos applications décentralisées",
      icon: <Code className="h-6 w-6" />
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
              L'Avenir des Agents AI
              <span className="block text-primary-600">Sur Avalanche</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              SwarmNode Protocol révolutionne l'écosystème blockchain en permettant le déploiement 
              et la coordination d'agents AI autonomes sur la blockchain Avalanche.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/dashboard"
                className="btn-primary px-8 py-3 text-lg inline-flex items-center justify-center"
              >
                Commencer
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/docs"
                className="btn-secondary px-8 py-3 text-lg inline-flex items-center justify-center"
              >
                Documentation
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl sm:text-4xl font-bold text-primary-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Pourquoi Choisir SwarmNode ?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Une plateforme complète pour créer, déployer et gérer vos agents AI 
              dans un environnement blockchain sécurisé et performant.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Cas d'Usage
            </h2>
            <p className="text-xl text-gray-600">
              Découvrez comment SwarmNode transforme différents secteurs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {useCases.map((useCase, index) => (
              <motion.div
                key={useCase.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card text-center hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex justify-center mb-4 p-3 bg-primary-100 rounded-full w-16 h-16 mx-auto items-center">
                  <div className="text-primary-600">
                    {useCase.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {useCase.title}
                </h3>
                <p className="text-gray-600">
                  {useCase.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="card bg-gradient-to-r from-primary-500 to-primary-600 text-white"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Prêt à Révolutionner Vos Agents AI ?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Rejoignez la communauté SwarmNode et commencez à déployer vos agents 
              intelligents sur Avalanche dès aujourd'hui.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/dashboard"
                className="bg-white text-primary-600 hover:bg-gray-50 font-medium py-3 px-8 rounded-lg transition-colors duration-200 inline-flex items-center justify-center"
              >
                Démarrer Maintenant
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/docs"
                className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-medium py-3 px-8 rounded-lg transition-colors duration-200"
              >
                Explorer la Documentation
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Home
