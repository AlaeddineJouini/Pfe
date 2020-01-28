"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};

Object.defineProperty(exports, "__esModule", { value: true });
const node_powershell_1 = __importDefault(require("node-powershell"));
const Datastores_1 = require("../dist/Datastores");
const run_1 = require("../dist/lib/run");
const cl_1 = require("../dist/Cluster");
const dc_1 = require("../dist/DataCenter");

////////////////////
var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const vm = require('../models/vms');
const diskModel = require('../models/disk');
const parser = require('body-parser');
const osType = require('../models/operatingSystemType');
const osName = require('../models/operatingSystem');
const c = require('../models/Cloud');
const cluster = require('../models/cluster');
const User = require('../models/user');
const dataStorage = require('../models/dataStorage');
const ipModel =require('../models/ips');
var fs = require('fs');

router.get('/addVm', async function (req, res, next) {
    console.log('im here')
    if (req.isAuthenticated()){
      let d;
      await c.find({}).then(data => {
          d = data;
      }).catch(err => {
  
      });
      osType.find({}).then( async (data) => {
          console.log(data);
          let ip = '';
          if(req.user.isClient() && req.user.isActivated()){
            let ip = '';
            await User.findById(req.user._id).populate('iprange').exec().then(async doc=>{
              console.log("there");
              // if(err) return handleError(err)
                let arr,arf=[];
              arr=doc.iprange;
              arf = await arr.filter(e=>e.available==true )
              console.log(arr)
              if(arr.length == 0){
                ip =  await 'no more available ips';
              }else{
                ip =  await arf[0].ip;
              }
            res.render('template/addVM', { osType: data, c: d , ip});
            });
          
        }else{
          res.render('template/addVM', { osType: data, c: d });
        }
      }).catch(err => {
  
      })
    } else {
      res.sendStatus(403) // Forbidden
     }
  
  });

  router.get('/useraddVm', async function (req, res, next) {
    res.render('template/addVM');
    // console.log('im here');
    //   await c.find({}).then(data => {
    //       d = data;
    //       res.render('template/addVM',{c:d});
    //   }).catch(err => {
  
    //   });
      // await osType.find({}).then((data) => {
      //     console.log(data);
      //     res.render('template/addVM', { osType: data, c: d });
      // }).catch(err => {
  
      // });
    
  });
  router.post('/getOsNames', function (req, res, next) {
    if (req.isAuthenticated()){
      console.log('beforeType')
      console.log(req.body.type)
      osType.findOne({ type: req.body.type }).then((data) => {
          osName.find({ type: data._id }).then(doc => {
              //console.log(doc)
              res.send(doc);
          }).catch(error => {
              console.log(error)
          })
  
      }).catch(err => {
          res.setHeader('Status', 500)
          res.json(err);
  
      });
    } else {
      res.sendStatus(403) // Forbidden
     }
  
  });
  
 /* router.post('/getClDs',function (req, res, next) {
    if (req.isAuthenticated()){
      dc.findOne({name : req.body.Dc}).then((data)=>{
          cluster.find({dc : data._id}).then((doc)=>{
              dataStorage.find({dc : data._id}).then((d)=>{
                  console.log(data)
                  console.log(doc)
                  console.log(d)
                  res.send({doc,d});
              }).catch((err)=>{
                  res.setHeader('Status', 500)
                  res.json(err);
              })
          }).catch((err)=>{
              res.setHeader('Status', 500)
              res.json(err);
          })
      }).catch((err)=>{
          res.setHeader('Status', 500)
          res.json(err);
      })
    } else {
      res.sendStatus(403) // Forbidden
     }
      
  });*/
  router.post('/getClDs',function (req, res, next) {
   /* const URL = '172.16.100.166';
    const username = 'test.pfe@eodatacenter.local';
    const password = 'Pfe123**456';
    const port = 443;
    */
    if (req.isAuthenticated()){
      c.findOne({name : req.body.Dc}).then(async (data)=>{
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
            const ds = await Datastores_1.getDatastores(ps);
            console.log(ds);
            const cl = await cl_1.getCluster(ps);
            console.log(cl);
            const dcenter = await dc_1.getDataCenters(ps);
            console.log(dcenter);
            ps.dispose();


            /////

                  res.send({ds,cl,dcenter});
                  
         
      }).catch((err)=>{
          res.setHeader('Status', 500)
          res.json(err);
      })
    } else {
      res.sendStatus(403) // Forbidden
     }
      
  });

router.post('/adminAddVm', function (req, res, next) {

    if (req.isAuthenticated()&& (req.user.isAdmin() ||req.user.isSuper() )){
    let obj = [];
    for (var i = 1; i <= req.body.selectList; i++){
    let disk='disk'+i;
    let ndisk=null;
    let per = false;
    console.log(req.body[disk])
    
  if(req.body['pdisk' + i]=='on'){
    ndisk =req.body['namepdisk'+i];
    per= true;
    }
    let dsk = new diskModel({
        name : ndisk,
        size : req.body[disk],
        persistent : per
    });
    dsk.save();
    obj.push(dsk._id);
    }
    console.log(obj);
    let net = {
       "ip" : req.body['ip1'],
       "vlan" :req.body['vlan1'] ,
       "cidr" :req.body['cidr1'] ,
       "numberOfNetworks" : req.body.selectListnet
    }
    osType.findOne({type : req.body.selectListOS}).then(data=>{
        osName.findOne({name : req.body.detailListOS}).then(doc=>{
            c.findOne({name : req.body.selectListDC}).then(async cloud=>{
              const ps = new node_powershell_1.default({
                executionPolicy: 'Bypass',
                noProfile: true,})
                let Object = {
                    "name": req.body.vmname,
                    "dc": req.body.Dcenter,
                    "cloud" : cloud._id,
                    "cpus": req.body.cpus,
                    "cluster": req.body.Cluster,
                    "ds": req.body.DS,
                    "disk": obj,
                    "network" : net,
                    "memory":req.body.ram,
                    "dn" :req.body.dn ,
                    "gw" : req.body.gw,
                    "dns" :req.body.dns ,
                    "vmpw" :req.body.vmpw ,
                    "projectFolder" :req.body.folder ,
                    "osType" :data._id ,
                    "os" : doc._id,
                    
                    };
                    vm.create(Object);
                    res.send({Object})
                    

                    var nbDisks      = req.body.selectList;
                    var vmName       = req.body.vmname;
                    var folder       = req.body.folder;
                    var nbNet        = req.body.selectListnet;
                    var os           = req.body.selectListOS;
                    var osDetail     = req.body.detailListOS;
                    var cluster      = req.body.Cluster;
                    var ds           = req.body.DS;
                    var cpus         = req.body.cpus;
                    var ram          = req.body.ram;
                    var dn           = req.body.dn;
                    var gw           = req.body.gw;
                    var dns          = req.body.dns;
                    var vmpass       = req.body.vmpw;
                    var dcenter      = req.body.Dcenter;
                    let URL = cloud.adress;
                    let username = cloud.user ;
                    let password = cloud.password;
                    const port = 443;
                    console.log(!fs.existsSync(folder))
                    let slp= ds.split("|");
                    if (!fs.existsSync(folder)){
                      console.log('Disabling SSL Cert Test');
                            const disableAuth = await run_1.run(ps, 'Set-PowerCLIConfiguration -InvalidCertificateAction Ignore -Confirm:$false');
                            console.log(`Disabling Auth Done: ${disableAuth}`);
                            console.log('Login into vCenter');
                            const test = await run_1.run(ps, `Connect-VIServer -Server ${URL} -Port ${port}  -Protocol https -Username ${username} -Password ${password}`);
                            console.log(test);
                            const CrFolder = await run_1.run(ps, `New-Folder -Name ${folder} -Location (Get-Datacenter -Name ${dcenter} | Get-Folder -Name VM)`);
                            console.log(CrFolder);          
                      }

                 try { 
                      if (!fs.existsSync('Persistent')){
                        fs.mkdirSync('Persistent')
                      }
                    } catch (err) {
                      console.error(err)
                    }
                    try { 
                      if (!fs.existsSync('Persistent/'+folder)){
                        fs.mkdirSync('Persistent/'+folder)
                      }
                    } catch (err) {
                      console.error(err)
                    }
                    try { 
                      if (!fs.existsSync('Persistent/'+folder+'/'+vmName)){
                        fs.mkdirSync('Persistent/'+folder+'/'+vmName)
                      }
                    } catch (err) {
                      console.error(err)
                    }
                    

                    for (var i = 1; i <= nbDisks; i++){
                      let disk='disk'+i;
                      let ndisk=req.body['namepdisk'+i];
                      console.log(req.body[disk])
                    if(req.body['pdisk' + i]=='on'){try{ 
                      fs.appendFileSync('Persistent/'+folder+'/'+vmName+'/'+ndisk,'resource "vsphere_virtual_disk" '+ndisk+'" { \n'+
                         ' size         ='+req.body[disk] +'  \n'+
                         'vmdk_path    = "${var.extra_vmdk_name}"\n'+
                         'datacenter   = "${var.datacenter}"\n'+
                         'datastore    = "${var.datastore}"\n'+
                         'type         = "thin"\n'+
                        'adapter_type = "lsiLogic"\n'+
                        '}\n'+
                        '\n'
                        ,'UTF8')}
                      catch(err){
                        
                          console.log('hahaha');
                      };
                    }
                  }

                  try { 
                    if (!fs.existsSync(folder)){
                      fs.mkdirSync(folder)
                    }
                  } catch (err) {
                    console.error(err)
                  }
                  try { 
                    if (!fs.existsSync(folder+'/'+vmName)){
                      fs.mkdirSync(folder+'/'+vmName)
                    }
                  } catch (err) {
                    console.error(err)
                  }


                  

                  try{ 
                    fs.appendFileSync(folder+'/'+vmName+'/'+vmName+'vars.tf',
                    'variable "vm_name" { \n'+
                     ' description = "VMware vSphere Virtual Machine Name"\n'+
                    '}\n'+
                    '\n'+
                    'variable "vm_cpus" {\n'+
                      'description = "Number of vCPUs"\n'+
                    '}\n'+
                    '\n'+
                    'variable "vm_memory" {\n'+
                      'description = "Amount of memory assigned to the virtual machine"\n'+
                    '}\n'+
                    '\n'+
                    'variable "vm_domain_name" {\n'+
                      'description = "Virtual machine domain name"\n'+
                    '}\n'+
                    '\n'+
                    'variable "vm_ip_address" {\n'+
                      'description = "Virtual machine IP address"\n'+
                    '}\n'+
                    '\n'+
                    'variable "vm_default_gateway" {\n'+
                      'description = "Virtual machine default gateway"\n'+
                    '}\n'+
                    '\n'+
                    'variable "vm_network_cidr" {\n'+
                      'description = "Virtual machine network cidr"\n'+
                      'default = 28\n'+
                    '}\n'+
                    '\n'+
                    'variable "vm_dns_server" {\n'+
                      'description = "Virtual machine dns server"\n'+
                    '}\n'+
                    '\n'+
                    'variable "vm_folder_name" {\n'+
                      'description = "VM installatino folder"\n'+
                    '}\n'+
                    '\n'+
                    'variable "vm_host_password" {\n'+
                      'description = "Root password for ssh purpose"\n'+
                    '}\n'+
                    '\n'+
                    'variable "vsphere_user" {\n'+
                      'description = "vSphere user"\n'+
                    '}\n'+
                    ' \n'+
                    'variable "vsphere_password" {\n'+
                      'description = "vsphere password"\n'+
                      'default = "H@touti2018"\n'+
                    '}\n'+
                    ' \n'+ 
                    'variable "vsphere_server" {\n'+
                      'description = "vsphere server"\n'+
                    '}\n'+
                    '\n'+
                    'variable "vsphere_datacenter" {\n'+
                      'description = "VMware vSphere Datacenter Name"\n'+
                    '}\n'+
                    '\n'+
                    'variable "vsphere_cluster" {\n'+
                      'description = "VMware vSphere Computer Cluster Name"\n'+
                    '}\n'+
                    '\n'+
                    'variable "vsphere_datastore" {\n'+
                    'description = "VMware vSphere Datastore"\n'+
                  '}\n'+
                  '\n'+
                  'variable "vsphere_template" {\n'+
                    'description = "VMware Template"\n'+
                  '}\n'+
                  '\n'
                    ,'UTF8');
                  }
                  catch(err){
                    console.error(err)
                  }

                  for(i = 1;i <= nbNet; i++){
                    try{ fs.appendFileSync(folder+'/'+vmName+'/'+vmName+'vars.tf',
                    'variable "vsphere_network'+i+'" {\n'+
                      'description = "VMware vSphere Network'+i+' Name"\n'+
                    '}\n'+
                    '\n'
                    ,'UTF8');}

                    catch (err){
                      console.error(err)
                    }}


                    try{
                      fs.appendFileSync(folder+'/'+vmName+'/'+vmName+'.main.tf',
                      
                      
                      
                      
                      
                      'provider "vsphere" { \n'+
                      '  version = "1.10.0" \n'+
                      '  user           = "${var.vsphere_user}"\n'+
                      '  password       = "${var.vsphere_password}" \n'+
                      '  vsphere_server = "${var.vsphere_server}"\n'+
                        '\n'+
                      ' # If you have a self-signed cert \n'+
                      ' allow_unverified_ssl = true \n'+
                      '}\n'+
                      '\n'+
                      'data "vsphere_datacenter" "dc" {\n'+
                      '  name = "${var.vsphere_datacenter}"\n'+
                      '}\n'+
                      '\n'+
                      'data "vsphere_datastore" "datastore" {\n'+
                      '  name          = "${var.vsphere_datastore}"\n'+
                      '  datacenter_id = "${data.vsphere_datacenter.dc.id}"\n'+
                      '}\n'+
                      '\n'+
                      'data "vsphere_compute_cluster" "cluster" {\n'+
                      '  name          = "${var.vsphere_cluster}"\n'+
                      '  datacenter_id = "${data.vsphere_datacenter.dc.id}"\n'+
                      '}\n'+
                      'data "vsphere_virtual_machine" "template" {\n'+
                      '  name          = "${var.vsphere_template}"\n'+
                      '  datacenter_id = "${data.vsphere_datacenter.dc.id}"\n'+
                      '}\n'
                    
                      ,'UTF8');}
                      
                      catch(err){console.error(err)}

                      for(i = 1;i <= nbNet; i++){
                        try{ fs.appendFileSync(folder+'/'+vmName+'/'+vmName+'.main.tf',
                      
                        'data "vsphere_network" "network'+i+'" {\n'+
                        '  name          = "${var.vsphere_network'+i+'}"\n'+
                        '  datacenter_id = "${data.vsphere_datacenter.dc.id}"\n'+
                        '}\n'
                     
                        ,'utf8');
                      
                        }
                        catch(err){
                          console.error(err)
                        }
                      }


                      try{ fs.appendFileSync(folder+'/'+vmName+'/'+vmName+'.main.tf',
  
/*'resource "vsphere_folder" "folder" { \n'+
'path          = "'+folder+'"\n'+
'type          = "vm"\n'+
'datacenter_id = "${data.vsphere_datacenter.dc.id}"\n'+
'}\n'+ */
'resource "vsphere_virtual_machine" "'+vmName+'" {  \n'+
'  name             = "${var.vm_name}"\n'+
'  folder           = "${var.vm_folder_name}"\n'+
'  num_cpus         = "${var.vm_cpus}"\n'+
'  memory           = "${var.vm_memory}"\n'+
'  resource_pool_id = "${data.vsphere_compute_cluster.cluster.resource_pool_id}"\n'+
'  datastore_id     = "${data.vsphere_datastore.datastore.id}"\n'+
'  \n'+
'  guest_id         = "${data.vsphere_virtual_machine.template.guest_id}"\n'+
'  scsi_type        = "${data.vsphere_virtual_machine.template.scsi_type}"\n'+
'network_interface {\n'+
'  network_id   = "${data.vsphere_network.network1.id}"\n'+
'  adapter_type = "${data.vsphere_virtual_machine.template.network_interface_types[0]}"\n'+
'}\n'

  ,'utf8');

  }
  catch(err){
    console.error(err)
  }



  if(nbNet>=2){
    for(i=2;i<=nbNet;i++){
    try{ 
      fs.appendFileSync(folder+'/'+vmName+'/'+vmName+'.main.tf',
      
      
      'network_interface {\n'+
      '  network_id   = "${data.vsphere_network.network'+i+'.id}"\n'+
      '  adapter_type = "vmxnet3"\n'+
      '}\n'
    
      ,'UTF8');
    
    }
    catch(err){
      console.error(err)
    }}}



    try{

      fs.appendFileSync(folder+'/'+vmName+'/'+vmName+'.main.tf',
      
      
      'disk {\n'+
        '  label            = "disk0"\n'+
        '  size             = "'+req.body["disk"+1]+'"\n'+
        '  eagerly_scrub    = "${data.vsphere_virtual_machine.template.disks.0.eagerly_scrub}"\n'+
        '  thin_provisioned = "${data.vsphere_virtual_machine.template.disks.0.thin_provisioned}"\n'+
      '}\n'
  
      ,'UTF8');
    
    }
    catch(err){console.error(err)}


   /* try{

      for(i=1;i<=nbDisks;i++){
        if(req.body['pdisk' + i]=='on')
        {
          fs.appendFileSync(folder+'/'+vmName+'/'+vmName+'.main.tf','**not ready yet** \n','UTF8');
        }
        else{
          fs.appendFileSync(folder+'/'+vmName+'/'+vmName+'.main.tf',
          
          'disk {\n'+
            'label	     = "disk'+i+'"\n'+
            'size             ='+req.body["disk"+i]+' \n'+
            'unit_number      = '+i+'\n'+
            'thin_provisioned = true\n'+
          '}\n'
    
          ,'UTF8');
        }}}
      catch(err){console.error(err)}  
      */

      try{ 
        fs.appendFileSync(folder+'/'+vmName+'/'+vmName+'.main.tf',
        
        'clone {\n'+
          'template_uuid = "${data.vsphere_virtual_machine.template.id}"\n'+
         '\n'+
          'customize {\n'+
            'linux_options {\n'+
              'host_name = "${var.vm_name}"\n'+
              'domain    = "${var.vm_domain_name}"\n'+
            '}\n'+
        '\n'+
            'network_interface {\n'+
              'ipv4_address = "${var.vm_ip_address}"\n'+
              'ipv4_netmask = "${var.vm_network_cidr}"\n'+
            '}\n'+
         
        '\n'+
            'dns_server_list = ["${var.vm_dns_server}"]\n'+
            'ipv4_gateway = "${var.vm_default_gateway}"\n'+
          '}\n'+
        '}\n'+
        '}\n'
        
        ,'utf8')
        }
        catch(err){
          console.error(err)
        }


        try{ 
          let ip=req.body['ip1'];
          let cidr=req.body['cidr1'];
          let vlan1= req.body['vlan1']
          let sp= ds.split("|");
          console.log(sp)
        fs.appendFileSync(folder+'/'+vmName+'/'+vmName+'.auto.tfvars',
        
        'vm_name                      = "'+ vmName +'"\n'+
        'vm_cpus                      = "'+ cpus +'"\n'+
        'vm_memory                    = "'+ram *1024 +'"\n'+
        'vm_domain_name               = "'+ dn +'"\n'+
        'vm_ip_address                = "'+ ip +'"\n'+
        'vm_network_cidr              = "'+ cidr+'"\n'+
        'vm_default_gateway           = "'+ gw +'"\n'+
        'vm_dns_server                = "'+ dns  +'"\n'+
        'vm_folder_name               = "'+ folder +'"\n'+
        'vm_host_password             = "'+ vmpass +'"\n'+
        'vsphere_server               = "'+ cloud.adress +'"\n'+
        'vsphere_user                 = "'+ cloud.user +'"\n'+
        'vsphere_password             = "'+ cloud.password +'"\n'+
        'vsphere_datacenter           = "'+ dcenter +'"\n'+
        'vsphere_cluster              = "'+ cluster +'"\n'+
        'vsphere_datastore            = "'+ sp[0] +'"\n'+
        'vsphere_network1              = "VMNet_Vlan-'+vlan1+'"\n'+
        'vsphere_template             = "templates/'+osDetail +'"\n'
        
        
        ,'utf8')
        
        }
        catch(err){console.error(err)}
        
        
       /* if(nbNet>=2){
          for(i=2;i<=nbNet;i++){
          let vlan= req.body['vlan'+i];
          try{
            fs.appendFileSync(folder+'/'+vmName+'/'+vmName+'.auto.tfvars',
            
          'vsphere_network'+i+'           = "VMNet_Vlan-'+vlan +'_"\n'
      
            ,'utf8')
        
          }
          catch(err){console.error(err)}
          }}*/


      
          
              
              const pathvm= folder+'/'+vmName
              const terrapath= await run_1.run(ps,`cd ${pathvm} `);
              console.log(terrapath)
              const terrafin = await run_1.run(ps,`Terraform init `);
              console.log(terrafin)
              const terrafplan = await run_1.run(ps,`Terraform plan -out test `);
              console.log(terrafplan)
              const terrafapp = await run_1.run(ps,`Terraform apply test `);
              console.log(terrafapp)
              
            
       /*   else {
            const pathvm= folder+'/'+vmName
            const terrapath= await run_1.run(ps,`cd ${pathvm} `);
            console.log(terrapath)
            const terrafin = await run_1.run(ps,`Terraform init `);
            console.log(terrafin)
            const terrafplan = await run_1.run(ps,`Terraform plan -out test `);
            console.log(terrafplan)
            const terrafapp = await run_1.run(ps,`Terraform apply test `);
            console.log(terrafapp)
          }
*/
         
        
          
                 
         




















            }).catch(e=>{
                console.log(e)
                console.log('notfound')
            })
           
            

        }).catch(error=>{
            console.log(error)
        })
    }).catch(err=>{
        console.log(err)
    })
  
    
    //res.redirect('/dataCenter/listDc');
       
} else {
    res.sendStatus(403) // Forbidden
   }

});
router.get('/adminUpdatevm/:id',function (req,res) {
  if (req.isAuthenticated() && (req.user.isAdmin() || req.user.isSuper())){
    vm.findById(req.params.id).
    populate("cloud").
    populate("osType").
    populate("os").then(doc=>{
      res.render('template/addVM',{vm:doc});
    }).catch(err=>{
      res.setHeader('Status', 500)
      res.json(err);
    })
    // res.send('not found')
  } else {
    res.sendStatus(403) // Forbidden
   }
})


router.post('/adminUpdatevm/:id',async function (req,res) {
  if (req.isAuthenticated() && (req.user.isAdmin() || req.user.isSuper())){
    
    await vm.findById(req.params.id)
    .populate('disk')
    .populate('cloud')
    .populate('osType')
    .populate('os')
    .exec().then(async doc=>{
      const ps = new node_powershell_1.default({
        executionPolicy: 'Bypass',
        noProfile: true,})
      
      let Object={
        "cpus": req.body.cpus,
        "network" :{
          "ip" : req.body.ip1,
          "vlan" : doc.network.vlan,
          "cidr" :req.body.cidr1,
          "numberOfNetworks" :req.body.selectListnet
        },
        "memory" :req.body.ram,
        "vmpw":req.body.vmpw
      }
      vm.updateOne({_id:req.params.id},Object,err=>{
        if(err){
        console.log(err);
        res.send(err)
      }
      console.log('vmUpdated')
    })
    ///// file config
   
    var disks        = doc.disk;
    var vmName       = doc.name;
    var folder       = doc.projectFolder;
    var nbNet        = req.body.selectListnet;
    var os           = doc.osType.type;
    var osDetail     = doc.os.name;
    var cluster      = doc.cluster;
    var ds           = doc.ds;
    var cpus         = req.body.cpus;
    var ram          = req.body.ram;
    var dn           = doc.dn;
    var gw           = doc.gw;
    var dns          = doc.dns;
    var vmpass       = req.body.vmpw;
    var dcenter      = doc.dc;
    var cloud        =doc.cloud;
try {
  if (!fs.existsSync(folder)){
    fs.mkdirSync(folder)
  }
} catch (err) {
  console.error(err)
}
try {
  if (!fs.existsSync(folder+'/'+vmName)){
    fs.mkdirSync(folder+'/'+vmName)
  }
} catch (err) {
  console.error(err)
}
/*try{
  fs.unlinkSync(folder+'/'+vmName+'/'+vmName+'vars.tf', function (err) {
    if (err) throw err;
    // if no error, file has been deleted successfully
    console.log('File  vars.tf deleted!');
}); 
}
catch (err) {
  console.error(err)
}



try{
  fs.unlinkSync(folder+'/'+vmName+'/'+vmName+'.auto.tfvars', function (err) {
    if (err) throw err;
    // if no error, file has been deleted successfully
    console.log('File .auto.tfvars deleted!');
}); 
}
catch (err) {
  console.error(err)
}




try{
  fs.unlinkSync(folder+'/'+vmName+'/'+vmName+'.main.tf', function (err) {
    if (err) throw err;
    // if no error, file has been deleted successfully
    console.log('File .main.tf deleted!');
}); 
}
catch (err) {
  console.error(err)
}
*/
try{
  fs.writeFileSync(folder+'/'+vmName+'/'+vmName+'vars.tf',
  'variable "vm_name" { \n'+
   ' description = "VMware vSphere Virtual Machine Name"\n'+
  '}\n'+
  '\n'+
  'variable "vm_cpus" {\n'+
    'description = "Number of vCPUs"\n'+
  '}\n'+
  '\n'+
  'variable "vm_memory" {\n'+
    'description = "Amount of memory assigned to the virtual machine"\n'+
  '}\n'+
  '\n'+
  'variable "vm_domain_name" {\n'+
    'description = "Virtual machine domain name"\n'+
  '}\n'+
  '\n'+
  'variable "vm_ip_address" {\n'+
    'description = "Virtual machine IP address"\n'+
  '}\n'+
  '\n'+
  'variable "vm_default_gateway" {\n'+
    'description = "Virtual machine default gateway"\n'+
  '}\n'+
  '\n'+
  'variable "vm_network_cidr" {\n'+
    'description = "Virtual machine network cidr"\n'+
    'default = 28\n'+
  '}\n'+
  '\n'+
  'variable "vm_dns_server" {\n'+
    'description = "Virtual machine dns server"\n'+
  '}\n'+
  '\n'+
  'variable "vm_folder_name" {\n'+
    'description = "VM installatino folder"\n'+
  '}\n'+
  '\n'+
  'variable "vm_host_password" {\n'+
    'description = "Root password for ssh purpose"\n'+
  '}\n'+
  '\n'+
  'variable "vsphere_user" {\n'+
    'description = "vSphere user"\n'+
  '}\n'+
  ' \n'+
  'variable "vsphere_password" {\n'+
    'description = "vsphere password"\n'+
    'default = "H@touti2018"\n'+
  '}\n'+
  ' \n'+ 
  'variable "vsphere_server" {\n'+
    'description = "vsphere server"\n'+
  '}\n'+
  '\n'+
  'variable "vsphere_datacenter" {\n'+
    'description = "VMware vSphere Datacenter Name"\n'+
  '}\n'+
  '\n'+
  'variable "vsphere_cluster" {\n'+
    'description = "VMware vSphere Computer Cluster Name"\n'+
  '}\n'+
  '\n'+
  'variable "vsphere_datastore" {\n'+
  'description = "VMware vSphere Datastore"\n'+
'}\n'+
'\n'+
'variable "vsphere_template" {\n'+
  'description = "VMware Template"\n'+
'}\n'+
'\n'
  ,'UTF8');
}
catch(err){
  console.error(err)
}

for(var i = 1;i <= nbNet; i++){
  try{fs.appendFileSync(folder+'/'+vmName+'/'+vmName+'vars.tf',
  'variable "vsphere_network'+i+'" {\n'+
    'description = "VMware vSphere Network'+i+' Name"\n'+
  '}\n'+
  '\n'
  ,'UTF8');}

  catch (err){
    console.error(err)
  }}


  try{
    fs.writeFileSync(folder+'/'+vmName+'/'+vmName+'.main.tf',
    
    
    
    
    
    'provider "vsphere" { \n'+
    '  version = "1.10.0" \n'+
    '  user           = "${var.vsphere_user}"\n'+
    '  password       = "${var.vsphere_password}" \n'+
    '  vsphere_server = "${var.vsphere_server}"\n'+
      '\n'+
    ' # If you have a self-signed cert \n'+
    ' allow_unverified_ssl = true \n'+
    '}\n'+
    '\n'+
    'data "vsphere_datacenter" "dc" {\n'+
    '  name = "${var.vsphere_datacenter}"\n'+
    '}\n'+
    '\n'+
    'data "vsphere_datastore" "datastore" {\n'+
    '  name          = "${var.vsphere_datastore}"\n'+
    '  datacenter_id = "${data.vsphere_datacenter.dc.id}"\n'+
    '}\n'+
    '\n'+
    'data "vsphere_compute_cluster" "cluster" {\n'+
    '  name          = "${var.vsphere_cluster}"\n'+
    '  datacenter_id = "${data.vsphere_datacenter.dc.id}"\n'+
    '}\n'+
    'data "vsphere_virtual_machine" "template" {\n'+
    '  name          = "${var.vsphere_template}"\n'+
    '  datacenter_id = "${data.vsphere_datacenter.dc.id}"\n'+
    '}\n'
  
    ,'UTF8');}
    
    catch(err){console.error(err)}

    for(i = 1;i <= nbNet; i++){
      try{fs.appendFileSync(folder+'/'+vmName+'/'+vmName+'.main.tf',
    
      'data "vsphere_network" "network'+i+'" {\n'+
      '  name          = "${var.vsphere_network'+i+'}"\n'+
      '  datacenter_id = "${data.vsphere_datacenter.dc.id}"\n'+
      '}\n'
   
      ,'utf8');
    
      }
      catch(err){
        console.error(err)
      }
    }


    try{fs.appendFileSync(folder+'/'+vmName+'/'+vmName+'.main.tf',



'resource "vsphere_virtual_machine" "'+vmName+'" {  \n'+
'  name             = "${var.vm_name}"\n'+
'  folder           = "${var.vm_folder_name}"\n'+
'  num_cpus         = "${var.vm_cpus}"\n'+
'  memory           = "${var.vm_memory}"\n'+
'  resource_pool_id = "${data.vsphere_compute_cluster.cluster.resource_pool_id}"\n'+
'  datastore_id     = "${data.vsphere_datastore.datastore.id}"\n'+
'  \n'+
'  guest_id         = "${data.vsphere_virtual_machine.template.guest_id}"\n'+
'  scsi_type        = "${data.vsphere_virtual_machine.template.scsi_type}"\n'+
'network_interface {\n'+
'  network_id   = "${data.vsphere_network.network1.id}"\n'+
'  adapter_type = "${data.vsphere_virtual_machine.template.network_interface_types[0]}"\n'+
'}\n'

,'utf8');

}
catch(err){
console.error(err)
}



if(nbNet>=2){
for(i=2;i<=nbNet;i++){
try{
fs.appendFileSync(folder+'/'+vmName+'/'+vmName+'.main.tf',


'network_interface {\n'+
'  network_id   = "${data.vsphere_network.network'+i+'.id}"\n'+
'  adapter_type = "vmxnet3"\n'+
'}\n'

,'UTF8');

}
catch(err){
console.error(err)
}}}



try{

fs.appendFileSync(folder+'/'+vmName+'/'+vmName+'.main.tf',


'disk {\n'+
'  label            = "disk0"\n'+
'  size             = "10"\n'+
'  eagerly_scrub    = "${data.vsphere_virtual_machine.template.disks.0.eagerly_scrub}"\n'+
'  thin_provisioned = "${data.vsphere_virtual_machine.template.disks.0.thin_provisioned}"\n'+
'}\n'

,'UTF8');

}
catch(err){console.error(err)}

/*
try{
let p=1;
for(let d of disks){
if(d.persistent==true)
{
fs.appendFileSync(folder+'/'+vmName+'/'+vmName+'.main.tf','**not ready yet** \n','UTF8');
}
else{
fs.appendFileSync(folder+'/'+vmName+'/'+vmName+'.main.tf',

'disk {\n'+
'label	     = "disk'+p+'"\n'+
'size             ='+d.size+' \n'+
'unit_number      = '+p+'\n'+
'thin_provisioned = true\n'+
'}\n'

,'UTF8');
}
p++;
}}
catch(err){console.error(err)}
*/

try{
fs.appendFileSync(folder+'/'+vmName+'/'+vmName+'.main.tf',

'clone {\n'+
'template_uuid = "${data.vsphere_virtual_machine.template.id}"\n'+
'\n'+
'customize {\n'+
'linux_options {\n'+
'host_name = "${var.vm_name}"\n'+
'domain    = "${var.vm_domain_name}"\n'+
'}\n'+
'\n'+
'network_interface {\n'+
'ipv4_address = "${var.vm_ip_address}"\n'+
'ipv4_netmask = "${var.vm_network_cidr}"\n'+
'}\n'+
/*'network_interface {}\n'+*/
'\n'+
'dns_server_list = ["${var.vm_dns_server}"]\n'+
'ipv4_gateway = "${var.vm_default_gateway}"\n'+
'}\n'+
'}\n'+
'}\n'+
'\n'

,'utf8')
}
catch(err){
console.error(err)
}


try{
let ip=req.body['ip1'];
let cidr=req.body['cidr1'];
let vlan1= doc.network.vlan;
let sp= ds.split("|");
console.log(sp)
fs.writeFileSync(folder+'/'+vmName+'/'+vmName+'.auto.tfvars',

'vm_name                      = "'+ vmName +'"\n'+
'vm_cpus                      = "'+ cpus +'"\n'+
'vm_memory                    = "'+ram *1024 +'"\n'+
'vm_domain_name               = "'+ dn +'"\n'+
'vm_ip_address                = "'+ ip +'"\n'+
'vm_network_cidr              = "'+ cidr+'"\n'+
'vm_default_gateway           = "'+ gw +'"\n'+
'vm_dns_server                = "'+ dns  +'"\n'+
'vm_folder_name               = "'+ folder +'"\n'+
'vm_host_password             = "'+ vmpass +'"\n'+
'vsphere_server               = "'+ cloud.adress +'"\n'+
'vsphere_user                 = "'+ cloud.user +'"\n'+
'vsphere_password             = "'+ cloud.password +'"\n'+
'vsphere_datacenter           = "'+ dcenter +'"\n'+
'vsphere_cluster              = "'+ cluster +'"\n'+
'vsphere_datastore            = "'+ sp[0] +'"\n'+
'vsphere_network1              = "VMNet_Vlan-'+vlan1+'"\n'+
'vsphere_template             = "templates/'+osDetail +'"\n'


,'utf8')


}
catch(err){console.error(err)}
console.log("filesUpdated")
//const terrapathadj= await run_1.run(ps,`cd..`);
const pathvm= folder+'/'+vmName
const terrapath= await run_1.run(ps,`cd ${pathvm} `);
console.log(pathvm)
console.log("planning")
const terra= await run_1.run(ps,`dir `);
console.log(terra)
const terrafplan = await run_1.run(ps,`Terraform plan -out=updTest`);
console.log(terrafplan)
const terrafapp = await run_1.run(ps,`Terraform apply updTest `);
console.log(terrafapp)

    /////end config
    res.send('updated')
      }).catch(err=>{
        res.setHeader('Status', 500)
        res.json(err);
      }) 
  } else {
    res.sendStatus(403) // Forbidden
   }
})

////////


///



router.get('/getVMs',async function (req,res) {
  if  (req.isAuthenticated() && ((req.user.isAdmin())||req.user.isSuper())){
    vm.find({})
    .populate('disk')
    .populate('cloud')
    .populate('osType')
    .populate('os')
    .exec(function (err, data) {
      if (err) return console.error(err);
      res.render('template/listVm',{data : data})
      
    });
   } else {
     res.sendStatus(403) // Forbidden
    }
});

router.get('/getMyVms', async function (req, res, next) {
    if (req.isAuthenticated() ){
     vm.find({user : req.user._id})
     .populate('disk')
     .populate('osType')
     .populate('os')
     .exec(function (err, data) {
       if (err) return console.log(err);
       res.render('template/listVm',{data : data})
       
     });
    } else {
      res.sendStatus(403) // Forbidden
     }
  
  });




  router.get('/getUserVms/:id', async function (req, res, next) {
  if (req.isAuthenticated() && ((req.user.isAdmin())||req.user.isSuper())){
     vm.find({user : req.params.id})
     .populate('disk')
    //  .populate('dc')
     .populate('osType')
     .populate('os')
     .exec(function (err, data) {
       if (err) return handleError(err);
       res.render('template/listVm',{data : data})
      //  res.send({data})
     });
    } else {
      res.sendStatus(403) // Forbidden
     }
  
  });









  router.get('/updateVm/:id', function (req, res, next) {
    if (req.isAuthenticated()){
        vm.findById(req.params.id).populate('disk')
        .populate('cloud')
        .populate('osType')
        .populate('os')
        .exec(function (err, data) {
          if (err) return handleError(err);
          console.log(data);
          res.render('template/addVM',{data : data})
          
        });
    } else {
      res.sendStatus(403) // Forbidden
     }
  
  });
  router.get('/userAddVm',  function (req, res, next) {
    console.log('im here')
    if (req.isAuthenticated()&& req.user.isActivated()){
      
      osType.find({}).then((data) => {
        User.findById(req.user._id).populate('iprange').exec((err,doc)=>{
          if(err) return handleError(err)
          let arr,arf=[];
          arr=doc.iprange;
          arf =arr.filter(e=>e.available==true )
          console.log(arr)
          if(arr.length == 0){
            res.send('no more available ips')
          }else{
            res.send(arf[0].ip)

          }
        })
          console.log(data)
          //res.render('template/addVM', { osType: data }); bch yakhtar OStype w OSname
       // res.send('userAddVm');
      }).catch(err => {
  
      })
    } else {
      res.sendStatus(403) // Forbidden
     }
  
  });

  router.post('/userAddvm', function (req,res) {
     if (req.isAuthenticated() && req.user.isActivated() ){
    let obj = [];
    for (var i = 1; i <= req.body.selectList; i++){
    let disk='disk'+i;
    let ndisk=null;
    let per = false;
    console.log(req.body[disk])
    
  if(req.body['pdisk' + i]=='on'){
    ndisk =req.body['namepdisk'+i];
    per= true;
    }
    let dsk = new diskModel({
        name : ndisk,
        size : req.body[disk],
        persistent : per
    });
    dsk.save();
    obj.push(dsk._id);
    }
    console.log(obj);
    let net = {
       "ip" : req.body['ip1'],
       "vlan" :req.body['vlan1'] ,
       "cidr" :req.body['cidr1'] ,
       "numberOfNetworks" : req.body.selectListnet
    }
    User.findById(req.user._id).then( us=>{
    osType.findOne({type : req.body.selectListOS}).then(osT=>{
        osName.findOne({name : req.body.detailListOS}).then(osN=>{
            c.findOne({name : us.cloud}).then(async cloud=>{
              const ps = new node_powershell_1.default({
                executionPolicy: 'Bypass',
                noProfile: true,})
                let nvm= new vm({
                  "name" : req.body.vmname,
                  'cloud' :cloud._id,
                  "cpus": req.body.cpus,
                  "cluster" :us.cluster,
                  "dc": us.dc,
                  "ds": us.ds,
                  "disk" :obj,
                  "network" :{
                    "ip" : req.body.ip,
                    "vlan" : us.vlan,
                    "cidr" :us.cidr,
                    "numberOfNetworks" :req.body.selectListnet
                  },
                  "memory" :req.body.ram,
                  "vmpw":req.body.vmpw,
                  "dn" :us.dn,
                  "dns": us.dns,
                  "gw" : us.gw,
                  "projectFolder" : us.email,
                  "osType" : osT._id,
                  "os" : osN._id,
                  "user" : req.user._id
                })
                    vm.create(nvm);
                    res.send({nvm})
                    let Object = {
                      "available" : false
                    };
                    ipModel.updateOne({ip :req.body.ip},Object,err=>{
                      if (err)
                      console.log(err)
                    })
                    

                    var nbDisks      = req.body.selectList;
                    var vmName       = req.body.vmname;
                    var folder       = us.email;
                    var nbNet        = req.body.selectListnet;
                    var os           = req.body.selectListOS;
                    var osDetail     = req.body.detailListOS;
                    var cluster      = us.cluster;
                    var ds           = us.ds;
                    var cpus         = req.body.cpus;
                    var ram          = req.body.ram;
                    var dn           = us.dn;
                    var gw           = us.gw;
                    var dns          = us.dns;
                    var vmpass       = req.body.vmpw;
                    var dcenter      = us.dc;
                    let URL = cloud.adress;
                    let username = cloud.user ;
                    let password = cloud.password;
                    const port = 443;
                    console.log(!fs.existsSync(folder))
                    let slp= ds.split("|");
                    if (!fs.existsSync(folder)){
                      console.log('Disabling SSL Cert Test');
                            const disableAuth = await run_1.run(ps, 'Set-PowerCLIConfiguration -InvalidCertificateAction Ignore -Confirm:$false');
                            console.log(`Disabling Auth Done: ${disableAuth}`);
                            console.log('Login into vCenter');
                            const test = await run_1.run(ps, `Connect-VIServer -Server ${URL} -Port ${port}  -Protocol https -Username ${username} -Password ${password}`);
                            console.log(test);
                            const CrFolder = await run_1.run(ps, `New-Folder -Name ${folder} -Location (Get-Datacenter -Name ${dcenter} | Get-Folder -Name VM)`);
                            console.log(CrFolder);   
                            console.log('here and here')       
                      }

                 try { 
                      if (!fs.existsSync('Persistent')){
                        fs.mkdirSync('Persistent')
                      }
                    } catch (err) {
                      console.error(err)
                    }
                    try { 
                      if (!fs.existsSync('Persistent/'+folder)){
                        fs.mkdirSync('Persistent/'+folder)
                      }
                    } catch (err) {
                      console.error(err)
                    }
                    try { 
                      if (!fs.existsSync('Persistent/'+folder+'/'+vmName)){
                        fs.mkdirSync('Persistent/'+folder+'/'+vmName)
                      }
                    } catch (err) {
                      console.error(err)
                    }
                    

                    for (var i = 1; i <= nbDisks; i++){
                      let disk='disk'+i;
                      let ndisk=req.body['namepdisk'+i];
                      console.log(req.body[disk])
                    if(req.body['pdisk' + i]=='on'){try{ 
                      fs.appendFileSync('Persistent/'+folder+'/'+vmName+'/'+ndisk,'resource "vsphere_virtual_disk" '+ndisk+'" { \n'+
                         ' size         ='+req.body[disk] +'  \n'+
                         'vmdk_path    = "${var.extra_vmdk_name}"\n'+
                         'datacenter   = "${var.datacenter}"\n'+
                         'datastore    = "${var.datastore}"\n'+
                         'type         = "thin"\n'+
                        'adapter_type = "lsiLogic"\n'+
                        '}\n'+
                        '\n'
                        ,'UTF8')}
                      catch(err){
                        
                          console.log('hahaha');
                      };
                    }
                  }

                  try { 
                    if (!fs.existsSync(folder)){
                      fs.mkdirSync(folder)
                    }
                  } catch (err) {
                    console.error(err)
                  }
                  try { 
                    if (!fs.existsSync(folder+'/'+vmName)){
                      fs.mkdirSync(folder+'/'+vmName)
                    }
                  } catch (err) {
                    console.error(err)
                  }


                  

                  try{ 
                    fs.appendFileSync(folder+'/'+vmName+'/'+vmName+'vars.tf',
                    'variable "vm_name" { \n'+
                     ' description = "VMware vSphere Virtual Machine Name"\n'+
                    '}\n'+
                    '\n'+
                    'variable "vm_cpus" {\n'+
                      'description = "Number of vCPUs"\n'+
                    '}\n'+
                    '\n'+
                    'variable "vm_memory" {\n'+
                      'description = "Amount of memory assigned to the virtual machine"\n'+
                    '}\n'+
                    '\n'+
                    'variable "vm_domain_name" {\n'+
                      'description = "Virtual machine domain name"\n'+
                    '}\n'+
                    '\n'+
                    'variable "vm_ip_address" {\n'+
                      'description = "Virtual machine IP address"\n'+
                    '}\n'+
                    '\n'+
                    'variable "vm_default_gateway" {\n'+
                      'description = "Virtual machine default gateway"\n'+
                    '}\n'+
                    '\n'+
                    'variable "vm_network_cidr" {\n'+
                      'description = "Virtual machine network cidr"\n'+
                      'default = 28\n'+
                    '}\n'+
                    '\n'+
                    'variable "vm_dns_server" {\n'+
                      'description = "Virtual machine dns server"\n'+
                    '}\n'+
                    '\n'+
                    'variable "vm_folder_name" {\n'+
                      'description = "VM installatino folder"\n'+
                    '}\n'+
                    '\n'+
                    'variable "vm_host_password" {\n'+
                      'description = "Root password for ssh purpose"\n'+
                    '}\n'+
                    '\n'+
                    'variable "vsphere_user" {\n'+
                      'description = "vSphere user"\n'+
                    '}\n'+
                    ' \n'+
                    'variable "vsphere_password" {\n'+
                      'description = "vsphere password"\n'+
                      'default = "H@touti2018"\n'+
                    '}\n'+
                    ' \n'+ 
                    'variable "vsphere_server" {\n'+
                      'description = "vsphere server"\n'+
                    '}\n'+
                    '\n'+
                    'variable "vsphere_datacenter" {\n'+
                      'description = "VMware vSphere Datacenter Name"\n'+
                    '}\n'+
                    '\n'+
                    'variable "vsphere_cluster" {\n'+
                      'description = "VMware vSphere Computer Cluster Name"\n'+
                    '}\n'+
                    '\n'+
                    'variable "vsphere_datastore" {\n'+
                    'description = "VMware vSphere Datastore"\n'+
                  '}\n'+
                  '\n'+
                  'variable "vsphere_template" {\n'+
                    'description = "VMware Template"\n'+
                  '}\n'+
                  '\n'
                    ,'UTF8');
                  }
                  catch(err){
                    console.error(err)
                  }

                  for(i = 1;i <= nbNet; i++){
                    try{ fs.appendFileSync(folder+'/'+vmName+'/'+vmName+'vars.tf',
                    'variable "vsphere_network'+i+'" {\n'+
                      'description = "VMware vSphere Network'+i+' Name"\n'+
                    '}\n'+
                    '\n'
                    ,'UTF8');}

                    catch (err){
                      console.error(err)
                    }}


                    try{
                      fs.appendFileSync(folder+'/'+vmName+'/'+vmName+'.main.tf',
                      
                      
                      
                      
                      
                      'provider "vsphere" { \n'+
                      '  version = "1.10.0" \n'+
                      '  user           = "${var.vsphere_user}"\n'+
                      '  password       = "${var.vsphere_password}" \n'+
                      '  vsphere_server = "${var.vsphere_server}"\n'+
                        '\n'+
                      ' # If you have a self-signed cert \n'+
                      ' allow_unverified_ssl = true \n'+
                      '}\n'+
                      '\n'+
                      'data "vsphere_datacenter" "dc" {\n'+
                      '  name = "${var.vsphere_datacenter}"\n'+
                      '}\n'+
                      '\n'+
                      'data "vsphere_datastore" "datastore" {\n'+
                      '  name          = "${var.vsphere_datastore}"\n'+
                      '  datacenter_id = "${data.vsphere_datacenter.dc.id}"\n'+
                      '}\n'+
                      '\n'+
                      'data "vsphere_compute_cluster" "cluster" {\n'+
                      '  name          = "${var.vsphere_cluster}"\n'+
                      '  datacenter_id = "${data.vsphere_datacenter.dc.id}"\n'+
                      '}\n'+
                      'data "vsphere_virtual_machine" "template" {\n'+
                      '  name          = "${var.vsphere_template}"\n'+
                      '  datacenter_id = "${data.vsphere_datacenter.dc.id}"\n'+
                      '}\n'
                    
                      ,'UTF8');}
                      
                      catch(err){console.error(err)}

                      for(i = 1;i <= nbNet; i++){
                        try{ fs.appendFileSync(folder+'/'+vmName+'/'+vmName+'.main.tf',
                      
                        'data "vsphere_network" "network'+i+'" {\n'+
                        '  name          = "${var.vsphere_network'+i+'}"\n'+
                        '  datacenter_id = "${data.vsphere_datacenter.dc.id}"\n'+
                        '}\n'
                     
                        ,'utf8');
                      
                        }
                        catch(err){
                          console.error(err)
                        }
                      }


                      try{ fs.appendFileSync(folder+'/'+vmName+'/'+vmName+'.main.tf',
  
/*'resource "vsphere_folder" "folder" { \n'+
'path          = "'+folder+'"\n'+
'type          = "vm"\n'+
'datacenter_id = "${data.vsphere_datacenter.dc.id}"\n'+
'}\n'+ */
'resource "vsphere_virtual_machine" "'+vmName+'" {  \n'+
'  name             = "${var.vm_name}"\n'+
'  folder           = "${var.vm_folder_name}"\n'+
'  num_cpus         = "${var.vm_cpus}"\n'+
'  memory           = "${var.vm_memory}"\n'+
'  resource_pool_id = "${data.vsphere_compute_cluster.cluster.resource_pool_id}"\n'+
'  datastore_id     = "${data.vsphere_datastore.datastore.id}"\n'+
'  \n'+
'  guest_id         = "${data.vsphere_virtual_machine.template.guest_id}"\n'+
'  scsi_type        = "${data.vsphere_virtual_machine.template.scsi_type}"\n'+
'network_interface {\n'+
'  network_id   = "${data.vsphere_network.network1.id}"\n'+
'  adapter_type = "${data.vsphere_virtual_machine.template.network_interface_types[0]}"\n'+
'}\n'

  ,'utf8');

  }
  catch(err){
    console.error(err)
  }



  if(nbNet>=2){
    for(i=2;i<=nbNet;i++){
    try{ 
      fs.appendFileSync(folder+'/'+vmName+'/'+vmName+'.main.tf',
      
      
      'network_interface {\n'+
      '  network_id   = "${data.vsphere_network.network'+i+'.id}"\n'+
      '  adapter_type = "vmxnet3"\n'+
      '}\n'
    
      ,'UTF8');
    
    }
    catch(err){
      console.error(err)
    }}}



    try{

      fs.appendFileSync(folder+'/'+vmName+'/'+vmName+'.main.tf',
      
      
      'disk {\n'+
        '  label            = "disk0"\n'+
        '  size             = "'+req.body["disk"+1]+'"\n'+
        '  eagerly_scrub    = "${data.vsphere_virtual_machine.template.disks.0.eagerly_scrub}"\n'+
        '  thin_provisioned = "${data.vsphere_virtual_machine.template.disks.0.thin_provisioned}"\n'+
      '}\n'
  
      ,'UTF8');
    
    }
    catch(err){console.error(err)}


   /* try{

      for(i=1;i<=nbDisks;i++){
        if(req.body['pdisk' + i]=='on')
        {
          fs.appendFileSync(folder+'/'+vmName+'/'+vmName+'.main.tf','**not ready yet** \n','UTF8');
        }
        else{
          fs.appendFileSync(folder+'/'+vmName+'/'+vmName+'.main.tf',
          
          'disk {\n'+
            'label	     = "disk'+i+'"\n'+
            'size             ='+req.body["disk"+i]+' \n'+
            'unit_number      = '+i+'\n'+
            'thin_provisioned = true\n'+
          '}\n'
    
          ,'UTF8');
        }}}
      catch(err){console.error(err)}  
      */

      try{ 
        fs.appendFileSync(folder+'/'+vmName+'/'+vmName+'.main.tf',
        
        'clone {\n'+
          'template_uuid = "${data.vsphere_virtual_machine.template.id}"\n'+
         '\n'+
          'customize {\n'+
            'linux_options {\n'+
              'host_name = "${var.vm_name}"\n'+
              'domain    = "${var.vm_domain_name}"\n'+
            '}\n'+
        '\n'+
            'network_interface {\n'+
              'ipv4_address = "${var.vm_ip_address}"\n'+
              'ipv4_netmask = "${var.vm_network_cidr}"\n'+
            '}\n'+
         
        '\n'+
            'dns_server_list = ["${var.vm_dns_server}"]\n'+
            'ipv4_gateway = "${var.vm_default_gateway}"\n'+
          '}\n'+
        '}\n'+
        '}\n'
        
        ,'utf8')
        }
        catch(err){
          console.error(err)
        }


        try{ 
          let ip=req.body['ip'];
          let cidr=us.cidr;
          let vlan1= us.vlan;
          let sp= ds.split("|");
          console.log(sp)
        fs.appendFileSync(folder+'/'+vmName+'/'+vmName+'.auto.tfvars',
        
        'vm_name                      = "'+ vmName +'"\n'+
        'vm_cpus                      = "'+ cpus +'"\n'+
        'vm_memory                    = "'+ram *1024 +'"\n'+
        'vm_domain_name               = "'+ dn +'"\n'+
        'vm_ip_address                = "'+ ip +'"\n'+
        'vm_network_cidr              = "'+ cidr+'"\n'+
        'vm_default_gateway           = "'+ gw +'"\n'+
        'vm_dns_server                = "'+ dns  +'"\n'+
        'vm_folder_name               = "'+ folder +'"\n'+
        'vm_host_password             = "'+ vmpass +'"\n'+
        'vsphere_server               = "'+ cloud.adress +'"\n'+
        'vsphere_user                 = "'+ cloud.user +'"\n'+
        'vsphere_password             = "'+ cloud.password +'"\n'+
        'vsphere_datacenter           = "'+ dcenter +'"\n'+
        'vsphere_cluster              = "'+ cluster +'"\n'+
        'vsphere_datastore            = "'+ sp[0] +'"\n'+
        'vsphere_network1              = "VMNet_Vlan-'+vlan1+'"\n'+
        'vsphere_template             = "templates/'+osDetail +'"\n'
        
        
        ,'utf8')
        
        }
        catch(err){console.error(err)}
        
        
       /* if(nbNet>=2){
          for(i=2;i<=nbNet;i++){
          let vlan= req.body['vlan'+i];
          try{
            fs.appendFileSync(folder+'/'+vmName+'/'+vmName+'.auto.tfvars',
            
          'vsphere_network'+i+'           = "VMNet_Vlan-'+vlan +'_"\n'
      
            ,'utf8')
        
          }
          catch(err){console.error(err)}
          }}*/


      
          
              
              const pathvm= folder+'/'+vmName
              const terrapath= await run_1.run(ps,`cd ${pathvm} `);
              console.log(terrapath)
              const terrafin = await run_1.run(ps,`Terraform init `);
              console.log(terrafin)
              const terrafplan = await run_1.run(ps,`Terraform plan -out test `);
              console.log(terrafplan)
              const terrafapp = await run_1.run(ps,`Terraform apply test `);
              console.log(terrafapp)
              
            
       /*   else {
            const pathvm= folder+'/'+vmName
            const terrapath= await run_1.run(ps,`cd ${pathvm} `);
            console.log(terrapath)
            const terrafin = await run_1.run(ps,`Terraform init `);
            console.log(terrafin)
            const terrafplan = await run_1.run(ps,`Terraform plan -out test `);
            console.log(terrafplan)
            const terrafapp = await run_1.run(ps,`Terraform apply test `);
            console.log(terrafapp)
          }
*/
         
        
          
                 
         




















            }).catch(e=>{
                console.log(e)
                console.log('notfound')
            })
           
            

        }).catch(error=>{
            console.log(error)
        })
    }).catch(err=>{
        console.log(err)
    }).catch(er=>
      console.log(er))
    })
    
    //res.redirect('/dataCenter/listDc');
       
} else {
    res.sendStatus(403) // Forbidden
   }

});










   /* if (req.isAuthenticated() && req.user.isActivated() ){
      let obj = [];
      for (var i = 1; i <= req.body.selectList; i++){
      let disk='disk'+i;
      let ndisk=null;
      let per = false;
      console.log(req.body[disk])
      console.log(req.body);
    if(req.body['pdisk' + i]=='on'){
      ndisk =req.body['namepdisk'+i];
      per= true;
      }
      let dsk = new diskModel({
          name : ndisk,
          size : req.body[disk],
          persistent : per
      });
      dsk.save();
      obj.push(dsk._id);
      }
      User.findById(req.user._id).then( doc=>{
       
        c.findOne({name : doc.cloud}).then(cloud=>{
          osType.findOne({type : req.body.selectListOS}).then(osT=>{
            osName.findOne({name : req.body.detailListOS}).then(async   osN=>{
              const ps = new node_powershell_1.default({
                executionPolicy: 'Bypass',
                noProfile: true,})
          let nvm= new vm({
            "name" : req.body.vmname,
            'cloud' :cloud._id,
            "cpus": req.body.cpus,
            "cluster" :doc.cluster,
            "dc": doc.dc,
            "ds": doc.ds,
            "disk" :obj,
            "network" :{
              "ip" : req.body.ip,
              "vlan" : doc.vlan,
              "cidr" :doc.cidr,
              "numberOfNetworks" :req.body.selectListnet
            },
            "memory" :req.body.ram,
            "vmpw":req.body.vmpw,
            "dn" :doc.dn,
            "dns": doc.dns,
            "gw" : doc.gw,
            "projectFolder" : doc.email,
            "osType" : osT._id,
            "os" : osN._id,
            "user" : req.user._id
          })
          nvm.save();
          let Object = {
            "available" : false
          };
          ipModel.updateOne({ip :req.body.ip},Object,err=>{
            if (err)
            console.log(err)
          })
          

        }).catch(error=>{

        })
      }).catch(e=>{

      })
    
        
        
       
      ///// file config

      
      var nbDisks      = req.body.selectList;
      var vmName       = req.body.vmname;
      var folder       = req.user.email;
      var nbNet        = req.body.selectListnet;
      var os           = req.body.selectListOS;
      var osDetail     = req.body.detailListOS;
      var cluster      = doc.cluster;
      var ds           = doc.ds;
      var cpus         = req.body.cpus;
      var ram          = req.body.ram;
      var dn           = doc.dn;
      var gw           = doc.gw;
      var dns          = doc.dns;
      var vmpass       = req.body.vmpw;
      var dcenter      = doc.dc;

      let URL = cloud.adress;
      let username = cloud.user ;
      let password = cloud.password;
      const port = 443;
      console.log(!fs.existsSync(folder))
      let slp= ds.split("|");
      if (!fs.existsSync(folder)){
        console.log('Disabling SSL Cert Test');
              const disableAuth = await run_1.run(ps, 'Set-PowerCLIConfiguration -InvalidCertificateAction Ignore -Confirm:$false');
              console.log(`Disabling Auth Done: ${disableAuth}`);
              console.log('Login into vCenter');
              const test = await run_1.run(ps, `Connect-VIServer -Server ${URL} -Port ${port}  -Protocol https -Username ${username} -Password ${password}`);
              console.log(test);
              const CrFolder = await run_1.run(ps, `New-Folder -Name ${folder} -Location (Get-Datacenter -Name ${dcenter} | Get-Folder -Name VM)`);
              console.log(CrFolder);          
        }
      try {
        if (!fs.existsSync('Persistent')){
          fs.mkdirSync('Persistent')
        }
      } catch (err) {
        console.error(err)
      }
      try {
        if (!fs.existsSync('Persistent/'+folder)){
          fs.mkdirSync('Persistent/'+folder)
        }
      } catch (err) {
        console.error(err)
      }
      try {
        if (!fs.existsSync('Persistent/'+folder+'/'+vmName)){
          fs.mkdirSync('Persistent/'+folder+'/'+vmName)
        }
      } catch (err) {
        console.error(err)
      }
      

      for (var i = 1; i <= nbDisks; i++){
        let disk='disk'+i;
        let ndisk=req.body['namepdisk'+i];
        console.log(req.body[disk])
      if(req.body['pdisk' + i]=='on'){try{
        fs.appendFileSync('Persistent/'+folder+'/'+vmName+'/'+ndisk,'resource "vsphere_virtual_disk" '+ndisk+'" { \n'+
           ' size         ='+req.body[disk] +'  \n'+
           'vmdk_path    = "${var.extra_vmdk_name}"\n'+
           'datacenter   = "${var.datacenter}"\n'+
           'datastore    = "${var.datastore}"\n'+
           'type         = "thin"\n'+
          'adapter_type = "lsiLogic"\n'+
          '}\n'+
          '\n'
          ,'UTF8')}
        catch(err){
          
            console.log('hahaha');
        };
      }
    }

    try {
      if (!fs.existsSync(folder)){
        fs.mkdirSync(folder)
      }
    } catch (err) {
      console.error(err)
    }
    try {
      if (!fs.existsSync(folder+'/'+vmName)){
        fs.mkdirSync(folder+'/'+vmName)
      }
    } catch (err) {
      console.error(err)
    }


    try{
      fs.appendFileSync(folder+'/'+vmName+'/'+vmName+'vars.tf',
      'variable "vm_name" { \n'+
       ' description = "VMware vSphere Virtual Machine Name"\n'+
      '}\n'+
      '\n'+
      'variable "vm_cpus" {\n'+
        'description = "Number of vCPUs"\n'+
      '}\n'+
      '\n'+
      'variable "vm_memory" {\n'+
        'description = "Amount of memory assigned to the virtual machine"\n'+
      '}\n'+
      '\n'+
      'variable "vm_domain_name" {\n'+
        'description = "Virtual machine domain name"\n'+
      '}\n'+
      '\n'+
      'variable "vm_ip_address" {\n'+
        'description = "Virtual machine IP address"\n'+
      '}\n'+
      '\n'+
      'variable "vm_default_gateway" {\n'+
        'description = "Virtual machine default gateway"\n'+
      '}\n'+
      '\n'+
      'variable "vm_network_cidr" {\n'+
        'description = "Virtual machine network cidr"\n'+
        'default = 28\n'+
      '}\n'+
      '\n'+
      'variable "vm_dns_server" {\n'+
        'description = "Virtual machine dns server"\n'+
      '}\n'+
      '\n'+
      'variable "vm_folder_name" {\n'+
        'description = "VM installatino folder"\n'+
      '}\n'+
      '\n'+
      'variable "vm_host_password" {\n'+
        'description = "Root password for ssh purpose"\n'+
      '}\n'+
      '\n'+
      'variable "vsphere_user" {\n'+
        'description = "vSphere user"\n'+
      '}\n'+
      ' \n'+
      'variable "vsphere_password" {\n'+
        'description = "vsphere password"\n'+
        'default = "H@touti2018"\n'+
      '}\n'+
      ' \n'+ 
      'variable "vsphere_server" {\n'+
        'description = "vsphere server"\n'+
      '}\n'+
      '\n'+
      'variable "vsphere_datacenter" {\n'+
        'description = "VMware vSphere Datacenter Name"\n'+
      '}\n'+
      '\n'+
      'variable "vsphere_cluster" {\n'+
        'description = "VMware vSphere Computer Cluster Name"\n'+
      '}\n'+
      '\n'+
      'variable "vsphere_datastore" {\n'+
      'description = "VMware vSphere Datastore"\n'+
    '}\n'+
    '\n'+
    'variable "vsphere_template" {\n'+
      'description = "VMware Template"\n'+
    '}\n'+
    '\n'
      ,'UTF8');
    }
    catch(err){
      console.error(err)
    }

    for(i = 1;i <= nbNet; i++){
      try{fs.appendFileSync(folder+'/'+vmName+'/'+vmName+'vars.tf',
      'variable "vsphere_network'+i+'" {\n'+
        'description = "VMware vSphere Network'+i+' Name"\n'+
      '}\n'+
      '\n'
      ,'UTF8');}

      catch (err){
        console.error(err)
      }}


      try{
        fs.appendFileSync(folder+'/'+vmName+'/'+vmName+'.main.tf',
        
        
        
        
        
        'provider "vsphere" { \n'+
        '  version = "1.10.0" \n'+
        '  user           = "${var.vsphere_user}"\n'+
        '  password       = "${var.vsphere_password}" \n'+
        '  vsphere_server = "${var.vsphere_server}"\n'+
          '\n'+
        ' # If you have a self-signed cert \n'+
        ' allow_unverified_ssl = true \n'+
        '}\n'+
        '\n'+
        'data "vsphere_datacenter" "dc" {\n'+
        '  name = "${var.vsphere_datacenter}"\n'+
        '}\n'+
        '\n'+
        'data "vsphere_datastore" "datastore" {\n'+
        '  name          = "${var.vsphere_datastore}"\n'+
        '  datacenter_id = "${data.vsphere_datacenter.dc.id}"\n'+
        '}\n'+
        '\n'+
        'data "vsphere_compute_cluster" "cluster" {\n'+
        '  name          = "${var.vsphere_cluster}"\n'+
        '  datacenter_id = "${data.vsphere_datacenter.dc.id}"\n'+
        '}\n'+
        'data "vsphere_virtual_machine" "template" {\n'+
        '  name          = "${var.vsphere_template}"\n'+
        '  datacenter_id = "${data.vsphere_datacenter.dc.id}"\n'+
        '}\n'
      
        ,'UTF8');}
        
        catch(err){console.error(err)}

        for(i = 1;i <= nbNet; i++){
          try{fs.appendFileSync(folder+'/'+vmName+'/'+vmName+'.main.tf',
        
          'data "vsphere_network" "network'+i+'" {\n'+
          '  name          = "${var.vsphere_network'+i+'}"\n'+
          '  datacenter_id = "${data.vsphere_datacenter.dc.id}"\n'+
          '}\n'
       
          ,'utf8');
        
          }
          catch(err){
            console.error(err)
          }
        }


        try{fs.appendFileSync(folder+'/'+vmName+'/'+vmName+'.main.tf',



'resource "vsphere_virtual_machine" "'+vmName+'" {  \n'+
'  name             = "${var.vm_name}"\n'+
'  folder           = "${var.vm_folder_name}"\n'+
'  num_cpus         = "${var.vm_cpus}"\n'+
'  memory           = "${var.vm_memory}"\n'+
'  resource_pool_id = "${data.vsphere_compute_cluster.cluster.resource_pool_id}"\n'+
'  datastore_id     = "${data.vsphere_datastore.datastore.id}"\n'+
'  \n'+
'  guest_id         = "${data.vsphere_virtual_machine.template.guest_id}"\n'+
'  scsi_type        = "${data.vsphere_virtual_machine.template.scsi_type}"\n'+
'network_interface {\n'+
'  network_id   = "${data.vsphere_network.network1.id}"\n'+
'  adapter_type = "${data.vsphere_virtual_machine.template.network_interface_types[0]}"\n'+
'}\n'

,'utf8');

}
catch(err){
console.error(err)
}



if(nbNet>=2){
for(i=2;i<=nbNet;i++){
try{
fs.appendFileSync(folder+'/'+vmName+'/'+vmName+'.main.tf',


'network_interface {\n'+
'  network_id   = "${data.vsphere_network.network'+i+'.id}"\n'+
'  adapter_type = "vmxnet3"\n'+
'}\n'

,'UTF8');

}
catch(err){
console.error(err)
}}}



try{

fs.appendFileSync(folder+'/'+vmName+'/'+vmName+'.main.tf',


'disk {\n'+
'  label            = "disk0"\n'+
'  size             = "${data.vsphere_virtual_machine.template.disks.0.size}"\n'+
'  eagerly_scrub    = "${data.vsphere_virtual_machine.template.disks.0.eagerly_scrub}"\n'+
'  thin_provisioned = "${data.vsphere_virtual_machine.template.disks.0.thin_provisioned}"\n'+
'}\n'

,'UTF8');

}
catch(err){console.error(err)}


try{

for(i=1;i<=nbDisks;i++){
if(req.body['pdisk' + i]=='on')
{
fs.appendFileSync(folder+'/'+vmName+'/'+vmName+'.main.tf','**not ready yet** \n','UTF8');
}
else{
fs.appendFileSync(folder+'/'+vmName+'/'+vmName+'.main.tf',

'disk {\n'+
'label	     = "disk'+i+'"\n'+
'size             ='+req.body["disk"+i]+' \n'+
'unit_number      = '+i+'\n'+
'thin_provisioned = true\n'+
'}\n'

,'UTF8');
}}}
catch(err){console.error(err)}

try{
fs.appendFileSync(folder+'/'+vmName+'/'+vmName+'.main.tf',

'clone {\n'+
'template_uuid = "${data.vsphere_virtual_machine.template.id}"\n'+
'\n'+
'customize {\n'+
'linux_options {\n'+
'host_name = "${var.vm_name}"\n'+
'domain    = "${var.vm_domain_name}"\n'+
'}\n'+
'\n'+
'network_interface {\n'+
'ipv4_address = "${var.vm_ip_address}"\n'+
'ipv4_netmask = "${var.vm_network_cidr}"\n'+
'}\n'+
'network_interface {}\n'+
'\n'+
'dns_server_list = ["${var.vm_dns_server}"]\n'+
'ipv4_gateway = "${var.vm_default_gateway}"\n'+
'}\n'+
'}\n'+
'\n'

,'utf8')
}
catch(err){
console.error(err)
}


try{
let ip=req.body['ip'];
let cidr=doc.cidr;
let vlan1= doc.vlan;
let sp= ds.split("|");
console.log(sp)
fs.appendFileSync(folder+'/'+vmName+'/'+vmName+'.auto.tfvars',

'vm_name                      = "'+ vmName +'"\n'+
'vm_cpus                      = "'+ cpus +'"\n'+
'vm_memory                    = "'+ram *1024 +'"\n'+
'vm_domain_name               = "'+ dn +'"\n'+
'vm_ip_address                = "'+ ip +'"\n'+
'vm_network_cidr              = "'+ cidr+'"\n'+
'vm_default_gateway           = "'+ gw +'"\n'+
'vm_dns_server                = "'+ dns  +'"\n'+
'vm_folder_name               = "'+ folder +'"\n'+
'vm_host_password             = "'+ vmpass +'"\n'+
'vsphere_server               = "'+ cloud.adress +'"\n'+
'vsphere_user                 = "'+ cloud.user +'"\n'+
'vsphere_password             = "'+ cloud.password +'"\n'+
'vsphere_datacenter           = "'+ dcenter +'"\n'+
'vsphere_cluster              = "'+ cluster +'"\n'+
'vsphere_datastore            = "'+ sp[0] +'"\n'+
'vsphere_network1              = "VMNet_Vlan-'+vlan1+'"\n'+
'vsphere_template             = "templates/'+osDetail +'"\n'


,'utf8')

}
catch(err){console.error(err)}

}).catch(er=>{

})
  
      /////end config
      const pathvm= folder+'/'+vmName
      const terrapath= await run_1.run(ps,`cd ${pathvm} `);
      console.log(terrapath)
      const terrafin = await run_1.run(ps,`Terraform init `);
      console.log(terrafin)
      const terrafplan = await run_1.run(ps,`Terraform plan -out test `);
      console.log(terrafplan)
      const terrafapp = await run_1.run(ps,`Terraform apply test `);
      console.log(terrafapp)
      res.send('added')
        }).catch(errr=>{}) 
    } else {
      res.sendStatus(403) // Forbidden
     }
  })*/

  /////////////////////////////////////////////////


  router.post('/userUpdatevm/:id',function (req,res) {
    if (req.isAuthenticated() && req.user.isActivated()){
      vm.findOne({_id:req.params.id,user : req.user._id})
      .populate('disk')
      .populate('cloud')
      .populate('osType')
      .populate('os')
      .exec((err,doc)=>{
        if(err) return handleError(err)
        let Object={
          "cpus": req.body.cpus,
          "network" :{
            "ip" : doc.network.ip,
            "vlan" : doc.network.vlan,
            "cidr" :doc.network.cidr,
            "numberOfNetworks" :req.body.selectListnet
          },
          "memory" :req.body.ram,
          "vmpw":req.body.vmpw
        }
        vm.updateOne({_id:req.params.id},Object,err=>{
          if(err){
          console.log(err);
          res.send(err)
        }
      })
      ///// file config
     
      var disks        = doc.disk;
      var vmName       = doc.name;
      var folder       = doc.projectFolder;
      var nbNet        = req.body.selectListnet;
      var os           = doc.osType.type;
      var osDetail     = doc.os.name;
      var cluster      = doc.cluster;
      var ds           = doc.ds;
      var cpus         = req.body.cpus;
      var ram          = req.body.ram;
      var dn           = doc.dn;
      var gw           = doc.gw;
      var dns          = doc.dns;
      var vmpass       = req.body.vmpw;
      var dcenter      = doc.dc;
      var cloud        =doc.cloud;
  try {
    if (!fs.existsSync(folder)){
      fs.mkdirSync(folder)
    }
  } catch (err) {
    console.error(err)
  }
  try {
    if (!fs.existsSync(folder+'/'+vmName)){
      fs.mkdirSync(folder+'/'+vmName)
    }
  } catch (err) {
    console.error(err)
  }
  try{
    fs.unlinkSync(folder+'/'+vmName+'/'+vmName+'vars.tf', function (err) {
      if (err) throw err;
      // if no error, file has been deleted successfully
      console.log('File  vars.tf deleted!');
  }); 
  }
  catch (err) {
    console.error(err)
  }
  
  
  
  try{
    fs.unlinkSync(folder+'/'+vmName+'/'+vmName+'.auto.tfvars', function (err) {
      if (err) throw err;
      // if no error, file has been deleted successfully
      console.log('File .auto.tfvars deleted!');
  }); 
  }
  catch (err) {
    console.error(err)
  }
  
  
  
  
  try{
    fs.unlinkSync(folder+'/'+vmName+'/'+vmName+'.main.tf', function (err) {
      if (err) throw err;
      // if no error, file has been deleted successfully
      console.log('File .main.tf deleted!');
  }); 
  }
  catch (err) {
    console.error(err)
  }
  
  try{
    fs.appendFileSync(folder+'/'+vmName+'/'+vmName+'vars.tf',
    'variable "vm_name" { \n'+
     ' description = "VMware vSphere Virtual Machine Name"\n'+
    '}\n'+
    '\n'+
    'variable "vm_cpus" {\n'+
      'description = "Number of vCPUs"\n'+
    '}\n'+
    '\n'+
    'variable "vm_memory" {\n'+
      'description = "Amount of memory assigned to the virtual machine"\n'+
    '}\n'+
    '\n'+
    'variable "vm_domain_name" {\n'+
      'description = "Virtual machine domain name"\n'+
    '}\n'+
    '\n'+
    'variable "vm_ip_address" {\n'+
      'description = "Virtual machine IP address"\n'+
    '}\n'+
    '\n'+
    'variable "vm_default_gateway" {\n'+
      'description = "Virtual machine default gateway"\n'+
    '}\n'+
    '\n'+
    'variable "vm_network_cidr" {\n'+
      'description = "Virtual machine network cidr"\n'+
      'default = 28\n'+
    '}\n'+
    '\n'+
    'variable "vm_dns_server" {\n'+
      'description = "Virtual machine dns server"\n'+
    '}\n'+
    '\n'+
    'variable "vm_folder_name" {\n'+
      'description = "VM installatino folder"\n'+
    '}\n'+
    '\n'+
    'variable "vm_host_password" {\n'+
      'description = "Root password for ssh purpose"\n'+
    '}\n'+
    '\n'+
    'variable "vsphere_user" {\n'+
      'description = "vSphere user"\n'+
    '}\n'+
    ' \n'+
    'variable "vsphere_password" {\n'+
      'description = "vsphere password"\n'+
      'default = "H@touti2018"\n'+
    '}\n'+
    ' \n'+ 
    'variable "vsphere_server" {\n'+
      'description = "vsphere server"\n'+
    '}\n'+
    '\n'+
    'variable "vsphere_datacenter" {\n'+
      'description = "VMware vSphere Datacenter Name"\n'+
    '}\n'+
    '\n'+
    'variable "vsphere_cluster" {\n'+
      'description = "VMware vSphere Computer Cluster Name"\n'+
    '}\n'+
    '\n'+
    'variable "vsphere_datastore" {\n'+
    'description = "VMware vSphere Datastore"\n'+
  '}\n'+
  '\n'+
  'variable "vsphere_template" {\n'+
    'description = "VMware Template"\n'+
  '}\n'+
  '\n'
    ,'UTF8');
  }
  catch(err){
    console.error(err)
  }
  
  for(var i = 1;i <= nbNet; i++){
    try{fs.appendFileSync(folder+'/'+vmName+'/'+vmName+'vars.tf',
    'variable "vsphere_network'+i+'" {\n'+
      'description = "VMware vSphere Network'+i+' Name"\n'+
    '}\n'+
    '\n'
    ,'UTF8');}
  
    catch (err){
      console.error(err)
    }}
  
  
    try{
      fs.appendFileSync(folder+'/'+vmName+'/'+vmName+'.main.tf',
      
      
      
      
      
      'provider "vsphere" { \n'+
      '  version = "1.10.0" \n'+
      '  user           = "${var.vsphere_user}"\n'+
      '  password       = "${var.vsphere_password}" \n'+
      '  vsphere_server = "${var.vsphere_server}"\n'+
        '\n'+
      ' # If you have a self-signed cert \n'+
      ' allow_unverified_ssl = true \n'+
      '}\n'+
      '\n'+
      'data "vsphere_datacenter" "dc" {\n'+
      '  name = "${var.vsphere_datacenter}"\n'+
      '}\n'+
      '\n'+
      'data "vsphere_datastore" "datastore" {\n'+
      '  name          = "${var.vsphere_datastore}"\n'+
      '  datacenter_id = "${data.vsphere_datacenter.dc.id}"\n'+
      '}\n'+
      '\n'+
      'data "vsphere_compute_cluster" "cluster" {\n'+
      '  name          = "${var.vsphere_cluster}"\n'+
      '  datacenter_id = "${data.vsphere_datacenter.dc.id}"\n'+
      '}\n'+
      'data "vsphere_virtual_machine" "template" {\n'+
      '  name          = "${var.vsphere_template}"\n'+
      '  datacenter_id = "${data.vsphere_datacenter.dc.id}"\n'+
      '}\n'
    
      ,'UTF8');}
      
      catch(err){console.error(err)}
  
      for(i = 1;i <= nbNet; i++){
        try{fs.appendFileSync(folder+'/'+vmName+'/'+vmName+'.main.tf',
      
        'data "vsphere_network" "network'+i+'" {\n'+
        '  name          = "${var.vsphere_network'+i+'}"\n'+
        '  datacenter_id = "${data.vsphere_datacenter.dc.id}"\n'+
        '}\n'
     
        ,'utf8');
      
        }
        catch(err){
          console.error(err)
        }
      }
  
  
      try{fs.appendFileSync(folder+'/'+vmName+'/'+vmName+'.main.tf',
  
  
  
  'resource "vsphere_virtual_machine" "'+vmName+'" {  \n'+
  '  name             = "${var.vm_name}"\n'+
  '  folder           = "${var.vm_folder_name}"\n'+
  '  num_cpus         = "${var.vm_cpus}"\n'+
  '  memory           = "${var.vm_memory}"\n'+
  '  resource_pool_id = "${data.vsphere_compute_cluster.cluster.resource_pool_id}"\n'+
  '  datastore_id     = "${data.vsphere_datastore.datastore.id}"\n'+
  '  \n'+
  '  guest_id         = "${data.vsphere_virtual_machine.template.guest_id}"\n'+
  '  scsi_type        = "${data.vsphere_virtual_machine.template.scsi_type}"\n'+
  'network_interface {\n'+
  '  network_id   = "${data.vsphere_network.network1.id}"\n'+
  '  adapter_type = "${data.vsphere_virtual_machine.template.network_interface_types[0]}"\n'+
  '}\n'
  
  ,'utf8');
  
  }
  catch(err){
  console.error(err)
  }
  
  
  
  if(nbNet>=2){
  for(i=2;i<=nbNet;i++){
  try{
  fs.appendFileSync(folder+'/'+vmName+'/'+vmName+'.main.tf',
  
  
  'network_interface {\n'+
  '  network_id   = "${data.vsphere_network.network'+i+'.id}"\n'+
  '  adapter_type = "vmxnet3"\n'+
  '}\n'
  
  ,'UTF8');
  
  }
  catch(err){
  console.error(err)
  }}}
  
  
  
  try{
  
  fs.appendFileSync(folder+'/'+vmName+'/'+vmName+'.main.tf',
  
  
  'disk {\n'+
  '  label            = "disk0"\n'+
  '  size             = "${data.vsphere_virtual_machine.template.disks.0.size}"\n'+
  '  eagerly_scrub    = "${data.vsphere_virtual_machine.template.disks.0.eagerly_scrub}"\n'+
  '  thin_provisioned = "${data.vsphere_virtual_machine.template.disks.0.thin_provisioned}"\n'+
  '}\n'
  
  ,'UTF8');
  
  }
  catch(err){console.error(err)}
  
  
  try{
  let p=1;
  for(let d of disks){
  if(d.persistent==true)
  {
  fs.appendFileSync(folder+'/'+vmName+'/'+vmName+'.main.tf','**not ready yet** \n','UTF8');
  }
  else{
  fs.appendFileSync(folder+'/'+vmName+'/'+vmName+'.main.tf',
  
  'disk {\n'+
  'label	     = "disk'+p+'"\n'+
  'size             ='+d.size+' \n'+
  'unit_number      = '+p+'\n'+
  'thin_provisioned = true\n'+
  '}\n'
  
  ,'UTF8');
  }
  p++;
  }}
  catch(err){console.error(err)}
  
  try{
  fs.appendFileSync(folder+'/'+vmName+'/'+vmName+'.main.tf',
  
  'clone {\n'+
  'template_uuid = "${data.vsphere_virtual_machine.template.id}"\n'+
  '\n'+
  'customize {\n'+
  'linux_options {\n'+
  'host_name = "${var.vm_name}"\n'+
  'domain    = "${var.vm_domain_name}"\n'+
  '}\n'+
  '\n'+
  'network_interface {\n'+
  'ipv4_address = "${var.vm_ip_address}"\n'+
  'ipv4_netmask = "${var.vm_network_cidr}"\n'+
  '}\n'+
  'network_interface {}\n'+
  '\n'+
  'dns_server_list = ["${var.vm_dns_server}"]\n'+
  'ipv4_gateway = "${var.vm_default_gateway}"\n'+
  '}\n'+
  '}\n'+
  '\n'
  
  ,'utf8')
  }
  catch(err){
  console.error(err)
  }
  
  
  try{
  let ip=req.body['ip1'];
  let cidr=req.body['cidr1'];
  let vlan1= doc.network.vlan;
  let sp= ds.split("|");
  console.log(sp)
  fs.appendFileSync(folder+'/'+vmName+'/'+vmName+'.auto.tfvars',
  
  'vm_name                      = "'+ vmName +'"\n'+
  'vm_cpus                      = "'+ cpus +'"\n'+
  'vm_memory                    = "'+ram *1024 +'"\n'+
  'vm_domain_name               = "'+ dn +'"\n'+
  'vm_ip_address                = "'+ ip +'"\n'+
  'vm_network_cidr              = "'+ cidr+'"\n'+
  'vm_default_gateway           = "'+ gw +'"\n'+
  'vm_dns_server                = "'+ dns  +'"\n'+
  'vm_folder_name               = "'+ folder +'"\n'+
  'vm_host_password             = "'+ vmpass +'"\n'+
  'vsphere_server               = "'+ cloud.adress +'"\n'+
  'vsphere_user                 = "'+ cloud.user +'"\n'+
  'vsphere_password             = "'+ cloud.password +'"\n'+
  'vsphere_datacenter           = "'+ dcenter +'"\n'+
  'vsphere_cluster              = "'+ cluster +'"\n'+
  'vsphere_datastore            = "'+ sp[0] +'"\n'+
  'vsphere_network1              = "VMNet_Vlan-'+vlan1+'"\n'+
  'vsphere_template             = "templates/'+osDetail +'"\n'
  
  
  ,'utf8')
  
  }
  catch(err){console.error(err)}
  
      /////end config
      res.send('updated')
        }) 
    } else {
      res.sendStatus(403) // Forbidden
     }
  })

  router.get('/AdminDelVm/:id', function (req, res, next) {
    
      if (req.isAuthenticated() && ((req.user.isAdmin())||(req.user.isSuper()))){

        let folder
        let vmName
        vm.findById(req.params.id).then(data =>{
         folder=data.projectFolder 
         vmName=data.name
        }).catch((err) => {
          res.setHeader('Status', 500)
          res.json(err);
      })
    
        vm.deleteOne({ _id: req.params.id }).then( async doc => {
          const ps = new node_powershell_1.default({
            executionPolicy: 'Bypass',
            noProfile: true,})
            const pathvm= folder+'/'+vmName
            const terrapath= await run_1.run(ps,`cd ${pathvm} `);
            console.log(pathvm)
            console.log("planning")
            //const terra= await run_1.run(ps,`dir `);
            //console.log(terra)
            const terraDest = await run_1.run(ps,`Terraform destroy -force `);
            console.log(terraDest)
            
            res.redirect('/vms/getVMs');
        }).catch((err) => {
            res.setHeader('Status', 500)
            res.json(err);
        })
    } else {
        res.sendStatus(403) // Forbidden
       }
    });
    router.get('/UserDelVm/:id', function (req, res, next) {
    
      if (req.isAuthenticated()){

        let folder
        let vmName
        vm.findById(req.params.id).then(data =>{
         folder=data.projectFolder 
         vmName=data.name
        }).catch((err) => {
          res.setHeader('Status', 500)
          res.json(err);
      })
    
        vm.deleteOne({ _id: req.params.id }).then( async doc => {
          const ps = new node_powershell_1.default({
            executionPolicy: 'Bypass',
            noProfile: true,})
            const pathvm= folder+'/'+vmName
            const terrapath= await run_1.run(ps,`cd ${pathvm} `);
            console.log(pathvm)
            console.log("planning")
            const terra= await run_1.run(ps,`dir `);
            console.log(terra)
            const terraDest = await run_1.run(ps,`Terraform destroy -force `);
            console.log(terraDest)
            
            res.redirect('/vms/getVMs');
        }).catch((err) => {
            res.setHeader('Status', 500)
            res.json(err);
        })
    } else {
        res.sendStatus(403) // Forbidden
       }
    });


  ///////////////////////////////////////////////
module.exports = router;