var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const cluster = require('../models/cluster');
const parser = require('body-parser');


/* GET home page. */
router.get('/addCluster/:id', function (req, res, next) {
    if (req.isAuthenticated() && req.user.isAdmin()){
    res.render('addCluster', { id: req.params.id });
 } else {
  res.sendStatus(403) // Forbidden
 }
});
router.post('/addCluster/:id', function (req, res, next) {
    if (req.isAuthenticated() && req.user.isAdmin()){

    
    let Object = {
        "name": req.body.name,
        "dc": req.params.id
    };
    cluster.create(Object);

    res.redirect('/dataCenter/dcDetails/' + req.params.id);
} else {
    res.sendStatus(403) // Forbidden
   }

});
router.get('/removeCluster/:id', function (req, res, next) {
    let d;
    if (req.isAuthenticated() && req.user.isAdmin()){

    
    cluster.findById(req.params.id).then((data) => {
        console.log(data)
        d = data;
    }).catch((err) => {
        console.log(err);
    });

    cluster.deleteOne({ _id: req.params.id }).then(() => {
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
router.get('/updateCluster/:id', (req, res, next) => {
    if (req.isAuthenticated() && req.user.isAdmin()){

    cluster.findById(req.params.id).then((Object) => {

        console.log(Object.name);
        res.render('addCluster', { cl: Object });
    }).catch((err) => {
        console.log(err);
    })
} else {
    res.sendStatus(403) // Forbidden
   }
})
router.post('/updateCluster/:id', async (req, res, next) => {
    if (req.isAuthenticated() && req.user.isAdmin()){

    
    let d;
    await cluster.findById(req.params.id).then((data) => {
        console.log(data)
        d = data;
    }).catch((err) => {
        console.log(err);
    });
    let Object = {
        'name': req.body.name
    };
    cluster.updateOne({ _id: req.params.id }, Object, (err) => {
        console.log(err);
    })
    res.redirect('/dataCenter/dcDetails/' + d.dc);
} else {
    res.sendStatus(403) // Forbidden
   }
})
module.exports = router;
