'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Box, Button, CircularProgress, MenuItem, Stack, TextField, Typography,
} from '@mui/material'
import { type Abi, type AbiFunction, formatUnits, parseUnits, type PublicClient } from 'viem'
import { neu, neuShadows } from '@/app/providers'
import { useThemeStore } from '@/lib/store/theme-store'

const unitOptions = ['Wei', 'Gwei', 'Ether'] as const

const getDecimals = (unit: string) => {
  switch (unit) {
    case 'Gwei': return 9
    case 'Ether': return 18
    default: return 0
  }
}

const convertFromWei = (value: unknown, unit: string): string => {
  if (value === false) return 'false'
  if (value === true) return 'true'
  if (value === null || value === undefined || value === '') return ''
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
            />
            {isUint && (
              <TextField
                select
                size="small"
                value={inputUnits[name] || 'Wei'}
                onChange={(e) => setInputUnits({ ...inputUnits, [name]: e.target.value })}
                sx={{ minWidth: 85 }}
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
            px: 2.5,
          }}
        >
          {loading ? 'Querying...' : 'Query'}
        </Button>
        {loading && <CircularProgress size={16} />}
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
  const { mode } = useThemeStore()
  const t = neu[mode]
  const shadows = neuShadows(mode)
  const isUint = type === 'uint256'
  const display = convertFromWei(value, isUint ? unit : 'Wei')

  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', gap: 1.5, px: 1.5, py: 1,
      boxShadow: shadows.insetSmall, borderRadius: '16px',
    }}>
      <Typography variant="caption" sx={{ color: t.textSecondary, fontWeight: 500, whiteSpace: 'nowrap' }}>
        {label}
      </Typography>
      {isUint && (
        <TextField
          select size="small" variant="standard" value={unit}
          onChange={(e) => onUnitChange(e.target.value)}
          sx={{ minWidth: 70, '& .MuiInput-underline:before': { border: 'none' }, '& .MuiInput-underline:after': { border: 'none' } }}
          InputProps={{ disableUnderline: true, sx: { fontSize: 12, color: t.textSecondary } }}
        >
          {unitOptions.map((u) => <MenuItem key={u} value={u}>{u}</MenuItem>)}
        </TextField>
      )}
      <Typography
        variant="body2"
        sx={{ fontFamily: 'monospace', wordBreak: 'break-all', flex: 1, minWidth: 0, fontWeight: 500, color: t.text }}
      >
        {display}
      </Typography>
      <Typography variant="caption" sx={{ color: t.textSecondary, fontFamily: 'monospace', whiteSpace: 'nowrap', opacity: 0.6 }}>
        {type}
      </Typography>
    </Box>
  )
}

function FunctionCard({ index, fn, children }: { index: number; fn: AbiFunction; children: React.ReactNode }) {
  const [open, setOpen] = useState(index === 0)
  const { mode } = useThemeStore()
  const t = neu[mode]
  const shadows = neuShadows(mode)

  return (
    <Box sx={{
      bgcolor: t.bg,
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: shadows.extrudedSmall,
      transition: 'all 300ms ease-out',
      '&:hover': { boxShadow: shadows.extruded, transform: 'translateY(-1px)' },
    }}>
      <Box
        onClick={() => setOpen(!open)}
        sx={{
          display: 'flex', alignItems: 'center', gap: 1.5,
          px: 2, py: 1.2, cursor: 'pointer', userSelect: 'none',
          '&:hover': { bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(163,177,198,0.15)' },
        }}
      >
        <Typography sx={{
          fontSize: 11, fontWeight: 700, color: t.accent,
          boxShadow: shadows.insetSmall, borderRadius: '6px',
          width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {index + 1}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 600, flex: 1, color: t.text }}>
          {fn.name}
        </Typography>
        {fn.inputs.length > 0 && (
          <Typography variant="caption" sx={{ color: t.textSecondary, opacity: 0.6 }}>
            {fn.inputs.length} param{fn.inputs.length > 1 ? 's' : ''}
          </Typography>
        )}
        <Box sx={{
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s', color: t.textSecondary, display: 'flex',
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
  const { mode } = useThemeStore()
  const shadows = neuShadows(mode)

  return (
    <Stack spacing={1} sx={{ mt: 1.5, p: 1, boxShadow: shadows.inset, borderRadius: '24px' }}>
      {readAbi.map((v, i) => (
        <FunctionCard key={i} index={i} fn={v}>
          <ReadPanel subAbi={v} publicClient={publicClient} scAddr={scAddr} />
        </FunctionCard>
      ))}
    </Stack>
  )
}
