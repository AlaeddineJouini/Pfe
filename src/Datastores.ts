// src/Datastores.ts
import { run }  from './lib/run'
import Shell from 'node-powershell'

export const getDatastores = async (ps: Shell) => {
  
  const res = await run(ps, 'Get-Datastore | Select Name,FreeSpaceGB,CapacityGB  | ConvertTo-Json')
  return JSON.parse(res)
}