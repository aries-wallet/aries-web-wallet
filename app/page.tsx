'use client'

import Image from 'next/image'
import { Box, Stack, Typography } from '@mui/material'

const features = [
  { img: '/smart_contract.png', text: 'Read or write smart contract with your wallet on any EVM chain.' },
  { img: '/transaction.png', text: 'Send normal/raw transaction to any address with your connected wallet.' },
  { img: '/token.png', text: 'Interact any base functions with ERC20/ERC721 token.' },
  { img: '/script.png', text: 'Run your custom Javascript with your connected wallet.' },
]

const tags = ['EVM', 'Smart Contract', 'ERC20', 'ERC721', 'MetaMask', 'Ledger', 'Trezor', 'Script']

export default function Home() {
  return (
    <Box sx={{ maxWidth: 960, mx: 'auto', py: 6, px: 3 }}>
      <Stack spacing={1} alignItems="center" sx={{ mb: 6 }}>
        <Image alt="Banner" width={800} height={230} src="/banner.svg" style={{ maxWidth: '100%', height: 'auto' }} />
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#2d3748', mt: 3 }}>
          Welcome to Aries Wallet
        </Typography>
        <Stack direction="row" spacing={0.75} flexWrap="wrap" justifyContent="center" sx={{ mt: 1.5 }}>
          {tags.map((tag) => (
            <Box key={tag} sx={{
              px: 1.5, py: 0.4, borderRadius: '20px', fontSize: 12, fontWeight: 600,
              bgcolor: '#eef2ff', color: '#5b7ff5',
            }}>
              {tag}
            </Box>
          ))}
        </Stack>
      </Stack>

      <Stack spacing={5}>
        {features.map((f, i) => (
          <Box key={i} sx={{ bgcolor: '#fff', borderRadius: '16px', overflow: 'hidden' }}>
            <Box sx={{ px: 4, pt: 3, pb: 1.5 }}>
              <Typography variant="body1" sx={{ color: '#4a5568', fontWeight: 500, lineHeight: 1.6 }}>
                {f.text}
              </Typography>
            </Box>
            <Box sx={{ px: 2, pb: 2 }}>
              <Image src={f.img} alt="" width={800} height={400}
                style={{ width: '100%', height: 'auto', borderRadius: 12 }}
              />
            </Box>
          </Box>
        ))}
      </Stack>

      <Typography variant="body2" sx={{ color: '#8a94a6', textAlign: 'center', mt: 6 }}>
        Welcome to make any Github Pull Request to this open source web wallet
      </Typography>
    </Box>
  )
}
