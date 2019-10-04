"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var express = require('express');
var router = express.Router();

Object.defineProperty(exports, "__esModule", { value: true });
const node_powershell_1 = __importDefault(require("node-powershell"));
const Datastores_1 = require("./Datastores");
const DataCenter_1 = require("./DataCenter");
const Cluster_1 = require("./Cluster");
const Vlan_1= require("./Vlan")
const run_1 = require("./lib/run");
const VMs_1 = require("./VMs");
const URL = '172.16.100.166';
const username = 'test.pfe@vsphere.local';
const password = 'PFE123**456';
const port = 443;
const name = 'testFirst'
const vs = 'vSwitch1'
const vid= 100
router.get('/getDcDetails',async (req,res)=>{
    const ps = new node_powershell_1.default({
        executionPolicy: 'Bypass',
        noProfile: true,
    });
    console.log('Disabling SSL Cert Test');
    const disableAuth = await run_1.run(ps, 'Set-PowerCLIConfiguration -InvalidCertificateAction Ignore -Confirm:$false');
    console.log(`Disabling Auth Done: ${disableAuth}`);
    console.log('Login into vCenter');
    const test = await run_1.run(ps, `Connect-VIServer -Server ${URL} -Port ${port}  -Protocol https -Username ${username} -Password ${password}`);
    console.log(test);
    const ds = await Datastores_1.getDatastores(ps);
    console.log(ds);

   const cluster = await Cluster_1.getCluster(ps);
   console.log(Cluster);
    ps.dispose();
    res.send({ds,cluster});
})
const Start = async () => {
    // Initialize
    const ps = new node_powershell_1.default({
        executionPolicy: 'Bypass',
        noProfile: true,
    });
    console.log('Disabling SSL Cert Test');
    const disableAuth = await run_1.run(ps, 'Set-PowerCLIConfiguration -InvalidCertificateAction Ignore -Confirm:$false');
    console.log(`Disabling Auth Done: ${disableAuth}`);
    console.log('Login into vCenter');
    const test = await run_1.run(ps, `Connect-VIServer -Server ${URL} -Port ${port}  -Protocol https -Username ${username} -Password ${password}`);
    console.log(test);
    //const r = await run_1.run(ps, `New-VirtualPortGroup -Name ${name} -VirtualSwitch ${vs} -VLanId ${vid} `);
   // const ds = await Datastores_1.getDatastores(ps);
   //console.log(r);
    //console.log(ds);
    //const vl = await Vlan_1.getVlan(ps);
    //console.log(vl);
    //const Cluster = await Cluster_1.getCluster(ps);
    //console.log(Cluster);
    const DCs = await DataCenter_1.getDataCenters(ps);
    console.log(DCs);
    ps.dispose();
};
//Start();
module.exports = router;
