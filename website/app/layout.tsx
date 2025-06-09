import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'SwarmNode Protocol - Autonomous AI Agents on Avalanche',
  description: 'Plateforme décentralisée pour le déploiement et la coordination d\'agents AI autonomes sur la blockchain Avalanche',
  keywords: 'AI, blockchain, Avalanche, agents, DeFi, automation',
  openGraph: {
    title: 'SwarmNode Protocol',
    description: 'Autonomous AI Agent Infrastructure on Avalanche',
    url: 'https://swarmnode.ai',
    siteName: 'SwarmNode Protocol',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SwarmNode Protocol',
    description: 'Autonomous AI Agent Infrastructure on Avalanche',
    images: ['/og-image.png'],
    creator: '@SwarmNodeAI',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
