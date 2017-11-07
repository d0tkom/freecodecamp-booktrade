'use strict';

module.exports = {
	'googleAuth': {
		'clientID': process.env.GOOGLE_ID,
		'clientSecret': process.env.GOOGLE_SECRET,
		'callbackURL': 'https://d0tkom-booktrade.herokuapp.com/auth/google/callback'
	}
};
