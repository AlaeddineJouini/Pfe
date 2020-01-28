"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};

Object.defineProperty(exports, "__esModule", { value: true });

const node_powershell_1 = __importDefault(require("node-powershell"));

var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const dc = require('../models/Cloud');
const cluster = require('../models/cluster');
const ds = require('../models/dataStorage');
const parser = require('body-parser');
const run_1 = require("../dist/lib/run");
const cpts_1 = require("../dist/ComputeNode");
const c = require('../models/Cloud');
const ds_1 = require('../dist/Datastores')


/* GET home page. */
router.get('/listDc', function (req, res, next) {
    if (req.isAuthenticated() && ((req.user.isAdmin())||(req.user.isSuper()))){
    dc.find({}).then((data) => {
        res.render('template/dataCenter', { clouds: data });
    }).catch((err) => {
        res.setHeader('Status', 500)
        res.json(err);
    })
} else {
    res.sendStatus(403) // Forbidden
   }
});
router.get('/addDc', function (req, res, next) {
    if (req.isAuthenticated() && req.user.isAdmin()){
    res.render('addDc');
} else {
    res.sendStatus(403) // Forbidden
   }
});
router.post('/addDc', function (req, res, next) {
    if (req.isAuthenticated() && ((req.user.isAdmin())||(req.user.isSuper()))){
    let Object = {
        "name": req.body.name,
        "adress": req.body.adress,
        "user": req.body.user,
        "password": req.body.password
    };
    dc.create(Object);

    res.redirect('/dataCenter/listDc');
} else {
    res.sendStatus(403) // Forbidden
   }

});
router.get('/dcDetails/:id', async function (req, res, next) {
    if (req.isAuthenticated() && ((req.user.isAdmin())||(req.user.isSuper()))){
    let clusters;
    let dss;
    let id = req.params.id;
    
    
    res.render('dcDetails', {id });
} else {
    res.sendStatus(403) // Forbidden
   }
});
router.get('/removeDc/:id', function (req, res, next) {
    if (req.isAuthenticated() && ((req.user.isAdmin())||(req.user.isSuper()))){
    dc.deleteOne({ _id: req.params.id }).then(() => {
        
        res.redirect('/dataCenter/listDc');
    }).catch((err) => {
        res.setHeader('Status', 500)
        res.json(err);
    })
    

} else {
    res.sendStatus(403) // Forbidden
   }
});
router.get('/updateDc/:id', (req, res, next) => {
    if (req.isAuthenticated() && ((req.user.isAdmin())||(req.user.isSuper()))){
    dc.findById(req.params.id).then((Object) => {

        console.log(Object.name);
        res.render('addDc', { dc: Object });
    }).catch((err) => {
        console.log(err);
    })
} else {
    res.sendStatus(403) // Forbidden
   }
})
router.post('/updateDc/:id', (req, res, next) => {
    if (req.isAuthenticated() && ((req.user.isAdmin())||(req.user.isSuper()))){
    let Object = {
        "name": req.body.name,
        "adress": req.body.adress,
        "user": req.body.user,
        "password": req.body.password
    };
    dc.updateOne({ _id: req.params.id }, Object, (err) => {
        console.log(err);
    })
    res.redirect('/dataCenter/listDc');
} else {
    res.sendStatus(403) // Forbidden
   }
})

router.get('/details/:id', (req, res, next) => {
    if (req.isAuthenticated() && ((req.user.isAdmin())||(req.user.isSuper()))){
        c.findById(req.params.id).then(async (data)=>{
            
          let URL = data.adress;
            let username = data.user ;
            let password = data.password;
            const port = 443;
            
                /////
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
                const cpt = await cpts_1.getComputes(ps);
                const dStore = await ds_1.getDatastores(ps);
                //console.log(cpt);
                const countVM = async (ps,hostName) => {
                    const res = await run_1.run(ps, `(Get-VM -Location "${hostName}").count`);
                    return JSON.parse(res);
                };

                let dss=[]
                let counter = 0
                for (var d of dStore){
                    dStore[counter].Used = d.CapacityGB-d.FreeSpaceGB;
                    counter++;
                }
                //adding count to cpt result
                let indx =0;
                for (var cp of cpt){
                    cpt[indx].VmNumber =await countVM(ps,cp.Name);
                    indx++;
                }
               console.log(cpt)
               console.log(dStore)
                ps.dispose();
                res.render('template/cloudComputes',{cpt,dStore});
              /*  const cpt =[{
                    'Name' : 'esx1',
                    'NumCpu' : 5,
                    'CpuUsageMhz' : 20 ,
                    'CpuTotalMhz' : 30,
                    'MemoryUsageGB': 30,
                    'MemoryTotalGB' : 100
                },
                {
                    'Name' : 'esx2',
                    'NumCpu' : 6,
                    'CpuUsageMhz' : 22 ,
                    'CpuTotalMhz' : 30,
                    'MemoryUsageGB': 40,
                    'MemoryTotalGB' : 100
                },
                {
                    'Name' : 'esx3',
                    'NumCpu' : 4,
                    'CpuUsageMhz' : 25 ,
                    'CpuTotalMhz' : 30,
                    'MemoryUsageGB': 50,
                    'MemoryTotalGB' : 100
                }
            ]
                 res.render('template/cloudComputes',{cpt})    
             
                 */
          }).catch((err)=>{
              res.setHeader('Status', 500)
              res.json(err);
          })
} else {
    res.sendStatus(403) // Forbidden
   }
})

module.exports = router;
