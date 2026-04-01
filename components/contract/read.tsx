'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Box, Button, CircularProgress, MenuItem, Stack, TextField, Typography,
} from '@mui/material'
import { type Abi, type AbiFunction, formatUnits, parseUnits, type PublicClient } from 'viem'

const unitOptions = ['Wei', 'Gwei', 'Ether'] as const

const getDecimals = (unit: string) => {
  switch (unit) {
    case 'Gwei': return 9
    case 'Ether': return 18
    default: return 0
  }
}

const formatValue = (value: unknown): string => {
  if (value === false) return 'false'
  if (value === true) return 'true'
  if (value === null || value === undefined || value === '') return ''
  if (typeof value === 'bigint') return value.toString()
  if (typeof value === 'object') {
    return JSON.stringify(value, (_key, v) => typeof v === 'bigint' ? v.toString() : v, 2)
  }
  return String(value)
}

const convertFromWei = (value: unknown, unit: string): string => {
  if (value === false) return 'false'
  if (value === true) return 'true'
  if (value === null || value === undefined || value === '') return ''
  if (typeof value === 'object') return formatValue(value)
  const str = String(value)
  switch (unit) {
    case 'Gwei': return formatUnits(BigInt(str), 9)
    case 'Ether': return formatUnits(BigInt(str), 18)
    default: return str
  }
}

function ReadPanel({ subAbi, publicClient, scAddr }: { subAbi: AbiFunction; publicClient: PublicClient; scAddr: string }) {
  const [inputData, setInputData] = useState<Record<string, string>>({})
  const [outputData, setOutputData] = useState<unknown>(null)
  const [inputUnits, setInputUnits] = useState<Record<string, string>>({})
  const [outputUnits, setOutputUnits] = useState<Record<string, string>>({})
  const [reload, setReload] = useState(0)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError('')
        setLoading(true)
        const params = subAbi.inputs.map((input, index) => {
          const name = input.name || `param${index}`
          let val = inputData[name] || ''
          if (input.type === 'uint256' && val) {
            const unit = inputUnits[name] || 'Wei'
            val = parseUnits(val, getDecimals(unit)).toString()
          }
          return val
        })

        if (subAbi.inputs.length === 0 || params.every((p) => p !== '')) {
          const result = await publicClient.readContract({
            address: scAddr as `0x${string}`,
            abi: [subAbi] as Abi,
            functionName: subAbi.name,
            args: params.length > 0 ? params : undefined,
          })
          setOutputData(result)
        }
      } catch (err: unknown) {
        setError((err as Error).message || 'Query failed')
        console.error('ERROR:', (err as Error).message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [reload, subAbi, inputData, inputUnits, publicClient, scAddr])

  return (
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
                value={inputUnits[name] || 'Wei'}
                onChange={(e) => setInputUnits({ ...inputUnits, [name]: e.target.value })}
                sx={{ minWidth: 85, '& .MuiOutlinedInput-root': { borderRadius: '6px' } }}
              >
                {unitOptions.map((u) => <MenuItem key={u} value={u}>{u}</MenuItem>)}
              </TextField>
            )}
          </Stack>
        )
      })}

      <Stack direction="row" spacing={1} alignItems="center">
        <Button
          variant="contained"
          disableElevation
          size="small"
          disabled={loading}
          onClick={() => setReload(Date.now())}
          sx={{
            alignSelf: 'flex-start',
            textTransform: 'none',
            borderRadius: '6px',
            px: 2.5,
            bgcolor: '#5b7ff5',
            '&:hover': { bgcolor: '#4a6de0' },
          }}
        >
          {loading ? 'Querying...' : 'Query'}
        </Button>
        {loading && <CircularProgress size={16} sx={{ color: '#5b7ff5' }} />}
      </Stack>

      {error && (
        <Typography variant="caption" color="error" sx={{ wordBreak: 'break-all' }}>
          {error}
        </Typography>
      )}

      {subAbi.outputs.length === 1 && outputData !== null && (
        <OutputRow
          label={subAbi.outputs[0].name || 'result'}
          type={subAbi.outputs[0].type}
          value={outputData}
          unit={outputUnits[subAbi.outputs[0].name || ''] || 'Wei'}
          onUnitChange={(u) => setOutputUnits({ ...outputUnits, [subAbi.outputs[0].name || '']: u })}
        />
      )}

      {subAbi.outputs.length > 1 && subAbi.outputs.map((output, i) => (
        <OutputRow
          key={i}
          label={output.name || `[${i}]`}
          type={output.type}
          value={Array.isArray(outputData) ? outputData[i] : outputData}
          unit={outputUnits[output.name || String(i)] || 'Wei'}
          onUnitChange={(u) => setOutputUnits({ ...outputUnits, [output.name || String(i)]: u })}
        />
      ))}
    </Stack>
  )
}

function OutputRow({ label, type, value, unit, onUnitChange }: {
  label: string; type: string; value: unknown; unit: string; onUnitChange: (u: string) => void
}) {
  const isUint = type === 'uint256'
  const display = convertFromWei(value, isUint ? unit : 'Wei')

  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', gap: 1.5, px: 1.5, py: 1,
      bgcolor: 'action.hover', borderRadius: '6px',
    }}>
      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, whiteSpace: 'nowrap' }}>
        {label}
      </Typography>
      {isUint && (
        <TextField
          select size="small" variant="standard" value={unit}
          onChange={(e) => onUnitChange(e.target.value)}
          sx={{ minWidth: 70, '& .MuiInput-underline:before': { border: 'none' }, '& .MuiInput-underline:after': { border: 'none' } }}
          InputProps={{ disableUnderline: true, sx: { fontSize: 12, color: 'text.secondary' } }}
        >
          {unitOptions.map((u) => <MenuItem key={u} value={u}>{u}</MenuItem>)}
        </TextField>
      )}
      <Typography
        variant="body2"
        sx={{ fontFamily: 'monospace', wordBreak: 'break-all', whiteSpace: 'pre-wrap', flex: 1, minWidth: 0, fontWeight: 500 }}
      >
        {display}
      </Typography>
      <Typography variant="caption" sx={{ color: 'text.disabled', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
        {type}
      </Typography>
    </Box>
  )
}

function FunctionCard({ index, fn, children }: { index: number; fn: AbiFunction; children: React.ReactNode }) {
  const [open, setOpen] = useState(index === 0)

  return (
    <Box sx={{
      bgcolor: 'background.paper',
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
          '&:hover': { bgcolor: 'action.hover' },
        }}
      >
        <Typography sx={{
          fontSize: 11, fontWeight: 700, color: '#5b7ff5',
          bgcolor: '#eef2ff', borderRadius: '4px',
          width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {index + 1}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 600, flex: 1 }}>
          {fn.name}
        </Typography>
        {fn.inputs.length > 0 && (
          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
            {fn.inputs.length} param{fn.inputs.length > 1 ? 's' : ''}
          </Typography>
        )}
        <Box sx={{
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s', color: 'text.disabled', display: 'flex',
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

export function ContractRead({ publicClient, scAddr, abi }: { publicClient: PublicClient; scAddr: string; abi: AbiFunction[] }) {
  const readAbi = useMemo(() => abi.filter((v) => v.type === 'function' && (v.stateMutability === 'view' || v.stateMutability === 'pure')), [abi])

  return (
    <Stack spacing={1} sx={{ mt: 1.5, p: 1, bgcolor: 'action.hover', borderRadius: '12px' }}>
      {readAbi.map((v, i) => (
        <FunctionCard key={i} index={i} fn={v}>
          <ReadPanel subAbi={v} publicClient={publicClient} scAddr={scAddr} />
        </FunctionCard>
      ))}
    </Stack>
  )
}
