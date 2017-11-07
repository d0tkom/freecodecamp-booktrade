'use strict';

var GoogleStrategy = require('passport-google-auth').Strategy;
var User = require('../models/user');
var configAuth = require('./auth');

module.exports = function (passport) {
	passport.serializeUser(function (user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(function (id, done) {
		User.findById(id, function (err, user) {
			done(err, user);
		});
	});	
	
    passport.use(new GoogleStrategy({
        clientId: configAuth.googleAuth.clientID,
        clientSecret: configAuth.googleAuth.clientSecret,
		callbackURL: configAuth.googleAuth.callbackURL
	},
	function (token, refreshToken, profile, done) {
		process.nextTick(function () {
			User.findOne({ 'google.id': profile.id }, function (err, user) {
				if (err) {
					console.log("error");
					return done(err);
				}

			    if (user) {
			    	console.log("found user");
					return done(null, user);
				} 
				else {
					var newUser = new User();
					newUser.google.id = profile.id;
					newUser.google.displayName = profile.displayName;

					newUser.save(function (err) {
						if (err) {
							throw err;
						}

						return done(null, newUser);
					});
				}
			});
		});
	}));
};