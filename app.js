var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var GithubStrategy = require('passport-github').Strategy;
var mongoose = require('mongoose');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var User = require('./models/user');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var OauthUsers = require('./routes/OauthUsers');

function generateOrFindUser(accessToken, refreshToken, profile, done) {
	if(profile.emails[0]) {
		console.log(profile);
		User.findOneAndUpdate(
			{
				email: profile.emails[0].value
			},
			{
				name: profile.displayName || profile.username,
				email: profile.emails[0].value,
				photo: profile.photos[0].value
			},
			{
				upsert: true
			},
				done
		).then(user => console.log('this', user));
	} else {
		var noMailError = new Error('Your email privacy settings prevent you from signing into Royal Niddle');
		done(noMailError, null);
	}
};


//GITHUB ID AND SECRET
//ID=804ee0e44bab74d07bc2
//SECRET=27307ed7b6b63f52f71f9425c11864a1132a884d

//FACEBOOK ID AND SECRET
//ID=203445783799372
//SECRET=aa0945ca0ceb818fabe4a366131090a3

// Configure GitHub Strategy
passport.use(new GithubStrategy({
	clientID: process.env.GITHUB_CLIENT_ID,
	clientSecret: process.env.GITHUB_CLIENT_SECRET,
	callbackURL: "https://royalniddle.herokuapp.com/OauthUsers/github/callback"
}, generateOrFindUser));

// Configure Facebook Strategy
passport.use(new FacebookStrategy({
	clientID: process.env.FACEBOOK_APP_ID,
	clientSecret: process.env.FACEBOOK_APP_SECRET,
	callbackURL: "https://royalniddle.herokuapp.com/OauthUsers/facebook/callback",
	profileFields: ['id', 'displayName', 'photos', 'email']
}, generateOrFindUser));


passport.serializeUser(function(user, done) {
	done(null, user._id);
});

passport.deserializeUser(function(userId, done) {
	User.findById(userId, done);
});

var app = express();

mongoose.connect("mongodb://heroku_5sng30gq:lrveljjk8d9k6589onqdi9m5gr@ds249824.mlab.com:49824/heroku_5sng30gq", {useNewUrlParser: true});
var db = mongoose.connection;

// mongo error
db.on('error', console.error.bind(console, 'connection error:'));

var sessionObject = {
	secret: 'I love programming very much',
	resave: true,
	saveUninitialized: false,
	store: new MongoStore({
		mongooseConnection: db
	})
}

app.use(session(sessionObject));

//Initialize Passport
app.use(passport.initialize());

//Restore Session
app.use(passport.session());

// make user ID available in templates
app.use(function(req, res, next) {
	res.locals.currentUser = req.session.userId;
	next();
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// view engine setup
app.set('view engine', 'jade');
app.set('views', path.join(__dirname, 'views'));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/OauthUsers', OauthUsers);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
