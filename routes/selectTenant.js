var express = require('express');
var passport = require('passport');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;
var router = express.Router();

router.get('/', 
  ensureLoggedIn(), 
  function(req, res, next) {
    var tenants = req.user._json.groups.map(tenant => {
      return {
        name: tenant,
        url: `http://${tenant}.yourcompany.com:3000/user`
      };
    });
    
    res.render('selectTenant', { 
      user: req.user, 
      tenants: tenants
    });
  });

module.exports = router;
