var express = require('express');
var passport = require('passport');
var router = express.Router();
var querystring = require('querystring');

var env = {
  AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
  AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
  AUTH0_CALLBACK_URL: process.env.AUTH0_CALLBACK_URL || 'http://localhost:3000/callback'
};

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Multi-tenant App!', env: env });
});

router.get('/login',
  function(req, res) {
    var tenant = req.get('host').split('.')[0];
    req.session.tenant = tenant;
    req.session.returnTo = req.protocol + '://' + req.get('host') + '/user';

    var query = querystring.stringify({
      client_id: process.env.AUTH0_CLIENT_ID,
      response_type: 'code',
      scopes: 'openid profile bar',
      redirect_uri: process.env.AUTH0_CALLBACK_URL
    });

    res.redirect(`https://${process.env.AUTH0_DOMAIN}/authorize?${query}`);
  });

router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

router.get('/callback',
  passport.authenticate('auth0', { failWithError: true }),
  function(req, res) {
    //check that user is authorized to access this tenant
    if (req.user._json.groups.indexOf(req.session.tenant) === -1) {
      req.logout();
      res.send('Not a member of this tenant');
    }

    res.redirect(req.session.returnTo);
  },
  function(err, req, res, next) {
    if (err.constructor.name === 'AuthenticationError') {
      err.description = req.query.error_description;
      return res.json(err);
    }

    next(err);
  });


module.exports = router;
