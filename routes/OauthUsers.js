var express = require('express');
var router = express.Router();
var passport = require('passport');

function getHost(req, res) {
	console.log('i got here');
}

//GET /github/login
router.get('/github/login',
	passport.authenticate('github'));

// GET /github/callback
router.get('/github/callback',
	passport.authenticate('github', {failureRedirect: '/'}), 
	function(req, res) {
		// Success Auth, redirect profile page
		res.redirect('/users/profile');
	});

// GET /facebook/login
router.get('/facebook/login', getHost,
	passport.authenticate('facebook', {scope: ["email"]}));


// GET /facebook/callback
router.get('/facebook/callback', getHost,
	passport.authenticate('facebook', {failureRedirect: '/'}),
	function(req, res) {
		// Success Auth, redirect profile page
		res.redirect('/users/profile');
	});

module.exports = router;