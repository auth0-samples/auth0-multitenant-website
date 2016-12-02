var express = require('express');
var passport = require('passport');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;
var router = express.Router();

var tenant = require('../lib/tenant');

/* GET user profile. */
router.get('/', 
  ensureLoggedIn(),
  tenant.setCurrent(),
  tenant.ensureCurrent(),
  tenant.ensureUrl(), 
  function(req, res) {
    var tenants = req.user._json.groups.map(tenant => {
      var isActive = tenant === req.tenant;

      return {
        name: tenant,
        isActive: isActive,
        url: isActive ? '#' : `http://${tenant}.yourcompany.com:3000/user`
      };
    });

    res.render('user', { 
      user: req.user, 
      tenants: tenants,
      currentTenant: req.tenant
    });
  });

module.exports = router;
