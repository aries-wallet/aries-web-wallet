import type { Metadata } from 'next'
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import './globals.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'AriesWallet - Smart Contract Interaction & Crypto Management Tool',
  description: 'AriesWallet is a powerful tool for interacting with smart contracts and managing cryptocurrency transactions. Securely read and write smart contracts without storing private keys.',
  keywords: 'smart contracts, blockchain interaction, cryptocurrency management, AriesWallet, DeFi tools, Web3',
  openGraph: {
    title: 'AriesWallet - Smart Contract Interaction & Crypto Management Tool',
    description: 'Interact with smart contracts and manage crypto transactions securely with AriesWallet. No private key storage.',
    type: 'website',
    url: 'https://www.arieswallet.com',
    images: [{ url: 'https://www.arieswallet.com/og-image.svg', width: 1200, height: 630, type: 'image/svg+xml' }],
  },
  twitter: { card: 'summary_large_image' },
  alternates: { canonical: 'https://www.arieswallet.com' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
