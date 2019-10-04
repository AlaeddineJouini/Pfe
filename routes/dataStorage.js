var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const dc = require('../models/Cloud');
const ds = require('../models/dataStorage');
const parser = require('body-parser');

/* GET home page. */
router.get('/addDs/:id', function (req, res, next) {
    if (req.isAuthenticated() && req.user.isAdmin()){
    res.render('addDs', { id: req.params.id });
    
} else {
    res.sendStatus(403) // Forbidden
   }
});
router.post('/addDs/:id', function (req, res, next) {
    if (req.isAuthenticated() && req.user.isAdmin()){
    let Object = {
        "name": req.body.name,
        "dc": req.params.id
    };
    ds.create(Object);
    res.redirect('/dataCenter/dcDetails/' + req.params.id);

} else {
    res.sendStatus(403) // Forbidden
   }
});
router.get('/removeDs/:id', function (req, res, next) {
    if (req.isAuthenticated() && req.user.isAdmin()){
    let d;
    ds.findById(req.params.id).then((data) => {
        console.log(data)
        d = data;
    }).catch((err) => {
        console.log(err);
    });

    ds.deleteOne({ _id: req.params.id }).then(() => {
        console.log(d.dc)
        res.redirect('/dataCenter/dcDetails/' + d.dc);
    }).catch((err) => {
        res.setHeader('Status', 500)
        res.json(err);
    })
    
} else {
    res.sendStatus(403) // Forbidden
   }


});
router.get('/updateDs/:id', (req, res, next) => {
    if (req.isAuthenticated() && req.user.isAdmin()){
    ds.findById(req.params.id).then((Object) => {

        console.log(Object.name);
        res.render('addDs', { ds: Object });
    }).catch((err) => {
        console.log(err);
    })
    
} else {
    res.sendStatus(403) // Forbidden
   }
})
router.post('/updateDs/:id', async (req, res, next) => {
    if (req.isAuthenticated() && req.user.isAdmin()){
    let d;
    await ds.findById(req.params.id).then((data) => {
        console.log(data)
        d = data;
    }).catch((err) => {
        console.log(err);
    });
    let Object = {
        'name': req.body.name
    };
    ds.updateOne({ _id: req.params.id }, Object, (err) => {
        console.log(err);
    })
    res.redirect('/dataCenter/dcDetails/' + d.dc);
    
} else {
    res.sendStatus(403) // Forbidden
   }
})

module.exports = router;

