var express = require('express');
var passport = require('passport');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
var ensureTenantContext = require('../models/ensureTenantContext').ensureTenant();
var router = express.Router();

/* GET user profile. */
router.get('/', ensureLoggedIn, ensureTenantContext, function(req, res, next) {

  // The host, which may contain tenant (e.g. tenant1.yourcompany.com)
  var host= req.get('host');
  var hostParts = host.split('.');;
  var currentTenant;

  if (hostParts.length > 2) {
    currentTenant = hostParts[0];

    // removes the tenant from the host parts.
    hostParts.shift();
  }

  // The host without tenant (e.g. yourcompany.com)
  var topLevelHost = hostParts.join('.')


  res.render('user', { user: req.user, host: topLevelHost, currentTenant: currentTenant });
});

module.exports = router;
