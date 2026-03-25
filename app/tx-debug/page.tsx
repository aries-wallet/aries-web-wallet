'use client'

import { useState, useCallback } from 'react'
import {
  Box, Button, CircularProgress, Collapse, IconButton, MenuItem,
  Stack, TextField, Tooltip, Typography,
} from '@mui/material'
import { useDynamicPublicClient } from '@/lib/hooks/use-dynamic-client'
import { useSnackbar } from '@/lib/hooks/use-snackbar'
import copy from 'copy-to-clipboard'
import { FaCopy, FaChevronDown, FaChevronRight, FaExternalLinkAlt } from 'react-icons/fa'

// ── Types ──

interface CallTrace {
  type: string          // CALL, STATICCALL, DELEGATECALL, CREATE, CREATE2, SELFDESTRUCT
  from: string
  to: string
  value?: string
  gas?: string
  gasUsed?: string
  input?: string
  output?: string
  error?: string
  revertReason?: string
  calls?: CallTrace[]
}

// ── Helpers ──

function hexToDecimal(hex: string | undefined): string {
  if (!hex) return '0'
  try { return BigInt(hex).toString() } catch { return hex }
}

function formatGas(hex: string | undefined): string {
  if (!hex) return '-'
  try { return BigInt(hex).toLocaleString() } catch { return hex }
}

function formatValue(hex: string | undefined): string {
  if (!hex || hex === '0x0' || hex === '0x') return '0'
  try {
    const wei = BigInt(hex)
    if (wei === 0n) return '0'
    const eth = Number(wei) / 1e18
    if (eth >= 0.0001) return `${eth.toFixed(6)} ETH`
    return `${wei.toString()} wei`
  } catch { return hex }
}

function shortenAddr(addr: string): string {
  if (!addr) return ''
  return addr.slice(0, 8) + '...' + addr.slice(-6)
}

function shortenData(data: string | undefined, len = 20): string {
  if (!data || data === '0x') return '0x'
  if (data.length <= len) return data
  return data.slice(0, len) + '...'
}

function getCallColor(type: string): string {
  switch (type) {
    case 'CALL': return '#5b7ff5'
    case 'STATICCALL': return '#48bb78'
    case 'DELEGATECALL': return '#e8853d'
    case 'CREATE': case 'CREATE2': return '#9f7aea'
    case 'SELFDESTRUCT': return '#e85d5d'
    default: return '#8a94a6'
  }
}

function countCalls(trace: CallTrace): number {
  let count = 1
  if (trace.calls) {
    for (const c of trace.calls) count += countCalls(c)
  }
  return count
}

// ── Call Tree Node ──

function CallNode({ trace, depth = 0 }: { trace: CallTrace; depth?: number }) {
  const [open, setOpen] = useState(depth < 3)
  const [showDetails, setShowDetails] = useState(false)
  const hasChildren = trace.calls && trace.calls.length > 0
  const isError = !!trace.error
  const color = getCallColor(trace.type)

  return (
    <Box sx={{ ml: depth > 0 ? 2.5 : 0 }}>
      {/* Node header */}
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 0.75, py: 0.4,
        borderLeft: depth > 0 ? `2px solid ${isError ? '#e85d5d33' : color + '33'}` : 'none',
        pl: depth > 0 ? 1.5 : 0,
        '&:hover': { bgcolor: 'action.hover', borderRadius: '6px' },
      }}>
        {/* Expand toggle */}
        {hasChildren ? (
          <IconButton size="small" onClick={() => setOpen(!open)} sx={{ p: 0.25, color: 'text.secondary' }}>
            {open ? <FaChevronDown size={10} /> : <FaChevronRight size={10} />}
          </IconButton>
        ) : (
          <Box sx={{ width: 22 }} />
        )}

        {/* Call type badge */}
        <Typography sx={{
          fontSize: 11, fontWeight: 700, color: '#fff',
          bgcolor: isError ? '#e85d5d' : color,
          px: 0.75, py: 0.15, borderRadius: '4px', lineHeight: 1.4,
          fontFamily: 'monospace',
        }}>
          {trace.type}
        </Typography>

        {/* From → To */}
        <Tooltip title={trace.from}>
          <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary', cursor: 'pointer' }}
            onClick={() => copy(trace.from)}>
            {shortenAddr(trace.from)}
          </Typography>
        </Tooltip>
        <Typography variant="caption" sx={{ color: 'text.disabled' }}>→</Typography>
        <Tooltip title={trace.to}>
          <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.primary', fontWeight: 500, cursor: 'pointer' }}
            onClick={() => copy(trace.to)}>
            {shortenAddr(trace.to)}
          </Typography>
        </Tooltip>

        {/* Value if nonzero */}
        {trace.value && trace.value !== '0x0' && trace.value !== '0x' && (
          <Typography variant="caption" sx={{ color: '#e8853d', fontWeight: 600 }}>
            {formatValue(trace.value)}
          </Typography>
        )}

        {/* Gas */}
        <Typography variant="caption" sx={{ color: 'text.disabled', ml: 'auto' }}>
          gas: {formatGas(trace.gasUsed)}/{formatGas(trace.gas)}
        </Typography>

        {/* Selector (first 10 chars of input = 4 bytes) */}
        {trace.input && trace.input.length >= 10 && (
          <Tooltip title="Function selector — click to copy full input">
            <Typography variant="caption" sx={{
              fontFamily: 'monospace', color: 'text.disabled', cursor: 'pointer',
              '&:hover': { color: '#5b7ff5' },
            }} onClick={() => copy(trace.input || '')}>
              {trace.input.slice(0, 10)}
            </Typography>
          </Tooltip>
        )}

        {/* Details toggle */}
        <Typography variant="caption" sx={{
          color: '#5b7ff5', cursor: 'pointer', userSelect: 'none',
          '&:hover': { textDecoration: 'underline' },
        }} onClick={() => setShowDetails(!showDetails)}>
          {showDetails ? 'hide' : 'detail'}
        </Typography>

        {/* Error indicator */}
        {isError && (
          <Typography variant="caption" sx={{ color: '#e85d5d', fontWeight: 600 }}>
            REVERT{trace.revertReason ? `: ${trace.revertReason}` : ''}
          </Typography>
        )}
      </Box>

      {/* Details panel */}
      <Collapse in={showDetails}>
        <Box sx={{
          ml: depth > 0 ? 0 : 0, mt: 0.5, mb: 1, p: 1.5,
          bgcolor: 'action.hover', borderRadius: '8px',
          borderLeft: `3px solid ${color}`,
        }}>
          <Stack spacing={0.75}>
            <DetailRow label="From" value={trace.from} mono copyable />
            <DetailRow label="To" value={trace.to} mono copyable />
            <DetailRow label="Value" value={formatValue(trace.value)} />
            <DetailRow label="Gas" value={formatGas(trace.gas)} />
            <DetailRow label="Gas Used" value={formatGas(trace.gasUsed)} />
            {trace.input && trace.input !== '0x' && (
              <DetailRow label="Input" value={trace.input} mono copyable truncate />
            )}
            {trace.output && trace.output !== '0x' && (
              <DetailRow label="Output" value={trace.output} mono copyable truncate />
            )}
            {trace.error && <DetailRow label="Error" value={trace.error} error />}
            {trace.revertReason && <DetailRow label="Revert Reason" value={trace.revertReason} error />}
          </Stack>
        </Box>
      </Collapse>

      {/* Children */}
      {hasChildren && (
        <Collapse in={open}>
          {trace.calls!.map((child, i) => (
            <CallNode key={i} trace={child} depth={depth + 1} />
          ))}
        </Collapse>
      )}
    </Box>
  )
}

function DetailRow({ label, value, mono, copyable, truncate, error }: {
  label: string; value: string; mono?: boolean; copyable?: boolean; truncate?: boolean; error?: boolean
}) {
  const display = truncate && value.length > 200 ? value.slice(0, 200) + '...' : value
  return (
    <Stack direction="row" spacing={1} alignItems="flex-start">
      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, minWidth: 80, flexShrink: 0 }}>
        {label}
      </Typography>
      <Typography variant="caption" sx={{
        fontFamily: mono ? 'monospace' : 'inherit',
        color: error ? '#e85d5d' : 'text.primary',
        wordBreak: 'break-all', flex: 1,
      }}>
        {display}
      </Typography>
      {copyable && (
        <IconButton size="small" onClick={() => copy(value)} sx={{ p: 0.25, color: 'text.disabled', '&:hover': { color: '#5b7ff5' } }}>
          <FaCopy size={10} />
        </IconButton>
      )}
    </Stack>
  )
}

// ── Parity trace_transaction → CallTrace conversion ──

interface ParityTrace {
  action: {
    from: string
    to: string
    callType?: string  // call, delegatecall, staticcall, create, create2
    value: string
    gas: string
    input: string
  }
  result?: {
    gasUsed: string
    output: string
    address?: string  // for CREATE
  }
  error?: string
  subtraces: number
  traceAddress: number[]
  type: string  // call, create, suicide
}

function parityTracesToCallTree(traces: ParityTrace[]): CallTrace | null {
  if (traces.length === 0) return null

  // Build a map from traceAddress → node
  const nodeMap = new Map<string, CallTrace>()

  for (const t of traces) {
    const callType = t.type === 'create'
      ? 'CREATE'
      : t.type === 'suicide'
      ? 'SELFDESTRUCT'
      : (t.action.callType || 'call').toUpperCase()

    const node: CallTrace = {
      type: callType,
      from: t.action.from,
      to: t.action.to || t.result?.address || '',
      value: t.action.value,
      gas: t.action.gas,
      gasUsed: t.result?.gasUsed,
      input: t.action.input,
      output: t.result?.output,
      error: t.error,
      calls: [],
    }

    const key = JSON.stringify(t.traceAddress)
    nodeMap.set(key, node)

    // Attach to parent
    if (t.traceAddress.length > 0) {
      const parentKey = JSON.stringify(t.traceAddress.slice(0, -1))
      const parent = nodeMap.get(parentKey)
      if (parent) {
        if (!parent.calls) parent.calls = []
        parent.calls.push(node)
      }
    }
  }

  // Root is traceAddress = []
  const root = nodeMap.get('[]')
  if (root) {
    // Remove empty calls arrays for leaf nodes
    const cleanEmpty = (n: CallTrace) => {
      if (n.calls && n.calls.length === 0) delete n.calls
      else if (n.calls) n.calls.forEach(cleanEmpty)
    }
    cleanEmpty(root)
    return root
  }
  return null
}

// ── Main Page ──

type RpcSource = 'wallet' | 'custom'

export default function TxDebugPage() {
  const publicClient = useDynamicPublicClient()
  const { showSuccess, showError } = useSnackbar()

  const [txHash, setTxHash] = useState('')
  const [rpcSource, setRpcSource] = useState<RpcSource>('wallet')
  const [customRpc, setCustomRpc] = useState('')
  const [loading, setLoading] = useState(false)
  const [trace, setTrace] = useState<CallTrace | null>(null)
  const [traceMethod, setTraceMethod] = useState('')
  const [txInfo, setTxInfo] = useState<{ blockNumber: string; status: string; gasUsed: string } | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  const getRpcUrl = useCallback((): string | null => {
    if (rpcSource === 'custom') {
      return customRpc.trim() || null
    }
    if (publicClient) {
      const transport = publicClient.transport as { url?: string }
      if (transport?.url) return transport.url
    }
    return null
  }, [rpcSource, customRpc, publicClient])

  // Generic JSON-RPC call helper
  const rpcCall = useCallback(async (rpcUrl: string, method: string, params: unknown[]) => {
    const res = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: Date.now(), method, params }),
    })
    return res.json()
  }, [])

  const handleTrace = useCallback(async () => {
    if (!txHash.trim()) { showError('Please enter a transaction hash'); return }
    if (!/^0x[a-fA-F0-9]{64}$/.test(txHash.trim())) { showError('Invalid transaction hash format'); return }

    const rpcUrl = getRpcUrl()
    if (!rpcUrl) {
      showError(rpcSource === 'custom' ? 'Please enter a custom RPC URL' : 'No RPC URL available. Try connecting wallet or use custom RPC.')
      return
    }

    setLoading(true)
    setTrace(null)
    setTxInfo(null)
    setErrorMsg('')
    setTraceMethod('')

    const hash = txHash.trim()

    try {
      // 1. Fetch tx receipt for basic info
      const receiptJson = await rpcCall(rpcUrl, 'eth_getTransactionReceipt', [hash])
      if (receiptJson.result) {
        setTxInfo({
          blockNumber: hexToDecimal(receiptJson.result.blockNumber),
          status: receiptJson.result.status === '0x1' ? 'Success' : 'Failed',
          gasUsed: formatGas(receiptJson.result.gasUsed),
        })
      }

      // 2. Try debug_traceTransaction (Geth debug API) first
      const debugJson = await rpcCall(rpcUrl, 'debug_traceTransaction', [hash, { tracer: 'callTracer', tracerConfig: { withLog: false } }])

      if (!debugJson.error && debugJson.result) {
        setTrace(debugJson.result)
        setTraceMethod('debug_traceTransaction')
        showSuccess(`Trace loaded via debug_traceTransaction — ${countCalls(debugJson.result)} calls`)
        return
      }

      // 3. Fallback: trace_transaction (Parity / OpenEthereum / Erigon)
      const parityJson = await rpcCall(rpcUrl, 'trace_transaction', [hash])

      if (!parityJson.error && Array.isArray(parityJson.result) && parityJson.result.length > 0) {
        const tree = parityTracesToCallTree(parityJson.result)
        if (tree) {
          setTrace(tree)
          setTraceMethod('trace_transaction')
          showSuccess(`Trace loaded via trace_transaction — ${countCalls(tree)} calls`)
          return
        }
      }

      // 4. Both failed — show errors
      const errors: string[] = []
      if (debugJson.error) errors.push(`debug_traceTransaction: ${debugJson.error.message || JSON.stringify(debugJson.error)}`)
      if (parityJson.error) errors.push(`trace_transaction: ${parityJson.error.message || JSON.stringify(parityJson.error)}`)
      if (errors.length === 0) errors.push('No trace data returned from any method.')
      setErrorMsg(errors.join('\n'))
    } catch (err) {
      setErrorMsg('RPC request failed: ' + (err as Error).message)
    } finally {
      setLoading(false)
    }
  }, [txHash, getRpcUrl, rpcSource, rpcCall, showSuccess, showError])

  return (
    <Box sx={{ p: 3, maxWidth: 1200 }}>
      {/* Input Card */}
      <Box sx={{ bgcolor: 'background.paper', borderRadius: '12px', p: 3, mb: 2 }}>
        <Stack spacing={2}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>TX Debug Trace</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Trace a transaction&apos;s internal call stack. Automatically tries <code>debug_traceTransaction</code> then falls back to <code>trace_transaction</code> (Parity/Erigon). Most public RPCs support at least one.
          </Typography>

          <TextField
            size="small" label="Transaction Hash" fullWidth
            placeholder="0x..."
            value={txHash}
            onChange={(e) => setTxHash(e.target.value)}
            error={txHash.length > 0 && !/^0x[a-fA-F0-9]{64}$/.test(txHash)}
            helperText={txHash.length > 0 && !/^0x[a-fA-F0-9]{64}$/.test(txHash) ? 'Must be 0x + 64 hex chars' : ''}
          />

          <Stack direction="row" spacing={2} alignItems="flex-start">
            <TextField
              select size="small" label="RPC Source"
              value={rpcSource}
              onChange={(e) => setRpcSource(e.target.value as RpcSource)}
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="wallet">Current Wallet RPC</MenuItem>
              <MenuItem value="custom">Custom RPC</MenuItem>
            </TextField>

            {rpcSource === 'custom' && (
              <TextField
                size="small" label="Custom RPC URL" fullWidth
                placeholder="https://..."
                value={customRpc}
                onChange={(e) => setCustomRpc(e.target.value)}
              />
            )}

            {rpcSource === 'wallet' && publicClient && (
              <Typography variant="caption" sx={{ color: 'text.secondary', pt: 1, fontFamily: 'monospace' }}>
                {(publicClient.transport as { url?: string })?.url || 'Connected via wallet'}
              </Typography>
            )}
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <Button variant="contained" disabled={loading} onClick={handleTrace}
              sx={{ bgcolor: '#5b7ff5', '&:hover': { bgcolor: '#4a6de0' } }}
            >
              {loading ? 'Tracing...' : 'Trace Transaction'}
            </Button>
            {loading && <CircularProgress size={18} />}
          </Stack>
        </Stack>
      </Box>

      {/* Error + cast fallback suggestion */}
      {errorMsg && (
        <Box sx={{ bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(232,93,93,0.1)' : '#fef2f2', borderRadius: '12px', p: 2, mb: 2 }}>
          <Typography variant="body2" component="pre" sx={{ color: '#e85d5d', wordBreak: 'break-word', whiteSpace: 'pre-wrap', fontFamily: 'inherit', m: 0, mb: 2 }}>
            {errorMsg}
          </Typography>
          <Box sx={{ bgcolor: 'background.paper', borderRadius: '8px', p: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Alternative: use Foundry&apos;s <code>cast</code> CLI
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
              <code>cast run</code> re-executes the transaction locally using standard RPC calls, so it works with any RPC node — no debug API needed.
            </Typography>
            <Box sx={{ bgcolor: (t) => t.palette.mode === 'dark' ? '#0f1117' : '#1a1d23', borderRadius: '6px', p: 1.5, mb: 1.5 }}>
              <Typography component="pre" sx={{ fontFamily: '"SF Mono", Monaco, Menlo, monospace', fontSize: 12, color: '#00cdae', whiteSpace: 'pre-wrap', wordBreak: 'break-all', m: 0 }}>
{`# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Trace a transaction
cast run ${txHash || '0x<txHash>'} --rpc-url ${getRpcUrl() || 'https://ethereum-rpc.publicnode.com'}

# Quick mode (skip block environment setup, faster)
cast run ${txHash || '0x<txHash>'} --rpc-url ${getRpcUrl() || 'https://ethereum-rpc.publicnode.com'} --quick`}
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              Foundry docs: https://book.getfoundry.sh
            </Typography>
          </Box>
        </Box>
      )}

      {/* Tx Info Summary */}
      {txInfo && (
        <Box sx={{ bgcolor: 'background.paper', borderRadius: '12px', p: 2, mb: 2 }}>
          <Stack direction="row" spacing={3} flexWrap="wrap">
            <InfoChip label="Block" value={txInfo.blockNumber} />
            <InfoChip label="Status" value={txInfo.status} color={txInfo.status === 'Success' ? '#48bb78' : '#e85d5d'} />
            <InfoChip label="Gas Used" value={txInfo.gasUsed} />
            {trace && <InfoChip label="Internal Calls" value={String(countCalls(trace))} />}
            {traceMethod && <InfoChip label="Method" value={traceMethod} />}
          </Stack>
        </Box>
      )}

      {/* Call Trace Tree */}
      {trace && (
        <Box sx={{ bgcolor: 'background.paper', borderRadius: '12px', p: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Call Stack</Typography>
            <Button size="small" onClick={() => copy(JSON.stringify(trace, null, 2))}
              startIcon={<FaCopy size={11} />}
              sx={{ color: 'text.secondary', textTransform: 'none', fontSize: 12 }}
            >
              Copy raw JSON
            </Button>
          </Stack>
          <Box sx={{ overflow: 'auto' }}>
            <CallNode trace={trace} />
          </Box>
        </Box>
      )}
    </Box>
  )
}

function InfoChip({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <Stack spacing={0.25}>
      <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 11 }}>{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace', color: color || 'text.primary' }}>
        {value}
      </Typography>
    </Stack>
  )
}
