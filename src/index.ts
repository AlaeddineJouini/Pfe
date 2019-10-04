import Shell from 'node-powershell';
import { getDatastores } from './Datastores'
import { run } from './lib/run'
import { getVMs } from './VMs';

const URL = '172.16.100.9';
const username = 'test.pfe@vsphere.local';
const password = 'PFE123**456';
const port = 443;

const Start = async () => {
  // Initialize
  const ps = new Shell({
    executionPolicy: 'Bypass',
    noProfile: true,
  });

  console.log('Disabling SSL Cert Test')
  const disableAuth = await run(ps, 'Set-PowerCLIConfiguration -InvalidCertificateAction Ignore -Confirm:$false')
  console.log(`Disabling Auth Done: ${disableAuth}`)

  console.log('Login into vCenter')
  const test = await run(ps, `Connect-VIServer -Server ${URL} -Port ${port}  -Protocol https -Username ${username} -Password ${password}`);
  console.log(test)

  const ds = await getDatastores(ps)
  console.log(ds)

  const VMs = await getVMs(ps)
  console.log(VMs)

  ps.dispose()

}

Start()