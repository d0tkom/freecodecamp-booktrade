var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var cuid = require('cuid');

var bookSchema = new Schema({
    title: { type: 'String', required: true },
    trades: { type: 'Array', default: new Array(), required: true },
    cuid: { type: 'String', default: cuid(), required: true},
    dateAdded: { type: 'Date', default: Date.now, required: true },
    userId: { type: 'String', required: true}
});

module.exports = mongoose.model('Book', bookSchema);
