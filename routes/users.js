var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');


// GET /user/profile
router.get('/profile', function(req, res, next) {
	if(req.session.userId) {
		User.findById(req.session.userId)
			.exec(function(error, user) {
				if(error) {
					return next(error);
				} else {
					return res.render('profile', {user: user, hideSign: true});
				}
			});
	} else if(req.user) {
		User.findById(req.user._id)
			.exec(function(error, user) {
				if(error) {
					return next(error);
				} else {
					return res.render('profile', {user: user, hideSign: true});
				}
			});
	} else {
		return res.redirect('/login');
	}
});

//log the user out by destroying the session id
// GET /logout
router.get('/logout', function(req, res, next) {
	if(req.session || req.session.userId) {
		req.session.destroy( function(err) {
			if(err) {
				return next(err);
			} else {
				return res.redirect('/');
			}
		});
	} else if(req.user) {
		req.logout();
		return res.redirect('/');
	}
});

module.exports = router;
