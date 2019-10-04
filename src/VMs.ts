// src/VMs.ts
import { run }  from './lib/run'
import Shell from 'node-powershell'

export const getVMs = async (ps: Shell) => {
    const res = await run(ps, 'Get-VM | Select Name | ConvertTo-Json')
  return JSON.parse(res)
}