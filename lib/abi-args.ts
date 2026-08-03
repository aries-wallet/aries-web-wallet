import { parseUnits } from 'viem'

export type AbiParam = { name?: string; type: string }

export const unitOptions = ['Wei', 'Gwei', 'Ether'] as const

export const getDecimals = (unit: string) => {
  switch (unit) {
    case 'Gwei': return 9
    case 'Ether': return 18
    default: return 0
  }
}

export const paramName = (input: AbiParam, index: number) => input.name || `param${index}`

// An empty box is a real value for `string` — solidity mappings are commonly keyed by "".
// Every other type needs something typed in before the call can be encoded.
const acceptsEmpty = (type: string) => type === 'string'

const isJsonType = (type: string) => type.endsWith(']') || type.startsWith('tuple')

function parseBool(name: string, raw: string): boolean {
  const v = raw.trim().toLowerCase()
  if (v === 'true' || v === '1') return true
  if (v === 'false' || v === '0') return false
  throw new Error(`${name}: invalid bool value "${raw}"`)
}

function parseJson(name: string, raw: string): unknown {
  try {
    return JSON.parse(raw)
  } catch {
    throw new Error(`${name}: expected JSON, e.g. ["val1","val2"] or {"key":"val"}`)
  }
}

/** Names of the params still waiting on input. Empty `string` params do not count. */
export function missingParams(inputs: readonly AbiParam[], values: Record<string, string>): string[] {
  const missing: string[] = []
  inputs.forEach((input, index) => {
    const name = paramName(input, index)
    if (!acceptsEmpty(input.type) && (values[name] ?? '') === '') missing.push(name)
  })
  return missing
}

/** Turn the raw text boxes into encodable args. Throws on values that cannot be converted. */
export function buildArgs(
  inputs: readonly AbiParam[],
  values: Record<string, string>,
  units: Record<string, string> = {},
): unknown[] {
  const missing = missingParams(inputs, values)
  if (missing.length > 0) throw new Error(`Missing value for: ${missing.join(', ')}`)

  return inputs.map((input, index) => {
    const name = paramName(input, index)
    const raw = values[name] ?? ''
    if (input.type === 'string') return raw
    if (input.type === 'bool') return parseBool(name, raw)
    if (input.type === 'uint256') return parseUnits(raw, getDecimals(units[name] || 'Wei')).toString()
    if (isJsonType(input.type)) return parseJson(name, raw)
    return raw
  })
}
