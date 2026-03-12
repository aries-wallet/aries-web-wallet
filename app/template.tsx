'use client'

import { Box, Stack } from '@mui/material'
import Sidebar from '@/components/sidebar'
import { Providers } from './providers'

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <Stack spacing={0} direction="row">
        <Sidebar />
        <Box sx={{
          width: '100%', height: '100vh', overflow: 'auto',
          bgcolor: '#f0f2f5',
        }}>
          {children}
        </Box>
      </Stack>
    </Providers>
  )
}
