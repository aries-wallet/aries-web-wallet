'use client'

import { Box, Drawer, Stack, useMediaQuery, useTheme } from '@mui/material'
import { useState } from 'react'
import Sidebar from '@/components/sidebar'
import { Providers } from './providers'

export default function Template({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <Providers>
      <TemplateInner mobileOpen={mobileOpen} setMobileOpen={setMobileOpen}>
        {children}
      </TemplateInner>
    </Providers>
  )
}

function TemplateInner({ children, mobileOpen, setMobileOpen }: {
  children: React.ReactNode
  mobileOpen: boolean
  setMobileOpen: (v: boolean) => void
}) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  if (isMobile) {
    return (
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Drawer
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ '& .MuiDrawer-paper': { width: 260 } }}
        >
          <Sidebar onNavigate={() => setMobileOpen(false)} />
        </Drawer>
        <Box sx={{
          flexGrow: 1, overflow: 'auto',
          bgcolor: (t) => t.palette.background.default,
        }}>
          <Box sx={{
            position: 'sticky', top: 0, zIndex: 10, px: 2, py: 1,
            bgcolor: (t) => t.palette.background.paper,
            borderBottom: (t) => `1px solid ${t.palette.mode === 'dark' ? '#2d3748' : '#eef0f4'}`,
            display: 'flex', alignItems: 'center',
          }}>
            <Box
              onClick={() => setMobileOpen(true)}
              sx={{ cursor: 'pointer', p: 0.5, display: 'flex', alignItems: 'center', color: 'text.secondary' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            </Box>
          </Box>
          {children}
        </Box>
      </Box>
    )
  }

  return (
    <Stack spacing={0} direction="row">
      <Sidebar />
      <Box sx={{
        width: '100%', height: '100vh', overflow: 'auto',
        bgcolor: (t) => t.palette.background.default,
      }}>
        {children}
      </Box>
    </Stack>
  )
}
