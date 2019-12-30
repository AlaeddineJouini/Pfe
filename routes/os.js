var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const osType = require('../models/operatingSystemType');
const osName = require('../models/operatingSystem');
const parser = require('body-parser');


/* GET home page. */
router.get('/addOsType', function (req, res, next) {
    if (req.isAuthenticated() && req.user.isAdmin()){
    res.render('addOs');
} else {
    res.sendStatus(403) // Forbidden
   }
});
router.post('/addOsType', function (req, res, next) {
    if (req.isAuthenticated() && req.user.isAdmin()){
        console.log(req.user._id)
        console.log(req.user.pseudo)
    let Object = {
        "type": req.body.type
    };
    osType.create(Object);

    res.redirect('/os/listOs');
} else {
    res.sendStatus(403) // Forbidden
   }
});

router.get('/listOs', function (req, res, next) {
    if (req.isAuthenticated() && req.user.isAdmin()){
    osType.find({}).then((data) => {
        res.render('template/os', { items: data });
    }).catch((err) => {
        res.setHeader('Status', 500)
        res.json(err);
    })
} else {
    res.sendStatus(403) // Forbidden
   }
});

router.get('/osDetails/:id', async function (req, res, next) {
    if (req.isAuthenticated() && req.user.isAdmin()){
    let osNames;
    let id = req.params.id;
    await osName.find({ type: id }).then((data => {
        osNames = data;
    }));
    console.log(osNames);
    res.render('template/ostypes', { types:osNames, id });
} else {
    res.sendStatus(403) // Forbidden
   }
});

router.get('/addOsName/:id', function (req, res, next) {
    if (req.isAuthenticated() && req.user.isAdmin()){
    res.render('addOsName', { id: req.params.id });
} else {
    res.sendStatus(403) // Forbidden
   }
});
router.post('/addOsName/:id', function (req, res, next) {
    if (req.isAuthenticated() && req.user.isAdmin()){
    let Object = {
        "name": req.body.name,
        "type": req.params.id
    };
    osName.create(Object);

    res.redirect('/os/osDetails/' + req.params.id);
} else {
    res.sendStatus(403) // Forbidden
   }


});
router.get('/removeOsType/:id', function (req, res, next) {
    if (req.isAuthenticated() && req.user.isAdmin()){
    osType.deleteOne({ _id: req.params.id }).then(() => {
        osName.deleteMany({ type: req.params.id }).then(() => {
            console.log('success delete');
        }).catch((err) => {
            console.log(err)
        })
        res.redirect('/os/listOs');
    }).catch((err) => {
        res.setHeader('Status', 500)
        res.json(err);
    })
} else {
    res.sendStatus(403) // Forbidden
   }
});

router.get('/updateOsType/:id', (req, res, next) => {
    if (req.isAuthenticated() && req.user.isAdmin()){
    osType.findById(req.params.id).then((Object) => {

        console.log(Object.name);
        res.render('addOs', { os: Object });
    }).catch((err) => {
        console.log(err);
    })
} else {
    res.sendStatus(403) // Forbidden
   }
})
router.post('/updateOsType/:id', (req, res, next) => {
    if (req.isAuthenticated() && req.user.isAdmin()){
    let Object = {
        'type': req.body.type
    };
    osType.updateOne({ _id: req.params.id }, Object, (err) => {
        console.log(err);
    })
    res.redirect('/os/listOs');
} else {
    res.sendStatus(403) // Forbidden
   }
})


router.get('/updateOsName/:id', (req, res, next) => {
    if (req.isAuthenticated() && req.user.isAdmin()){
    osName.findById(req.params.id).then((Object) => {

        console.log(Object.name);
        res.render('addOsName', { os: Object });
    }).catch((err) => {
        console.log(err);
    })
} else {
    res.sendStatus(403) // Forbidden
   }
})
router.post('/updateOsName/:id', async (req, res, next) => {
    if (req.isAuthenticated() && req.user.isAdmin()){
    let d;
    await osName.findById(req.params.id).then((data) => {
        console.log(data)
        d = data;
    }).catch((err) => {
        console.log(err);
    });
    let Object = {
        'name': req.body.name
    };
    osName.updateOne({ _id: req.params.id }, Object, (err) => {
        console.log(err);
    })
    res.redirect('/os/osDetails/' + d.type);
} else {
    res.sendStatus(403) // Forbidden
   }
})

router.get('/removeOsName/:id', function (req, res, next) {
    if (req.isAuthenticated() && req.user.isAdmin()){
    let d;
    osName.findById(req.params.id).then((data) => {
        console.log(data)
        d = data;
    }).catch((err) => {
        console.log(err);
    });

    osName.deleteOne({ _id: req.params.id }).then(() => {
        console.log(d.dc)
        res.redirect('/os/osDetails/' + d.type);
    }).catch((err) => {
        res.setHeader('Status', 500)
        res.json(err);
    })
} else {
    res.sendStatus(403) // Forbidden
   }


});
module.exports = router;
