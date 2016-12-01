var express = require('express');
var passport = require('passport');
var router = express.Router();
var querystring = require('querystring');
var ensureTenant = require('../lib/tenant').ensureTenant();

var env = {
  AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
  AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
  AUTH0_CALLBACK_URL: process.env.AUTH0_CALLBACK_URL || 'http://localhost:3000/callback'
};

/* GET home page. */
router.get('/', function(req, res, next) {
  if (req.user) {
    res.redirect('/user');
  }

  res.render('index', { title: 'Multi-tenant App!', env: env });
});

router.get('/login',
  function(req, res) {
    var hostParts = req.get('host').split('.');
    var tenant = hostParts.length > 2 ? hostParts[0] : null;
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
  ensureTenant,
  function(req, res) {
    res.redirect(req.session.returnTo);
  });

module.exports = router;
