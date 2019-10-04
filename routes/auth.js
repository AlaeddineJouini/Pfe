const router = require('express').Router()
const passport = require('passport');

//  Signup ====================================================================
router.get('/signup', function(req, res) {
	res.render('signup');
});

router.post('/signup', passport.authenticate('local-signup', {
	failureRedirect : '/auth/signup',
	failureFlash : false // allow flash messages
}), function(req, res, next)  {
   
	res.redirect('/auth/login')
});

// Login ====================================================================
router.get('/login', function(req, res, next)  {
	if (req.user) {
        if(req.user.role == 'admin')
        res.redirect('/')
        else{
			if(!(req.user.isVerified())){
				res.render('notVerified')
			}else
            res.redirect('/vm/addVm')
        }
	} else {
		res.render('login')
	}
})

router.post('/login', passport.authenticate('local-login', {
	failureRedirect : '/auth/login',
	failureFlash : false // allow flash messages
}), function(req, res, next)  {
    if(req.user.role == 'admin')
        res.redirect('/')
    else{
		if(!(req.user.isVerified())){
			res.render('notVerified')
		}else
        res.redirect('/vm/addVm')
    }
});


// LOGOUT ==============================
router.get('/logout', function(req, res, next) {
	req.logout();
	res.redirect('/auth/login');
});
module.exports = router;