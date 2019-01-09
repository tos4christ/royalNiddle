var express = require('express');
var router = express.Router();
var User = require('../models/user');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/aboutus', function(req, res, next) {
	res.render('about');
});

router.get('/contactus', function(req, res) {
	res.render('contact');
})

//GET /signup page
router.get('/signup', function(req, res, next) {
	if(req.session || req.session.userId) {
		req.session.destroy( function(err) {
			if(err) {
				return next(err);
			} else {
				return res.render('signup', {title: 'Sign Up'});
			}
		});
	} else if(req.user) {
		req.logout();
		return res.render('signup', {title: 'Sign Up'});
	} else {
		return res.render('signup', {title: 'Sign Up'});
	}
});


//POST /signup form
router.post('/signup', function(req, res, next) {
	
	if(req.body.email && req.body.password && req.body.confirmPassword && req.body.locations && req.body.address) {
		//check to see if the two passwords are correct
		if(req.body.password !== req.body.confirmPassword) {
			var err = new Error('Passwords do not match');
			err.status = 400;
			return next(err);
		}

		// create object with form input
		var userObject = {
			name: req.body.name,
			locations: req.body.locations,
			email: req.body.email,
			password: req.body.password,
			phone: req.body.phone,			
			address: req.body.address			
		};
		
		// use schema's create method to insert into Mongo

		User.create(userObject, function(error, user) {
			if(error) {
				return next(error);
			} else {
				req.session.userId = user._id;
				return res.redirect('/users/profile');
			}
		});

	} else {
		var err = new Error('All fields are required.');
		err.status = 400;
		return next(err);
	}
});

//Log the user in
//GET /login
router.get('/login', function(req, res, next) {

	if(req.session && req.session.userId) {
		return res.redirect('users/profile');
	} else {
		return res.render('login');
	}
});


//POST /login
router.post('/login', function(req, res, next) {
	if(req.body.email && req.body.password) {
		User.authenticate(req.body.email, req.body.password, function(error, user) {
			if(error || !user) {
				var err = new Error('Wrong email or password');
				err.status = 401;
				return next(err);
			} else {
				req.session.userId = user._id;
				return res.redirect('users/profile');
			}
		})
	} else {
		var err = new Error('Wrong Credentials');
		err.status = 400;
		return next(err);
	}
});

module.exports = router;
