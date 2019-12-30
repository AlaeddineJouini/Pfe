const router = require('express').Router()
const passport = require('passport');
const admins=require('../models/user');
const url = require('url');

//  liste des admins
router.get('/listAdmin', function(req, res) {
    if (req.isAuthenticated() && req.user.isSuper()){
	admins.find({role : 'admin'}).then(doc=>{
        res.send({doc})
    }).catch(err=>{
        res.setHeader('Status', 500)
        res.json(err);
    })
}else{
    res.sendStatus(403) // Forbidden
}
});

//  liste des admins
router.get('/', function(req, res) {

    if (req.isAuthenticated() && req.user.isSuper()){
        var err = req.query.err ;
        var success = req.query.success;

        admins.find({role : 'admin'}).then(doc=>{
        res.render('template/admins',{
            admins:doc,
            err,
            success});
    }).catch(err=>{
        res.setHeader('Status', 500)
        res.json(err);
    })
}else{
    res.sendStatus(403) // Forbidden
}
});

//JSON Response
router.get('/addAdmin', function(req, res) {
    if (req.isAuthenticated() && req.user.isSuper()){
	res.send('add form')
}else{
    res.sendStatus(403) // Forbidden
}
});



//Check the body params 
//JSON RESPONSE
router.post('/addAdmin', function(req, res) {
    if (req.isAuthenticated() && req.user.isSuper()){
	let admin =new admins({
        role : 'admin',
        activation : true,
        verification :true,
        email :req.body.email,
        password : admins.generateHash(req.body.password),
        firstName : req.body.firstName,

    })
    admin.save();
    res.send({admin});
}else{
    res.sendStatus(403) // Forbidden
}
});
//RENDER
router.post('/add', function(req, res) {
    if (req.isAuthenticated() && req.user.isSuper()){
	let admin =new admins({
        role : 'admin',
        activation : true,
        verification :true,
        email :req.body.email,
        password : admins.generateHash(req.body.password),
        firstName : req.body.firstName,

    })
    admin.save();
    res.redirect('/admin');
}else{
    res.sendStatus(403) // Forbidden
}
});

router.get('/updateAdmin/:id', function(req, res) {
    if (req.isAuthenticated() && req.user.isSuper()){
	res.send('update form')
}else{
    res.sendStatus(403) // Forbidden
}
});

//JSON RESPONSE
router.post('/updateAdmin/:id', function(req, res) {
    if (req.isAuthenticated() && req.user.isSuper()){
     let Object ={
        "email" :req.body.email,
        "password" : admins.generateHash(req.body.password),
        "firstName": req.body.firstName
    }
  
    admins.updateOne({ _id: req.params.id }, Object, (d,err) => {
       /* if(err)
        res.json(err);
        else
        res.json(d);*/
    })
    res.send("updated")
  
}else{
    res.sendStatus(403) // Forbidden
}
});
//RENDER
router.post('/update/:id', function(req, res) {
    if (req.isAuthenticated() && req.user.isSuper()){
     let Object ={
        "email" :req.body.email,
        "password" : admins.generateHash(req.body.password),
        "firstName": req.body.firstName
    }
  
    admins.updateOne({ _id: req.params.id }, Object, (d,err) => {
       /* if(err)
        res.json(err);
        else
        res.json(d);*/
    });
    res.redirect(url.format({
        pathname:'/admin',
       query:{
           "success":"updated with success"
       }}));
}else{
    res.sendStatus(403) // Forbidden
}
});


//JSON RESPONSE
router.delete('/deleteAdmin/:id', function(req, res) {
    if (req.isAuthenticated() && req.user.isSuper()){
     admins.deleteOne({_id : req.params.id}).then(doc=>{
         res.send('deleted')
     }).catch(err=>{
        res.setHeader('Status', 500)
        res.json(err);
     })
   
    
}else{
    res.sendStatus(403) // Forbidden
}
});

//RENDER
router.get('/delete/:id', function(req, res) {
    if (req.isAuthenticated() && req.user.isSuper()){
     admins.deleteOne({_id : req.params.id}).then(doc=>{
         res.redirect(url.format({
             pathname:'/admin',
            query:{
                "success":"deleted with success"
            }}));
     }).catch(err=>{
        res.setHeader('Status', 500)
        res.render(url.format({
            pathname:'/admin',
            query:{
                err,
            }
        }));
     })
   
    
}else{
    res.sendStatus(403) // Forbidden
}
});

module.exports = router;