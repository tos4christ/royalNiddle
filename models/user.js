var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var UserSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		sparse: true,
		trim: true
	},
	locations: {
		type: String
	},
	email: {
		type: String,
		trim: true
	},
	password: {
		type: String,
		required: true
	},
	phone: {
		type: String,
		trim: true
	},
	address: {
		type: String,
		trim : true
	},
	photo: {
		type: String,
		trim: true
	}
});

//authenticate input against database document
UserSchema.statics.authenticate = function(email, password, callback) {
	User.findOne({email: email})
		.exec(function(error, user) {
			if(error) {
				callback(error);
			} else if(!user) {
				var err = new Error('User not found');
				err.status = 401;
				return callback(err);
			}
			bcrypt.compare(password, user.password, function(error, result) {
				if(result === true) {
					return callback(null, user);
				} else {
					return callback();
				}
			});
		});
}


UserSchema.pre('save', function(next) {
	var user = this;
	bcrypt.hash(user.password, 10, function(err, hash) {
		if(err) {
			return next(err);
		}
		user.password = hash;
		next();
	});
});

var User = mongoose.model('User', UserSchema);

module.exports = User;
