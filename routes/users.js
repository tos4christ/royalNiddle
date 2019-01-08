var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');


// GET /user/profile
router.get('/profile', function(req, res, next) {
	if(req.user) {
			return res.render('profile', {user: user, hideSign: true});
	} else {
		res.redirect('/login');
	}
});

//log the user out by destroying the session id
// GET /logout
router.get('/logout', function(req, res, next) {
		req.logout();
		res.redirect('/');
});

module.exports = router;
