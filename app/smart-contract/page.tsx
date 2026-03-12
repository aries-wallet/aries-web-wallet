'use client'

import { Box } from '@mui/material'
import { Contract } from '@/components/contract'

export default function SmartContractPage() {
  return (
    <Box sx={{ p: 3, minHeight: '100vh' }}>
      <Contract />
    </Box>
  )
}
