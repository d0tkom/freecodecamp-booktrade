var Book = require('../models/book');
var User = require('../models/user');
var cuid = require('cuid');

module.exports = function(app, passport) {

    app.put('/api/user', isLoggedIn, (req, res) => {
        if (!req.body.user) {
            res.status(403).end();
        }

        var fullName = req.body.user.fullName;
        var city = req.body.user.city;
        var state = req.body.user.state;
        var userId = req.user.google.id;

        User.findOne({'google.id': userId}, (err, user) => {
            if (err) throw err;
            if (!user) {
                res.status(500).send("no user found").end();
            }

            user.city = city;
            user.state = state;
            user.fullName = fullName;
            user.save((err, saved) => {
                if (err) {
                    res.status(500).send(err).end();
                }
                res.send(saved).end();
            })
        });
    });

  app.get('/api/books', function(req, res) {
    Book.find().sort('-dateAdded').exec((err, books) => {
      if (err) {
        res.status(500).send(err).end();
      }
      res.json({ books }).end();
    });
  });

  app.get('/api/books/my', isLoggedIn, function(req, res) {
    var userId = req.user.google.id;
    Book.find({userId: userId}).sort('-dateAdded').exec((err, books) => {
      if (err) {
        res.status(500).send(err).end();
      }
      res.json({ books }).end();
    });
  });

  app.post('/api/books', isLoggedIn, function(req, res) {
    if (!req.body.book.title) {
      res.status(403).end();
    }

    var title = req.body.book.title;
    var userId = req.user.google.id;

    var book = new Book({title: title, userId: userId});
    book.save((err, saved) => {
      if (err) {
        res.status(500).send(err).end();
      }
      res.send(saved).end();
    })
  });

  app.post('/api/books/:id1/trade/:id2', isLoggedIn, ownsOnlyOneBookAndBothExist, tradeDoesNotExist, didNotOfferOtherBook, (req, res) => {
    var book1 = req.book1;
    var book2 = req.book2;
    var userId = req.user.google.id;

    var tradeId = new cuid();
    book1.trades.push({id: tradeId, title: book2.title, bookId: book2._id, proposerId: userId });
    book2.trades.push({id: tradeId, title: book1.title, bookId: book1._id, proposerId: userId });

    var counter = 0;
    book1.save((err, saved) => {
        if (err) res.status(500).send(err);
        if (++counter == 2) {
            res.send("success").end();
        }
    })

    book2.save((err, saved) => {
        if (err) res.status(500).send(err);
        if (++counter == 2) {
            res.json("success").end();
        }
    })
  });

  app.put('/api/books/:id1/trade/:id2', isLoggedIn, ownsOnlyOneBookAndBothExist, tradeExist, (req, res) => {
    var myBook = req.myBook;
    var tradeBook = req.tradeBook;
    var tradeInd = req.tradeInd;
    var userId = req.user.google.id;
    var trade = req.trade;//myBook.trades[tradeInd][0];

    if (trade.proposerId === userId) {
        res.status(500).send("you can't approve your own request").end();
        return;
    }

    // everything checks out approve exchange

    myBook.trades.splice(tradeInd, 1);

    var len = tradeBook.trades.length;
    var tradeInd2;
    for (var i = 0; i < len; i++) {
        var item = tradeBook.trades[i][0];
        if ( item.bookId == myBook._id.toString()) {
            tradeInd2 = i;
            break;
        }
    }

    tradeBook.trades.splice(tradeInd2, 1);

    var temp = myBook.userId;
    myBook.userId = tradeBook.userId;
    tradeBook.userId = temp;

    var counter = 0;
    myBook.save((err, saved) => {
        if (err) res.status(500).send(err).end();
        if (++counter == 2) {
            res.send("approved").end();
        }
    })

    tradeBook.save((err, saved) => {
        if (err) res.status(500).send(err);
        if (++counter == 2) {
            res.send("approved").end();
        }
    })
  });

  app.delete('/api/books/:id1/trade/:id2', isLoggedIn, ownsOnlyOneBookAndBothExist, tradeExist, (req, res) => {
    var myBook = req.myBook;
    var tradeBook = req.tradeBook;
    var tradeInd = req.tradeInd;
    var userId = req.user.google.id;
    var trade = req.trade;//myBook.trades[tradeInd][0];

    if (trade.proposerId === userId) {
        res.status(500).send("you can't approve your own request").end();
        return;
    }

    // everything checks out approve exchange

    myBook.trades.splice(tradeInd, 1);

    var len = tradeBook.trades.length;
    var tradeInd2;
    for (var i = 0; i < len; i++) {
        var item = tradeBook.trades[i][0];
        if ( item.bookId == myBook._id.toString()) {
            tradeInd2 = i;
            break;
        }
    }

    tradeBook.trades.splice(tradeInd2, 1);

    var counter = 0;
    myBook.save((err, saved) => {
        if (err) res.status(500).send(err).end();
        if (++counter == 2) {
            res.send("approved").end();
        }
    })

    tradeBook.save((err, saved) => {
        if (err) res.status(500).send(err);
        if (++counter == 2) {
            res.send("approved").end();
        }
    })
  });
};

ownsOnlyOneBookAndBothExist = (req, res, next) => {
    let id1 = req.params.id1;
    let id2 = req.params.id2;

    let userId = req.user.google.id;
    let counter = 0;
    let book1;
    let book2;
    Book.findOne({_id: id1}, (err, book) => {
        if (err || !book) {
            res.status(500).send("couldn't find book: " + id1).end();
        }
        book1 = book;
        if (++counter == 2) {
            resume();
        }
    });

    Book.findOne({_id: id2}, (err, book) => {
        if (err || !book) {
            res.status(500).send("couldn't find book: " + id2).end();
        }
        book2 = book;
        if (++counter == 2) {
            resume();
        }
    });

    resume = () => {
        if (userId === book1.userId && userId === book2.userId) {
            res.status(500).send("you own both books").end();
            return;
        }
        if (userId === book1.userId) {
            req.book1 = book1;
            req.book2 = book2;

            req.myBook = book1;
            req.tradeBook = book2;
            return next();
        }
        if (userId === book2.userId) {
            req.book1 = book1;
            req.book2 = book2;
            
            req.myBook = book2;
            req.tradeBook = book1;
            return next();
        }
        res.status(500).send("you don't own any of the books").end();
    }
}

tradeDoesNotExist = (req, res, next) => {
    let book1 = req.book1;
    let book2 = req.book2;
    let len = book1.trades.length;

    for (var i = 0; i < len; i++) {
        let item = book1.trades[i][0];
        if (item.bookId == book2._id.toString()) {
            res.status(500).send('trade already exist').end();
            return;
        }
    }

    len = book2.trades.length;
    for (var i = 0; i < len; i++) {
        let item = book2.trades[i][0];
        if (item.bookId == book1._id.toString()) {
            res.status(500).send('trade already exist').end();
            return;
        }
    }

    return next();
}

didNotOfferOtherBook = (req, res, next) => {
    let book1 = req.book1;
    let book2 = req.book2;
    let len = book1.trades.length;
    var userId = req.user.google.id;

    for (var i = 0; i < len; i++) {
        let item = book1.trades[i][0];
        if (item.proposerId == userId) {
            res.status(500).send('already offered something else').end();
            return;
        }
    }

    len = book2.trades.length;
    for (var i = 0; i < len; i++) {
        let item = book2.trades[i][0];
        if (item.proposerId == userId) {
            res.status(500).send('already offered something else').end();
            return;
        }
    }

    return next();
}

tradeExist = (req, res, next) => {
    let myBook = req.myBook;
    let tradeBook = req.tradeBook;
    let len = myBook.trades.length;

    for (var i = 0; i < len; i++) {
        let item = myBook.trades[i][0];

        if (item.bookId == tradeBook._id.toString()) {
            req.tradeInd = i;
            req.trade = item;
            return next();
        }
    }
    
    res.status(500).send('trade does not exist').end();
    return;
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