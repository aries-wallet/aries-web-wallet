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
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
        <Drawer
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: 270,
              bgcolor: 'background.default',
              borderRight: 'none',
              boxShadow: '12px 0 20px rgb(163,177,198,0.4)',
            },
          }}
        >
          <Sidebar onNavigate={() => setMobileOpen(false)} />
        </Drawer>
        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          <Box sx={{
            position: 'sticky', top: 0, zIndex: 10, px: 2.5, py: 1.5,
            bgcolor: 'background.default',
            boxShadow: (t) => t.palette.mode === 'dark'
              ? '0 4px 12px rgba(0,0,0,0.3)'
              : '0 4px 12px rgb(163,177,198,0.3)',
            display: 'flex', alignItems: 'center',
          }}>
            <Box
              onClick={() => setMobileOpen(true)}
              sx={{
                cursor: 'pointer', p: 1, display: 'flex', alignItems: 'center',
                color: 'text.secondary', borderRadius: '12px',
                transition: 'all 300ms ease-out',
                boxShadow: (t) => t.palette.mode === 'dark'
                  ? '5px 5px 10px rgba(0,0,0,0.4), -5px -5px 10px rgba(255,255,255,0.05)'
                  : '5px 5px 10px rgb(163,177,198,0.6), -5px -5px 10px rgba(255,255,255,0.5)',
                '&:hover': {
                  boxShadow: (t) => t.palette.mode === 'dark'
                    ? '9px 9px 16px rgba(0,0,0,0.4), -9px -9px 16px rgba(255,255,255,0.05)'
                    : '9px 9px 16px rgb(163,177,198,0.6), -9px -9px 16px rgba(255,255,255,0.5)',
                },
              }}
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
        bgcolor: 'background.default',
      }}>
        {children}
      </Box>
    </Stack>
  )
}
