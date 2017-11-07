var User = require('../models/user');
var Book = require('../models/book');

module.exports = function(app, passport) {
     /* GET home page. */
    app.get('/', function(req, res, next) {
        var title = "Express";
        if (req.query.text != undefined) {
            title = req.query.text;
        }
        res.render('index', { title: title});
    });   
    
    app.get('/user', isLoggedIn, function(req, res) {
        res.json(req.user).end();
    });
    
    app.get('/logout', isLoggedIn, function(req, res) {
        req.logout();
        res.redirect('/');
    });
}

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated()) {
      return next(); 
    }

    // if they aren't redirect them to the home page
    res.redirect('/');
}

