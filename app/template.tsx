'use client'

import { Stack } from '@mui/material'
import Sidebar from '@/components/sidebar'
import { Providers } from './providers'

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <Stack spacing={0} direction="row">
        <Sidebar />
        <div style={{ width: '100%', height: '100vh', overflow: 'auto' }}>
          {children}
        </div>
      </Stack>
    </Providers>
  )
}
