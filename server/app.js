const express = require('express');
const path = require('path');
const utils = require('./lib/hashUtils');
const partials = require('express-partials');
const bodyParser = require('body-parser');
const Auth = require('./middleware/auth');
const models = require('./models');
const db = require('./db');
const cookieParse = require('./middleware/cookieParser.js');

const app = express();

app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');
app.use(partials());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));



app.get('/',
(req, res) => {
  res.render('index');
});

app.get('/create',
(req, res) => {
  res.render('index');
});

app.get('/links',
(req, res, next) => {
  models.Links.getAll()
    .then(links => {
      res.status(200).send(links);
    })
    .error(error => {
      res.status(500).send(error);
    });
});

app.post('/links',
(req, res, next) => {
  var url = req.body.url;
  if (!models.Links.isValidUrl(url)) {
    // send back a 404 if link is not valid
    return res.sendStatus(404);
  }

  return models.Links.get({ url })
    .then(link => {
      if (link) {
        throw link;
      }
      return models.Links.getUrlTitle(url);
    })
    .then(title => {
      return models.Links.create({
        url: url,
        title: title,
        baseUrl: req.headers.origin
      });
    })
    .then(results => {
      return models.Links.get({ id: results.insertId });
    })
    .then(link => {
      throw link;
    })
    .error(error => {
      res.status(500).send(error);
    })
    .catch(link => {
      res.status(200).send(link);
    });
});

/************************************************************/
// Write your authentication routes here
/************************************************************/

// Add routes to your Express server to process incoming POST requests.
// These routes should enable a user to register for a new account and for users to log in to your application.
// Take a look at the login.ejs and signup.ejs templates in the views directory to determine which routes you need to add.

// Add the appropriate callback functions to your new routes.
// Add methods to your user model, as necessary, to keep your code modular (i.e., your database model methods should not receive as arguments or otherwise have access to the request or response objects).

// render the sign up page
app.get('/signup',
(req, res) => {
  res.render('signup');
});

app.post('/signup', (req, res, next) => {
  // compare the attempted username to the users table
  return models.Users.create(req.body)
  .then((results) => {
    console.log(`${req.body.username} successfully added to the database`);
    res.body = `${req.body.username} has been added to the database`;
    res.statusCode = 201;
    res.redirect('./login');
    res.end();
  })
  .catch((err) => {
    console.log('THIS USER ALREADY EXISTS');
    res.body = 'this username already exists, please try again.';
    res.redirect('./signup');
    res.statusCode = 409;
    res.end();
  })
});

// render the login page
app.get('/login',
(req, res) => {
  res.render('login');
});

app.post('/login', (req, res, next) => {
  console.log(cookieParse.parseCookies(req));
  req.end();
})

/************************************************************/
// Handle the code parameter route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/:code', (req, res, next) => {

  return models.Links.get({ code: req.params.code })
    .tap(link => {

      if (!link) {
        throw new Error('Link does not exist');
      }
      return models.Clicks.create({ linkId: link.id });
    })
    .tap(link => {
      return models.Links.update(link, { visits: link.visits + 1 });
    })
    .then(({ url }) => {
      res.redirect(url);
    })
    .error(error => {
      res.status(500).send(error);
    })
    .catch(() => {
      res.redirect('/');
    });
});

module.exports = app;
