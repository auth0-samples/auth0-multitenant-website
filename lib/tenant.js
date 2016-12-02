function getUrlTenant (req) {
  var hostParts = req.get('host').split('.');
  if (hostParts.length > 2) {
    return hostParts[0];
  }
}

function getAuthorizedTenants (req) {
  if (req.user) {
    return req.user._json.groups;
  }
}

module.exports = {
  // Attempts to sets req.tenant
  setCurrent: function (predicate) {
    return function (req, res, next) {
      // first try the passed predicate
      if (predicate) {
        var value = predicate(req);
        if (value) {
          req.tenant = value;
          return next();
        }
      }

      // then try the URL 
      var urlTenant = getUrlTenant(req);
      if (urlTenant)
      {
        req.tenant = urlTenant;
        return next();
      }
      
      // finally check to see if the authenticated user has a single authorized tenant
      var tenants = getAuthorizedTenants(req);
      if (tenants && tenants.length === 1) {
        req.tenant = tenants[0];
      }

      next();
    };
  },

  // Makes sure req.tenant exists
  // and that the current user is authorized to access it;
  // otherwise, redirect to appropriate tenant picker 
  ensureCurrent: function () {
    return function (req, res, next) {
      if (!req.tenant)
        return res.redirect('/tenant/choose');
      
      var tenants = getAuthorizedTenants(req);
      if (!tenants || !tenants.some(tenant => tenant === req.tenant))
        return res.redirect('/tenant/unauthorized');

      next();
    };
  },

  // If req.tenant exists but there's no tenant in the URL
  // redirect to an equivalent URL with the tenant
  ensureUrl: function () {
    return function (req, res, next) {
      var urlTenant = getUrlTenant(req);

      if (req.tenant && !urlTenant) {
        var url = `http://${req.tenant}.${req.get('host')}${req.originalUrl}`;
        return res.redirect(url);
      }

      next();
    };
  }
};
