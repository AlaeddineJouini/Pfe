var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const dc = require('../models/Cloud');
const parser = require('body-parser');
const User = require('../models/user')


/* GET form page */
router.get('/form',function(req,res,next) {
  res.render('template/forms');
});


/* GET home page. */
router.get('/', function (req, res, next) {
  if (req.isAuthenticated() && req.user.isAdmin()) {
    dc.find({}).then((data) => {
      res.render('template/dashboard', { dc: data });
    }).catch((err) => {
      res.setHeader('Status', 500)
      res.json(err);
    })
} else {
    // res.sendStatus(403) // Forbidden
    res.redirect("/auth/login")
}

});
router.get('/adduser',function(req,res,next){
  if (req.isAuthenticated() && req.user.isAdmin())
 { 
   es.render('addUser')
 } else {
  res.sendStatus(403) // Forbidden
 }
 
})
router.post('/addUser',function(req,res,next){
  if (req.isAuthenticated() && req.user.isAdmin()){
  new User({
    role :'admin',
    pseudo : req.body.pseudo,
    password :User.generateHash(req.body.password),
    nickname :'admin',
    age : 22
  }).save(function(err, savedUser) {
    if (err) {
        res.send(err)
    }
    // Success. Pass back savedUser
   res.redirect('/auth/login')
})
} else {
  res.sendStatus(403) // Forbidden
 }
})


module.exports = router;
