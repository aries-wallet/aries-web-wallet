'use client'

import { useMemo, useState } from 'react'
import {
  Box, Button, MenuItem, Stack, TextField, Typography,
} from '@mui/material'
import { type AbiFunction, parseUnits } from 'viem'

const unitOptions = ['Wei', 'Gwei', 'Ether'] as const

const getDecimals = (unit: string) => {
  switch (unit) {
    case 'Gwei': return 9
    case 'Ether': return 18
    default: return 0
  }
}

function objectToArray(object: Record<string, string>, abiInputs: readonly { name?: string; type: string }[]): string[] {
  const ret: string[] = []
  abiInputs.forEach((v, i) => {
    let val = object[v.name || `param${i}`] || ''
    try {
      if (val.includes('[') || val.includes('{')) val = JSON.parse(val)
    } catch { /* ignore */ }
    if (val === 'true') ret.push('true')
    else if (val === 'false') ret.push('false')
    else ret.push(val)
  })
  return ret
}

function WritePanel({ subAbi, send }: { subAbi: AbiFunction; send: (abi: AbiFunction, params: string[], payableValue?: string) => Promise<void> }) {
  const [inputData, setInputData] = useState<Record<string, string>>({})
  const [units, setUnits] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const params = { ...inputData }
      const convertedParams: Record<string, string> = {}

      for (const key of Object.keys(params)) {
        const isUint = subAbi.inputs.some((input) => input.type === 'uint256' && (input.name === key || `param${subAbi.inputs.indexOf(input)}` === key))
        if (isUint || key === 'payable') {
          convertedParams[key] = parseUnits(params[key] || '0', getDecimals(units[key] || 'Wei')).toString()
        } else {
          convertedParams[key] = params[key]
        }
      }

      const payable = convertedParams.payable
      delete convertedParams.payable

      const args = objectToArray(convertedParams, subAbi.inputs)
      await send(subAbi, args, payable)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={1.5} sx={{ pt: 1.5 }}>
        {subAbi.inputs.map((input, index) => {
          const name = input.name || `param${index}`
          const isUint = input.type === 'uint256'
          return (
            <Stack key={index} direction="row" spacing={1} alignItems="center">
              <TextField
                size="small"
                fullWidth
                label={`${name} (${input.type})`}
                variant="outlined"
                onChange={(e) => setInputData({ ...inputData, [name]: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px' } }}
              />
              {isUint && (
                <TextField
                  select
                  size="small"
                  value={units[name] || 'Wei'}
                  onChange={(e) => setUnits({ ...units, [name]: e.target.value })}
                  sx={{ minWidth: 85, '& .MuiOutlinedInput-root': { borderRadius: '6px' } }}
                >
                  {unitOptions.map((u) => <MenuItem key={u} value={u}>{u}</MenuItem>)}
                </TextField>
              )}
            </Stack>
          )
        })}

        {subAbi.stateMutability === 'payable' && (
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              size="small"
              fullWidth
              label="payable value (uint256)"
              variant="outlined"
              onChange={(e) => setInputData({ ...inputData, payable: e.target.value })}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px' } }}
            />
            <TextField
              select
              size="small"
              value={units.payable || 'Wei'}
              onChange={(e) => setUnits({ ...units, payable: e.target.value })}
              sx={{ minWidth: 85, '& .MuiOutlinedInput-root': { borderRadius: '6px' } }}
            >
              {unitOptions.map((u) => <MenuItem key={u} value={u}>{u}</MenuItem>)}
            </TextField>
          </Stack>
        )}

        <Button
          type="submit"
          variant="contained"
          disableElevation
          size="small"
          disabled={loading}
          sx={{
            alignSelf: 'flex-start',
            textTransform: 'none',
            borderRadius: '6px',
            px: 2.5,
            bgcolor: '#e8853d',
            '&:hover': { bgcolor: '#d47632' },
          }}
        >
          {loading ? 'Sending...' : 'Write'}
        </Button>
      </Stack>
    </form>
  )
}

function FunctionCard({ index, fn, children }: { index: number; fn: AbiFunction; children: React.ReactNode }) {
  const [open, setOpen] = useState(index === 0)

  return (
    <Box sx={{
      bgcolor: '#fff',
      borderRadius: '10px',
      overflow: 'hidden',
      transition: 'box-shadow 0.2s',
      '&:hover': { boxShadow: '0 2px 12px rgba(0,0,0,0.04)' },
    }}>
      <Box
        onClick={() => setOpen(!open)}
        sx={{
          display: 'flex', alignItems: 'center', gap: 1.5,
          px: 2, py: 1.2, cursor: 'pointer', userSelect: 'none',
          '&:hover': { bgcolor: '#fefaf6' },
        }}
      >
        <Typography sx={{
          fontSize: 11, fontWeight: 700, color: '#e8853d',
          bgcolor: '#fef3e8', borderRadius: '4px',
          width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {index + 1}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 600, flex: 1, color: '#2d3748' }}>
          {fn.name}
        </Typography>
        {fn.inputs.length > 0 && (
          <Typography variant="caption" sx={{ color: '#b0b8c9' }}>
            {fn.inputs.length} param{fn.inputs.length > 1 ? 's' : ''}
          </Typography>
        )}
        {fn.stateMutability === 'payable' && (
          <Typography variant="caption" sx={{ color: '#e8853d', fontWeight: 500 }}>
            payable
          </Typography>
        )}
        <Box sx={{
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s', color: '#b0b8c9', display: 'flex',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
        </Box>
      </Box>
      {open && (
        <Box sx={{ px: 2, pb: 2 }}>
          {children}
        </Box>
      )}
    </Box>
  )
}

export function ContractWrite({ send, abi }: { send: (abi: AbiFunction, params: string[], payableValue?: string) => Promise<void>; abi: AbiFunction[] }) {
  const writeAbi = useMemo(() => abi.filter((v) => v.type === 'function' && v.stateMutability !== 'view' && v.stateMutability !== 'pure'), [abi])

  return (
    <Stack spacing={1} sx={{ mt: 1.5, p: 1, bgcolor: '#fef8f3', borderRadius: '12px' }}>
      {writeAbi.map((v, i) => (
        <FunctionCard key={i} index={i} fn={v}>
          <WritePanel subAbi={v} send={send} />
        </FunctionCard>
      ))}
    </Stack>
  )
}
