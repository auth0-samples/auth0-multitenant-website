var express = require('express');
var passport = require('passport');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
var router = express.Router();

/* GET user profile. */
router.get('/', ensureLoggedIn, function(req, res, next) {

  // The host, which may contain tenant (e.g. tenant1.yourcompany.com)
  var host= req.get('host');
  var hostParts = host.split('.');;

  // The host without tenant (e.g. yourcompany.com)
  var topLevelHost = hostParts.length > 2 ? hostParts.shift().join('.') : host;

  res.render('user', { user: req.user, host: topLevelHost });
});

module.exports = router;
