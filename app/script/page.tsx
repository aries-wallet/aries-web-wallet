'use client'

import { Box, Button, Stack, Typography } from '@mui/material'
import { useCallback, useRef, useState } from 'react'
import { useAccount, useWalletClient } from 'wagmi'
import { useDynamicPublicClient } from '@/lib/hooks/use-dynamic-client'
import * as viem from 'viem'

const template = `
// You can use the wallet object to get address, chainId, publicClient, walletClient, and viem
const func = async () => {
    const address = wallet.address;
    const chainId = wallet.chainId;
    const publicClient = wallet.publicClient;
    const balance = await publicClient.getBalance({ address });
    console.log('Address and chainId', address, chainId);
    console.log('Balance:', balance.toString());
}

// Run the function above
func();
`

export default function ScriptPage() {
  const [code, setCode] = useState(template)
  const [output, setOutput] = useState<string[]>([])
  const [running, setRunning] = useState(false)
  const { address, chainId } = useAccount()
  const publicClient = useDynamicPublicClient()
  const { data: walletClient } = useWalletClient()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const lineCount = code.split('\n').length

  const runScript = useCallback(() => {
    setRunning(true)
    setOutput([])
    const logs: string[] = []
    const walletObj = { address, chainId, publicClient, walletClient, viem }

    // Capture console.log output
    const origLog = console.log
    const origError = console.error
    console.log = (...args: unknown[]) => {
      origLog(...args)
      logs.push(args.map((a) => (typeof a === 'object' ? JSON.stringify(a, (_, v) => typeof v === 'bigint' ? v.toString() : v) : String(a))).join(' '))
      setOutput([...logs])
    }
    console.error = (...args: unknown[]) => {
      origError(...args)
      logs.push('[ERROR] ' + args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '))
      setOutput([...logs])
    }

    try {
      const myFunc = new Function('wallet', code)
      const result = myFunc(walletObj)
      if (result && typeof result.then === 'function') {
        result.then(() => {
          setRunning(false)
        }).catch((err: Error) => {
          logs.push('[ERROR] ' + err.message)
          setOutput([...logs])
          setRunning(false)
        })
      } else {
        setRunning(false)
      }
    } catch (err) {
      logs.push('[ERROR] ' + (err as Error).message)
      setOutput([...logs])
      setRunning(false)
    } finally {
      console.log = origLog
      console.error = origError
    }
  }, [address, chainId, publicClient, walletClient, code])

  return (
    <Box sx={{ p: 3, maxWidth: 960 }}>
      <Box sx={{ bgcolor: 'background.paper', borderRadius: '12px', p: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Script Runner</Typography>
          <Button variant="contained" disabled={running}
            sx={{ alignSelf: 'flex-start', bgcolor: '#5b7ff5', '&:hover': { bgcolor: '#4a6de0' } }}
            onClick={runScript}
          >
            {running ? 'Running...' : 'Run'}
          </Button>

          {/* Editor with line numbers */}
          <Box sx={{
            display: 'flex', borderRadius: '10px', overflow: 'hidden',
            bgcolor: '#1a1d23', border: '1px solid #2d3748',
          }}>
            {/* Line numbers */}
            <Box sx={{
              py: '16px', pl: '12px', pr: '8px',
              color: '#4a5568', fontFamily: '"SF Mono", Monaco, Menlo, monospace',
              fontSize: 13, lineHeight: 1.6, userSelect: 'none',
              textAlign: 'right', minWidth: 40,
            }}>
              {Array.from({ length: lineCount }, (_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </Box>
            <textarea
              ref={textareaRef}
              style={{
                color: '#00cdae', backgroundColor: 'transparent', width: '100%',
                fontFamily: '"SF Mono", Monaco, Menlo, monospace', fontSize: 13,
                padding: '16px 16px 16px 8px', border: 'none', outline: 'none',
                lineHeight: 1.6, resize: 'vertical', minHeight: 320,
              }}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
            />
          </Box>

          {/* Output panel */}
          {output.length > 0 && (
            <Box sx={{
              bgcolor: '#0f1117', borderRadius: '8px', p: 2, maxHeight: 300, overflow: 'auto',
              border: '1px solid #2d3748',
            }}>
              <Typography variant="caption" sx={{ color: '#718096', fontWeight: 600, mb: 1, display: 'block' }}>
                Output
              </Typography>
              {output.map((line, i) => (
                <Typography key={i} variant="body2" sx={{
                  fontFamily: 'monospace', fontSize: 12, lineHeight: 1.5,
                  color: line.startsWith('[ERROR]') ? '#e85d5d' : '#a0aec0',
                  whiteSpace: 'pre-wrap', wordBreak: 'break-all',
                }}>
                  {line}
                </Typography>
              ))}
            </Box>
          )}

          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            * Console output is captured above. Full output also available in F12 developer tools.
          </Typography>
        </Stack>
      </Box>
    </Box>
  )
}
