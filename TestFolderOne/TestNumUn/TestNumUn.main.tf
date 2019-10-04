provider "vsphere" { 
  version = "1.10.0" 
  user           = "${var.vsphere_user}"
  password       = "${var.vsphere_password}" 
  vsphere_server = "${var.vsphere_server}"

 # If you have a self-signed cert 
 allow_unverified_ssl = true 
}

data "vsphere_datacenter" "dc" {
  name = "${var.vsphere_datacenter}"
}

data "vsphere_datastore" "datastore" {
  name          = "${var.vsphere_datastore}"
  datacenter_id = "${data.vsphere_datacenter.dc.id}"
}

data "vsphere_compute_cluster" "cluster" {
  name          = "${var.vsphere_cluster}"
  datacenter_id = "${data.vsphere_datacenter.dc.id}"
}
data "vsphere_virtual_machine" "template" {
  name          = "${var.vsphere_template}"
  datacenter_id = "${data.vsphere_datacenter.dc.id}"
}
data "vsphere_network" "network1" {
  name          = "${var.vsphere_network1}"
  datacenter_id = "${data.vsphere_datacenter.dc.id}"
}
data "vsphere_network" "network2" {
  name          = "${var.vsphere_network2}"
  datacenter_id = "${data.vsphere_datacenter.dc.id}"
}
resource "vsphere_virtual_machine" "TestNumUn" {  
  name             = "${var.vm_name}"
  folder           = "${var.vm_folder_name}"
  num_cpus         = "${var.vm_cpus}"
  memory           = "${var.vm_memory}"
  resource_pool_id = "${data.vsphere_compute_cluster.cluster.resource_pool_id}"
  datastore_id     = "${data.vsphere_datastore.datastore.id}"
  
  guest_id         = "${data.vsphere_virtual_machine.template.guest_id}"
  scsi_type        = "${data.vsphere_virtual_machine.template.scsi_type}"
network_interface {
  network_id   = "${data.vsphere_network.network1.id}"
  adapter_type = "${data.vsphere_virtual_machine.template.network_interface_types[0]}"
}
network_interface {
  network_id   = "${data.vsphere_network.network2.id}"
  adapter_type = "vmxnet3"
}
disk {
  label            = "disk0"
  size             = "${data.vsphere_virtual_machine.template.disks.0.size}"
  eagerly_scrub    = "${data.vsphere_virtual_machine.template.disks.0.eagerly_scrub}"
  thin_provisioned = "${data.vsphere_virtual_machine.template.disks.0.thin_provisioned}"
}
disk {
label	     = "disk1"
size             =50 
unit_number      = 1
thin_provisioned = true
}
disk {
label	     = "disk2"
size             =80 
unit_number      = 2
thin_provisioned = true
}
clone {
template_uuid = "${data.vsphere_virtual_machine.template.id}"

customize {
linux_options {
host_name = "${var.vm_name}"
domain    = "${var.vm_domain_name}"
}

network_interface {
ipv4_address = "${var.vm_ip_address}"
ipv4_netmask = "${var.vm_network_cidr}"
}
network_interface {}

dns_server_list = ["${var.vm_dns_server}"]
ipv4_gateway = "${var.vm_default_gateway}"
}
}

