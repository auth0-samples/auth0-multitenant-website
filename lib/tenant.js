module.exports = {
  ensureTenant: function (options) {
    if (typeof options === 'string') {
      options = { redirectTo: options };
    }

    options = options || {};

    var url = options.redirectTo || '/selectTenant';
    var setReturnTo = options.setReturnTo === undefined ? true : options.setReturnTo;

    return function (req, res, next) {
      var hostParts = req.get('host').split('.');
      // retrieves the tenant name from the host.
      var tenant = hostParts.length > 2 ? hostParts[0] : undefined;

      // if using session and tenant is not in the url check tenant in session.
      if (req.session && tenant) tenant = tenant || req.session.tenant;

      if (tenant) {
        var isUserInTenant = req.user._json.groups.some((element, index, array) => {
          return element.toLowerCase() === tenant.toLowerCase();
        });
      }

      if (!tenant || !isUserInTenant) {
        if (setReturnTo && req.session) {
          req.session.returnTo = req.originalUrl || req.url;
        }
        return res.redirect(url);
      }

      next();
    }
  }
};
