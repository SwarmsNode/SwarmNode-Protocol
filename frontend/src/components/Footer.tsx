import React from 'react'
import { Github, Twitter, Discord, Globe } from 'lucide-react'

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo et description */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">SwarmNode Protocol</h3>
            <p className="text-gray-600 text-sm">
              Plateforme décentralisée pour le déploiement et la coordination d'agents AI autonomes sur Avalanche.
            </p>
            <div className="flex space-x-4">
              <a href="https://github.com/swarmnode" className="text-gray-400 hover:text-gray-600">
                <Github className="h-5 w-5" />
              </a>
              <a href="https://twitter.com/swarmnode" className="text-gray-400 hover:text-gray-600">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://discord.gg/swarmnode" className="text-gray-400 hover:text-gray-600">
                <Discord className="h-5 w-5" />
              </a>
              <a href="https://swarmnode.protocol" className="text-gray-400 hover:text-gray-600">
                <Globe className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Produit */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Produit</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="/dashboard" className="hover:text-gray-900">Tableau de Bord</a></li>
              <li><a href="/agents" className="hover:text-gray-900">Agents AI</a></li>
              <li><a href="/tasks" className="hover:text-gray-900">Gestion des Tâches</a></li>
              <li><a href="/analytics" className="hover:text-gray-900">Analytics</a></li>
            </ul>
          </div>

          {/* Développeurs */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Développeurs</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="/docs" className="hover:text-gray-900">Documentation</a></li>
              <li><a href="/docs/api" className="hover:text-gray-900">API Reference</a></li>
              <li><a href="/docs/sdk" className="hover:text-gray-900">SDK</a></li>
              <li><a href="/examples" className="hover:text-gray-900">Exemples</a></li>
            </ul>
          </div>

          {/* Communauté */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Communauté</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="/blog" className="hover:text-gray-900">Blog</a></li>
              <li><a href="/governance" className="hover:text-gray-900">Gouvernance</a></li>
              <li><a href="/grants" className="hover:text-gray-900">Subventions</a></li>
              <li><a href="/support" className="hover:text-gray-900">Support</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            © 2024 SwarmNode Protocol. Tous droits réservés.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="/privacy" className="text-gray-500 hover:text-gray-900 text-sm">
              Confidentialité
            </a>
            <a href="/terms" className="text-gray-500 hover:text-gray-900 text-sm">
              Conditions
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
