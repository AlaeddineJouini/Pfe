var express = require('express');
var router = express.Router();
const User= require("../models/user");
const Cloud = require('../models/Cloud');
const Ips= require("../models/ips");

/* GET users listing. */
// router.get('/getUsers', function (req, res, next) {
//   User.find({role : "client",activation : true}).then(data=>{
//     res.render('template/users',{users : data,type : 'getUsers'})
//   }).catch(err=>{
//   console.log(err);
//   });
// });

/* GET users listing. */
router.get('/getUsers', function (req, res, next) {
  if(req.query.filter != undefined){
    var filters = req.query.filter.split(',');
  
    if(filters.length == 0){
      var queries = {};
    }else{
      var filtersList = [];
    if(filters.includes('ongoing')){
      filtersList.push({activation : true});
    }if(filters.includes('valid')){
      filtersList.push({$and : [{verification : true , activation:false}]});
    }if(filters.includes('new')){
      filtersList.push({$and : [{verification : false , activation:false}]});
    }
    // var queries = {$or:filtersList};
  }
  
  var query = {role : "client",$or:filtersList};
}else{
  var query = {role:"client"};
}
  console.log(queries);
  User.find(query).then(data=>{

    res.render('template/users',{users : data,type : 'getUsers'});
  }).catch(err=>{
  console.log(err);
  });
});

router.get('/getNotVerified', function (req, res, next) {
  User.find({role : "client",verification : false}).then(data=>{
    res.render('allUsers',{users : data ,type : 'getNotVerified'})
  }).catch(err=>{
  console.log(err);
  });
});
router.get('/getNotActive', function (req, res, next) {
  User.find({role : "client",activation : false,verification : true}).then(data=>{
    res.render('allUsers',{users : data ,type : 'getNotActive'})
  }).catch(err=>{
  console.log(err);
  });
});
router.get('/removeUser/:id', function (req, res, next) {
  if (req.isAuthenticated() && ((req.user.isAdmin())||req.user.isSuper())){
  User.deleteOne({ _id: req.params.id }).then(() => {
      
      console.log('success delete');
      res.redirect('/users/getUsers');
  }).catch((err) => {
      res.setHeader('Status', 500)
      res.json(err);
  })
} else {
  res.sendStatus(403) // Forbidden
 }
});
router.post('/searchUser', function (req, res, next) {
  var checked;
  var verif = true;
  var activ=false;
  if(req.body.type =='getUsers'){
    activ=true;
  }else if(req.body.type == 'getNotVerified'){
    verif=false
  }
  if (isNaN(Number(req.body.sr))){
    checked=null
  }
  else {
    checked=Number(req.body.sr)
  }
 
  User.find({
  role : 'client',
  activation : activ,
  verification : verif,
  $or : [{email: {$regex:'.*' + req.body.sr + '.*', $options: 'i'}} ,{vlan: checked} ]
    }).then(data=>{
      console.log('hhhhhhhhhhh');
    res.send({data})
  }).catch(err=>{
    console.log('hhhhhhhhhh2222');
    res.setHeader('Status', 500)
    res.json(err);
  });
});

router.get('/updateUser/:id', (req, res, next) => {
  if (req.isAuthenticated() && ((req.user.isAdmin())||req.user.isSuper())){
    User.findById(req.params.id).then((data) => {
      Cloud.find({}).then(doc=>{
        res.render('template/updateUser', { user: data,c:doc });
      }).catch(err=>{
        console.log(err);
      })
      
  }).catch((err) => {
      console.log(err);
  })
} else {
  res.sendStatus(403) // Forbidden
 }

})




router.get('/activateUser/:id',(req,res,next)=>{
  if (req.isAuthenticated() && ((req.user.isAdmin())||req.user.isSuper())){
    let Object ={
      activation : true
    }
    User.updateOne({_id : req.params.id},Object,(err)=>{
      if(err)
      console.log(err)

    })
    res.redirect('/users/getUsers');
  }
  else {
    res.sendStatus(403) // Forbidden
   }
})


router.post('/updateUser/:id', (req, res, next) => {
  if (req.isAuthenticated() && ((req.user.isAdmin())||req.user.isSuper())){
    console.log(req.body.selectListDC)
    console.log(req.body.Cluster)
    console.log(req.body.DS)
    console.log(req.body.DCenter)
    console.log(req.body.dn)
    console.log(req.body.gw)
    console.log(req.body.dns)
    let sp= req.body.DS.split("|");
    console.log(sp[0])

    listIp=[];

    for(var i = conv(req.body.fip); i <= conv(req.body.lip); i++)
{   
    var oc4 = (i>>24) & 0xff;
    var oc3 = (i>>16) & 0xff;
    var oc2 = (i>>8) & 0xff;
    var oc1 = i & 0xff ;
    if(oc1 !=0 && oc1!=255){
      let result =oc4 + "." + oc3 + "." + oc2 + "." + oc1 ;
    console.log(oc4 + "." + oc3 + "." + oc2 + "." + oc1 + "<br>");
    let ips =new Ips({
      ip : result,
      available : true
    });
    ips.save();
    listIp.push(ips._id);

    }
    
}
  User.findById(req.params.id).then(resultat=>{
    if(resultat.verification){
      let Object = {
        'cloud': req.body.selectListDC,
        'cluster': req.body.Cluster,
        'ds': sp[0],
        'dc': req.body.DCenter,
        'dn': req.body.dn,
        'gw': req.body.gw,
        'dns': req.body.dns,
    };
    
    User.updateOne({ _id: req.params.id }, Object, (err) => {
      console.log(err);
  })
  User.updateOne({ _id: req.params.id },{ $push: { iprange: { $each: listIp } } }, (err) => {
    console.log(err);
     res.redirect('/users/getUsers');
  
  })

    }else{
      let Object = {
        'cloud': req.body.selectListDC,
        'cluster': req.body.Cluster,
        'ds': sp[0],
        'dc': req.body.DCenter,
        'dn': req.body.dn,
        'gw': req.body.gw,
        'dns': req.body.dns,
        'verification' : true
    };

    User.updateOne({ _id: req.params.id }, Object, (err) => {
      console.log(err);
  })
  User.updateOne({ _id: req.params.id },{ $push: { iprange: { $each: listIp } } }, (err) => {
    console.log(err);
    res.redirect('/users/getUsers');
  })
    }
 
  }).catch(e=>{
    console.log(e)
  });

 
  
} else {
  res.sendStatus(403) // Forbidden
 }
})



/*for(var i = '0x0b0A0100'; i < '0x0b0A0A0A'; i++)
{   
    var oc4 = (i>>24) & 0xff;
    var oc3 = (i>>16) & 0xff;
    var oc2 = (i>>8) & 0xff;
    var oc1 = i & 0xff ;
    console.log(i)
    if(oc1 !=0 && oc1!=255)
    console.log(oc4 + "." + oc3 + "." + oc2 + "." + oc1 + "<br>");
    
}*/
//var a ="250.10.1.0"
function conv(a){
  var spl=a.split('.');
  var ip="0x"
  for(var j =0; j<4;j++){
    var test = Number(spl[j]).toString(16);
    if(test.length == 1)
    ip+='0'+test
    else
    ip+=test
  }
return ip;
}
//console.log(conv(a))



router.get('/editProfile',(req,res)=>{
  User.findById(req.user._id).then(doc=>{
    res.send({doc})
  }).catch(err=>{
    console.log(err)
  })
  
})

router.post('/editProfile',(req,res)=>{
  let Object ={
    "email": req.body.email,
    "password": User.generateHash(req.body.password),
    "firstName":req.body.firstName,
    "lastName": req.body.lastName,
  }
  User.updateOne({_id :req.user._id},Object,err=>{
    if(err) console.log(err)
   
  })
  res.send('updated')

})

module.exports = router;
