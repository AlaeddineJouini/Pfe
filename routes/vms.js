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
const dataStorage = require('../models/dataStorage');
var fs = require('fs');

router.get('/addVm', async function (req, res, next) {
    console.log('im here')
    if (req.isAuthenticated()&& req.user.isVerified()){
      let d;
      await c.find({}).then(data => {
          d = data;
      }).catch(err => {
  
      });
      osType.find({}).then((data) => {
          console.log(data)
          res.render('test', { osType: data, c: d });
      }).catch(err => {
  
      })
    } else {
      res.sendStatus(403) // Forbidden
     }
  
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

router.post('/addVm', function (req, res, next) {
    if (req.isAuthenticated()&& req.user.isVerified()){
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
            c.findOne({name : req.body.selectListDC}).then(d=>{
                let Object = {
                    "name": req.body.vmname,
                    "dc": d._id,
                    "cpus": req.body.cpus,
                    "cluster": req.body.Cluster,
                    "ds": req.body.DS,
                    "disk": obj,
                    "network" : net,
                    "memory":req.body.ram,
                    "user" : req.user._id,
                    "dn" :req.body.dn ,
                    "gw" : req.body.gw,
                    "dns" :req.body.dns ,
                    "vmpw" :req.body.vmpw ,
                    "projectFolder" :req.user.pseudo ,
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
        'vsphere_server               = "'+ d.adress +'"\n'+
        'vsphere_user                 = "'+ d.user +'"\n'+
        'vsphere_datacenter           = "'+ dcenter +'"\n'+
        'vsphere_cluster              = "'+ cluster +'"\n'+
        'vsphere_datastore            = "'+ sp[0] +'"\n'+
        'vsphere_network1              = "VMNet_Vlan-'+vlan1+'"\n'+
        'vsphere_template             = "templates/'+osDetail +'"\n'
        
        
        ,'utf8')
        
        }
        catch(err){console.error(err)}
        
        
        if(nbNet>=2){
          for(i=2;i<=nbNet;i++){
          let vlan= req.body['vlan'+i];
          try{
            fs.appendFileSync(folder+'/'+vmName+'/'+vmName+'.auto.tfvars',
            
          'vsphere_network'+i+'           = "VMNet_Vlan-'+vlan +'_"\n'
      
            ,'utf8')
        
          }
          catch(err){console.error(err)}
          }}




                  





















            }).catch(e=>{
                console.log(e)
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
router.get('/getMyVms', async function (req, res, next) {
    if (req.isAuthenticated()){
     vm.find({user : req.user._id})
     .populate('disk')
     .populate('dc')
     .populate('osType')
     .populate('os')
     .exec(function (err, data) {
       if (err) return handleError(err);
       res.render('listVm',{data : data})
       
     });
    } else {
      res.sendStatus(403) // Forbidden
     }
  
  });
  router.get('/updateVm/:id', function (req, res, next) {
    if (req.isAuthenticated()){
        vm.findById(req.params.id).populate('disk')
        .populate('dc')
        .populate('osType')
        .populate('os')
        .exec(function (err, data) {
          if (err) return handleError(err);
          res.render('test',{data : data})
          
        });
    } else {
      res.sendStatus(403) // Forbidden
     }
  
  });
module.exports = router;