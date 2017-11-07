var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var cuid = require('cuid');

var userSchema = new Schema({
	google: {
		id: String,
		displayName: String,
		email: String
	},
	fullName: { type: 'String' },
	city: { type: 'String' },
	state: { type: 'String' },
	dateAdded: { type: 'Date', default: Date.now, required: true },
});

module.exports = mongoose.model('User', userSchema);
