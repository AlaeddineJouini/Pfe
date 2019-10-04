var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const dc = require('../models/Cloud');
const cluster = require('../models/cluster');
const ds = require('../models/dataStorage');
const parser = require('body-parser');


/* GET home page. */
router.get('/listDc', function (req, res, next) {
    if (req.isAuthenticated() && req.user.isAdmin()){
    dc.find({}).then((data) => {
        res.render('listDc', { dc: data });
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
    if (req.isAuthenticated() && req.user.isAdmin()){
    let Object = {
        "name": req.body.name,
        "adress": req.body.adress,
        "user": req.body.user,
        "password": req.body.password
    };
    dc.create(Object);
    console.log(req.body.name)
    console.log(req.body.adress)
    console.log(req.body.user)
    console.log(req.body.password),

    res.redirect('/dataCenter/listDc');
} else {
    res.sendStatus(403) // Forbidden
   }

});
router.get('/dcDetails/:id', async function (req, res, next) {
    if (req.isAuthenticated() && req.user.isAdmin()){
    let clusters;
    let dss;
    let id = req.params.id;
    
    
    res.render('dcDetails', {id });
} else {
    res.sendStatus(403) // Forbidden
   }
});
router.get('/removeDc/:id', function (req, res, next) {
    if (req.isAuthenticated() && req.user.isAdmin()){
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
    if (req.isAuthenticated() && req.user.isAdmin()){
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
    if (req.isAuthenticated() && req.user.isAdmin()){
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

module.exports = router;
