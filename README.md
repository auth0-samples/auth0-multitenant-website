# Auth0 Multi-tenant Website Sample

Sample that demonstrates a simple multi-tenant web application that uses the [Authorization extension](https://auth0.com/docs/extensions/authorization-extension) extension to manage tenants with groups.

## Features

* Tenants are decoupled from the Auth0 connections used to store the users
* Users are organized into tenants using logical groups vs. partitioned by Auth0 connections
* Therefore you can store _all_ users (across all tenants) in one Database connection (as shown in the sample) or across multiple connections (eg. some users in the Database connection and some users in an enterprise connection, like AD)
* The multi-tenant application is represented as a single Client in Auth0 (with a single OAuth2 callback endpoint) vs. one client per tenant
* The multi-tenant application is a simple Node.js (Express) app
* A SPA app could also be built in a similar fashion, but a regular web app was simpler to remonstrate

## How it works

(more)

## Try

To see this sample in action following the steps in the next few sections.

### Auth0 setup

1. Create a new Client called "Multi-Tenant Website":
  * Allowed Callback URL: `http://yourcompany.com:3000/callback`

2. Make sure you have a Database Connection and make sure that connection is enabled for the "Multi-Tenant Website" client

3. Create four users in that Database connection:
  * `user1@example.com`
  * `user2@example.com`
  * `user3@example.com`
  * `admin@example.com`

4. Install the [Auth0 Authorization](https://auth0.com/docs/extensions/authorization-extension) extension and perform the following actions:

  1. Create two groups in the extension that represent two different tenants:
    * `tenant1`
    * `tenant2`

  2. Add `user1@example.com` and `admin@example.com` to the `tenant1` group

  3. Add `user2@example.com` and `admin@example.com` to the `tenant2` group

  4. Assign both groups to the "Multi-Tenant Website" application so only users assigned to a tenant are authorized to use the app

### Local setup

1. Add the following entries to your `hosts` file (eg. `/etc/hosts`):  

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
2. Log in as `admin@example.com`
3. This user is a member of both tenants so you will be redirected to a page to choose the desired tenant

### Scenario 4: Multi-tenant user logs directly into tenant website

1. Browse directly to `tenant1`: http://tenant1.yourcompany.com:3000/
2. Log in as `admin@example.com`
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
2. Log in as `user3@example.com`
3. This user is not a member of any tenant and will be blocked by Auth0 (via the Authorization extension) from even being able to access the application

## Contributors

Check them out [here](https://github.com/auth0-samples/auth0-cas-server/graphs/contributors)

## Issue Reporting

If you have found a bug or if you have a feature request, please report them at this repository issues section. Please do not report security vulnerabilities on the public GitHub issue tracker. The [Responsible Disclosure Program](https://auth0.com/whitehat) details the procedure for disclosing security issues.

## Author

[Auth0](https://auth0.com)

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more info.
