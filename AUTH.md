# Session Based Authentication
## Short explanation (https://stytch.com/blog/jwts-vs-sessions-which-is-right-for-you/)
A session (cookie) is generated server side and kept in the database. On successful login, said cookie is passed to the client (via header) to be used in place of their username/password.

## Pros
- A session can be easily invalidated (simply delete the record in the db)
- Django's authentication related documentation recommends the use of built-in django sessions.
## Cons
Database queries introduce latency, and don't scale well as number of users and api calls increase.

# JWT Auth
## Short explanation (https://stytch.com/blog/jwts-vs-sessions-which-is-right-for-you/)
Instead of a server generated key, a JWT is a signed/encrypted JSON object containing the information necessary for authentation.

## Pros
- Instead of a database lookup, we simply decrypt the payload and verify the signature.
- Auth credentials not needed for server to server communication. Just generate a token and distribute from one server to another.


## Cons
- It's more difficult to remove the token. Once it is signed, it is valid until expiration. You can replace the signing key, but that would invalidate ALL distributed tokens. You can use something like a cached blocklist to enforce revocation,
but nowhere near as simple as just deleting a db record.
- JWT's need to be periodically refreshed (built in reduction of the above threat). This flow is built into numerous packages, but is still more complicated than a
permanent session cookie that can be revoked at any time.

# Oauth (XXX: needs validation)
## Short explanation
There are numerous Oauth flows, described here (https://auth0.com/docs/get-started/authentication-and-authorization-flow)
## Pros
- Passwordless auth: Since the output of the OAuth process is a random token that does not contain username/password, it can be used to login through another site (i.e., use Google account to log into our app/ SSO)
- Allows us to avoid acting as a middle-man for third party apis. If say, we want to be the bridge to another app with perscription data, we can provide a token to the client for it to make direct api calls.

## Cons
- Complicated
- Requies serverside sessions (db?)
