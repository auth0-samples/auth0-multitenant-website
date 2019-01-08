# Auth0 Multi-tenant Website Sample

This sample demonstrates a simple multi-tenant web application that uses the [Auth0 Authorization](https://auth0.com/docs/extensions/authorization-extension) extension to manage tenants using user groups.

## Features

* Instead of partitioning tenant users by connections (which is a common approach), this sample uses groups (powered by the **Authorization extension**)
* This decouples tenants from connections, allowing more flexibility
* Therefore if you like, you can store _all_ users (across all tenants) in one Database connection (as shown in the sample) or across multiple connections (eg. some users in the Database connection and some users in an enterprise connection, like AD)
* The multi-tenant application is represented as a single Application in Auth0 (with a single OAuth2 callback endpoint) vs. one app per tenant (which is another common approach)
* This makes for simpler configuration and implementation within the application
* The multi-tenant application itself is a simple Node.js (Express) website. A SPA app could also be built in a similar fashion, but a regular web app was simpler to demonstrate since it doesn't require a backing API.

## How it works

### Auth0 and the Authorization extension

In this sample users are organized into one or more tenants using _user groups_, which is a very familiar IAM concept. This is done using the **Auth0 Authorization** extension, which allows you to define groups and assign users to them. The extension also lets you create roles (and permissions) for each of your applications. This sample just uses a single role in order to control access to the website itself and it enforces this using a custom rule. This role can be attached to each "tenant" group so it's automatically assigned to any user who's in those groups. This ensures that a user has to at least be a member of one tenant before they can successfully log into the website.

### Application

With the above Auth0 is able to model tenants and enforce overall access to the application. But it's up to the application itself to model _how_ different tenants are accessed. For example, you could use vanity URLs like `tenant1.mycompany.com` or `mycompany.com/tenant1`. Some websites store the current tenant in session only (like the Auth0 dashboard). It's also up to the application to enforce authorization _between_ tenants. But its able to do so using the security claims returned by Auth0 (e.g. `groups: ['tenant1', 'tenant2']`).

There are lots of ways to implement all of this and the approach varies depending on the type of application (regular website, SPA, mobile app). Therefore to keep things simple, we chose to demonstrate this using a regular website (written in Node.js) with a very basic UI. And since its a website and not a SPA or a mobile app, there's no need for a backend API. However, the concepts easily transfer to securing resources within an API.

In this sample the multi-tenant application is implemented using a single website that uses the subdomain vanity URL approach to signify which tenant is being accessed. The website can also be accessed at the root level, which maybe makes sense if a user is first trying to log in:

```
http://yourcompany.com:3000/
```

But specific tenants can be accessed by their subdomain:

```
http://tenant1.yourcompany.com:3000/
```

The website uses the [Passport.js provider for Auth0](https://github.com/auth0/passport-auth0) to perform authentication via the OpenID Connect protocol. This makes it easy to obtain a user profile for a user, which is what is going to carry the `groups` claim, which itself will contain all of the tenants that the user is authorized to access. Different access scenarios are controlled using a set of [tenant middleware functions](lib/tenant.js). The primary endpoints that are secured are the OAuth2 `/callback` (see the [index](routes/index.js) route) and `/user` (see the [user](routes/user.js) route).

### Limitations

If you want to not only use the Authorization Extension to manage which tenant a user belongs to, but also what roles/permissions they have in that tenant, then you need to know that this sample only supports that if each user can only be a member of _one tenant_. This is because the roles/permissions assigned to users are global to all "tenants" you may define in the Groups section. 

A work-around could be to namespace roles/permissions per tenant.

For example:
> If you wanted an "Admin" role and had tenants `tenant1` and `tenant2` you could create the roles `tenant1:Admin` and `tenant2:Admin`

The above solution is probably only manageable if you have a small number of total tenants as well as roles/permissions.

What's really needed to solve the roles/permissions per user per tenant problem is to introduce tenant as a first class entity in the Authorization Extension, or make the extension itself extensible so it could read that kind of information from another extension. The good news is that this issue is being considered by the extension authors and will most likely be addressed in a future release.

## Try

To really see this sample in action, follow the steps in the next few sections to get the sample running locally against your own Auth0 account.

### Auth0 setup

1. Create a new [Regular Web App](https://manage.auth0.com/#/clients) called "Multi-Tenant Website":
   * Allowed Callback URLs: `http://yourcompany.com:3000/callback`
   * Allowed Logout URLs: `http://yourcompany.com:3000/`
   * Application Metadata (Advanced Settings):
     * Key: `required_roles`, Value: `Tenant User`

2. Make sure you have a [database connection](https://manage.auth0.com/#/connections/database) and make sure that connection is enabled for your "Multi-Tenant Website" app

3. Create four [users](https://manage.auth0.com/#/users) in that database connection:
   * `user1@example.com`
   * `user2@example.com`
   * `user3@example.com`
   * `user4@example.com`

4. Create a [rule](https://manage.auth0.com/#/rules) that will only allow users in the `Tenant User` role (which we will configure shortly) to have access to the website. Simply copy the rule sample in the [Create the Rule Enforcing Application Roles](https://auth0.com/docs/extensions/authorization-extension/v2/rules#step-2-create-the-rule-enforcing-application-roles) section of the **Auth0 Authorization** extension docs page and give it a descriptive name like `authorize-applications`.

5. Create a [rule](https://manage.auth0.com/#/rules) that will add custom claims to the ID Token that express the user's groups, roles, and permissions. Use [this sample](https://auth0.com/docs/extensions/authorization-extension/v2/rules#add-custom-claims-to-the-issued-token) in the docs, setting the `namespace` variable to the following:

   ```javascript
   var namespace = 'http://yourcompany.com/claims/';
   ```

### Auth0 Authorization extension setup

1. Install the [Auth0 Authorization](https://auth0.com/docs/extensions/authorization-extension) extension via the [Extensions tab](https://manage.auth0.com/#/extensions) in the Auth0 Dashboard. Then log into the extension.

2. Go to the extension Configuration page (upper-right corner menu) and enable the "Groups" and "Roles" options under the **Token Contents** section. Then click the **Publish Rule** button. This will create another rule that will emit the claims we need in the token.

3. Create a role that will be used to control access to the website:  

   * `Tenant User`: A user that can access a tenant

4. Create two groups that represent two different tenants:
   * `tenant1`: Tenant 1
   * `tenant2`: Tenant 2

5. Add the `Tenant User` role to both groups created in the previous step

6. Add the users `user1@example.com` and `user3@example.com` to the `tenant1` group

7. Add the users `user2@example.com` and `user3@example.com` to the `tenant2` group

   > Note that user `user4@example.com` has not been added to _any_ tenant group

8. Go back to the Auth0 Dashboard [rules tab](https://manage.auth0.com/#/rules) and make sure the rule created by the extension (`auth0-authorization-extension`) is ordered to run _before_ any other rules. If its not, you can drag it to the top.

### Local setup

1. Add the following entries to your `hosts` file (eg. `/etc/hosts`), which will make all the domain names used in this sample resolve to `localhost`:  

   ```
   127.0.0.1  tenant1.yourcompany.com
   127.0.0.1  tenant2.yourcompany.com
   127.0.0.1  yourcompany.com
   ```

2. Create a `.env` file:  

   ```
   AUTH0_CLIENT_ID=client-id
   AUTH0_CLIENT_SECRET=client-secret
   AUTH0_DOMAIN=auth0-domain
   AUTH0_LOGOUT_RETURN_URL=http://yourcompany.com:3000/
   ROOT_DOMAIN=yourcompany.com
   PORT=3000
   ```

   where `client-id`, `client-secret`, `auth0-domain` are the settings from your "Multi-Tenant Website" app

3. Install dependencies  

   ```sh
   npm install
   ```

4. Start the web server  

   ```sh
   npm start
   ```

## Test the sample

To see how this sample handles different users and different tenants, try each one of these scenarios. It's best to try them in new browser sessions (ideally in a private browser like Chrome Incognito Mode).

### Scenario 1: Tenant user logs into root website

1. Browse to the root website: http://yourcompany.com:3000/
2. Log in as `user1@example.com`
3. This user is only a member of one tenant (`tenant1`), so you should automatically be redirected to `tenant1`'s user page (http://tenant1.yourcompany.com:3000/user)

### Scenario 2: Tenant user logs directly into tenant website

1. Browse directly to `tenant1`: http://tenant1.yourcompany.com:3000/
2. Log in as `user1@example.com`
3. Since this user is already a member of `tenant1`, they will remain in that tenant and be redirected to the user page: (http://tenant1.yourcompany.com:3000/user)

### Scenario 3: Multi-tenant user logs into root website

1. Browse to the root website: http://yourcompany.com:3000/
2. Log in as `user3@example.com`
3. This user is a member of both tenants so you will be redirected to a page to choose the desired tenant

### Scenario 4: Multi-tenant user logs directly into tenant website

1. Browse directly to `tenant1`: http://tenant1.yourcompany.com:3000/
2. Log in as `user3@example.com`
3. This scenario has the same outcome as Scenario 2

### Scenario 5: Tenant user logging into disallowed tenant

1. Browse directly to `tenant2`: http://tenant1.yourcompany.com:3000/
2. Log in as `user1@example.com`
3. Since this user not a member of `tenant2` they will be redirected to a page that informs them they don't have access and that they should choose a valid tenant

### Scenario 6: Tenant user navigating to disallowed tenant

1. Browse directly to `tenant1`: http://tenant1.yourcompany.com:3000/
2. Log in as `user1@example.com`
3. Like Scenario 2, the user will be redirected to the `tenant1` user page
4. Browse to `tenant2`'s user page: http://tenant2.yourcompany.com:3000/user
5. Since this user not a member of `tenant2` they will be redirected to a page that informs them they don't have access and that they should choose a valid tenant

### Scenario 7: Non-tenant user attempts to log in

1. Browse to the root website: http://yourcompany.com:3000/
2. Log in as `user4@example.com`
3. This user is not a member of any tenant and will be blocked by Auth0 (via the rule we created in the [Auth0 setup](#auth0-setup) section) from even being able to access the application

## Contributors

Check them out [here](https://github.com/auth0-samples/auth0-cas-server/graphs/contributors)

## Issue Reporting

If you have found a bug or if you have a feature request, please report them at this repository issues section. Please do not report security vulnerabilities on the public GitHub issue tracker. The [Responsible Disclosure Program](https://auth0.com/whitehat) details the procedure for disclosing security issues.

## Author

[Auth0](https://auth0.com)

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more info.
