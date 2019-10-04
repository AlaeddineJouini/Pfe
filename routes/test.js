var express = require('express');
var router = express.Router();
const parser = require('body-parser');
const mongoose = require('mongoose');
const osType = require('../models/operatingSystemType');
const osName = require('../models/operatingSystem');
const dc = require('../models/Cloud');
const cluster = require('../models/cluster');
const dataStorage = require('../models/dataStorage');
var fs = require('fs');

router.get('/', async function (req, res, next) {
  if (req.isAuthenticated()){
    let d;
    await dc.find({}).then(data => {
        d = data;
    }).catch(err => {

    });
    osType.find({}).then((data) => {
        console.log(data)
        res.render('test', { osType: data, dc: d });
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

router.post('/getClDs',function (req, res, next) {
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
    
});

router.post('/', function (req, res, next) {
  if (req.isAuthenticated()){

    var nbDisks      = req.body.selectList;
    var os           = req.body.selectListOS;
    var osDetail     = req.body.detailListOS;
    var disks        = [];
    var pname        = req.body.pname;
    var user         = req.body.user;
    var pw           = req.body.pw;
    var dc           = req.body.selectListDC;
    var cluster      = req.body.Cluster;
    var ds           = req.body.DS;
    var vmName       = req.body.vmname;
    var cpus         = req.body.cpus;
    var nbNet        = req.body.selectListnet;
    var nets         = [];
    var ram          = req.body.ram;
    var dn           = req.body.dn;
    var gw           = req.body.gw;
    var dns          = req.body.dns;
    var folder       = req.body.folder;
    var vmpass       = req.body.vmpw;
    var server       = req.body.server;


for (var i = 1; i <= nbDisks; i++){
    let disk='disk'+i;
    let ndisk=req.body['namepdisk'+i];
    console.log(req.body[disk])
  if(req.body['pdisk' + i]=='on'){try{
    fs.appendFileSync('Persistent/disk'+i,'resource "vsphere_virtual_disk" '+ndisk+'" { \n'+
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
  if (!fs.existsSync(pname)){
    fs.mkdirSync(pname)
  }
} catch (err) {
  console.error(err)
}
try{
  fs.appendFileSync(pname+'/'+vmName+'vars.tf',
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
  try{fs.appendFileSync(pname+'/'+vmName+'.main.tf',
  'variable "vsphere_network'+i+'" {\n'+
    'description = "VMware vSphere Network'+i+' Name"\n'+
  '}\n'+
  '\n'
  
  ,'UTF8');}
  catch (err){
    console.error(err)
  }

try{
fs.appendFileSync(pname+'/'+vmName+'.main.tf',





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
  try{fs.appendFileSync(pname+'/'+vmName+'.main.tf',
  
  
  
  
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



try{fs.appendFileSync(pname+'/'+vmName+'.main.tf',
  
  
  
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
  fs.appendFileSync(pname+'/'+vmName+'.main.tf',
  
  
  'network_interface {\n'+
  '  network_id   = "${data.vsphere_network.network'+i+'.id}"\n'+
  '  adapter_type = "vmxnet3"\n'+
  '}\n'
  
  
  
  ,'UTF8');

}
catch(err){
  console.error(err)
}

}}


try{

  fs.appendFileSync(pname+'/'+vmName+'.main.tf',
  
  
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
    fs.appendFileSync(pname+'/'+vmName+'.main.tf','**not ready yet** \n','UTF8');
  }
  else{
    fs.appendFileSync(pname+'/'+vmName+'.main.tf',
    
    'disk {\n'+
      'label	     = "disk'+i+'"\n'+
      'size             ='+req.body["disk"+i]+' \n'+
      'unit_number      = '+i+'\n'+
      'thin_provisioned = true\n'+
    '}\n'
    
    
    
    
    ,'UTF8');
  }



}

}
catch(err){console.error(err)}
try{
fs.appendFileSync(pname+'/'+vmName+'.main.tf',

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
fs.appendFileSync(pname+'/'+vmName+'.auto.tfvars',

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
'vsphere_server               = "'+ server +'"\n'+
'vsphere_user                 = "'+ user +'"\n'+
'vsphere_datacenter           = "'+ dc +'"\n'+
'vsphere_cluster              = "'+ cluster +'"\n'+
'vsphere_datastore            = "'+ ds +'"\n'+
'vsphere_network1              = "VMNet_Vlan-'+vlan1+'"\n'+
'vsphere_template             = "templates/'+osDetail +'"\n'


,'utf8')

}
catch(err){console.error(err)}


if(nbNet>=2){
  for(i=2;i<=nbNet;i++){
  let vlan= req.body['vlan'+i];
  try{
    fs.appendFileSync(pname+'/'+vmName+'.auto.tfvars',
    
  'vsphere_network'+i+'           = "VMNet_Vlan-'+vlan +'_"\n'
    
    
    
    ,'utf8')

  }
  catch(err){console.error(err)}
  }}




}
res.redirect('/vm/addVm');
} else {
  res.sendStatus(403) // Forbidden
 }
    
});

module.exports = router;
