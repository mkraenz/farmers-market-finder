# Auth0 Setup

- Create an account
- select "Advanced Settings" and choose your region, then click "Next"
- from your email inbox, verify your email address
- back in auth0, click your avatar in the top right corner -> Profile -> enable MFA
- avatar -> Profile -> Theme Preferences -> set `Default Tenant`
- avatar -> Profile -> Theme Preferences -> select `Dark` :)
- Get an [API key](https://auth0.com/docs/secure/tokens/access-tokens/management-api-access-tokens) for using the Management API v2
  - I used a test token.
  - set in `.env`

## Terms

- [Management API v2](https://auth0.com/docs/api/management/v2) = manage your Auth0 account programmatically, so you can automate configuration of your environment
  - only use from a confidential client, such as a server-side application
- Management Dashboard = the auth0 web interface
- Authentication API = manage all aspects of user identity when you use Auth0. It offers endpoints so your users can log in, sign up, log out, access APIs, and more
  - publically accessable
- [Docs about specific endpoints using management api v2 with several programming languages](https://auth0.com/docs/manage-users/organizations/configure-organizations/create-organizations)

## Preparation

- have `curl` and `jq` installed

## Setup Code

As an example, assume your backend runs on `http://localhost:3000/` and your web app on `http://localhost:4000/`.

As we progress in this tutorial, backend needs `AUTH0_AUDIENCE`, `AUTH0_DOMAIN`, and possibly some way to get an auth0 api token to talk to the management api v2 (to verify existence of organizations). Web app needs `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, and `AUTH0_AUDIENCE`.

```sh
# make sure your in the auth0/ directory
cd auth0/

#### setup env vars in your terminal ####
AUTH0_DOMAIN=dev-xs3s7x1ddlcr6zwk.us.auth0.com
AUTH0_BASE_URL=https://$AUTH0_DOMAIN
AUTH0_API_TOKEN=...

AUTHZ_HEADER="Authorization: Bearer $AUTH0_API_TOKEN"

#### Get all Applications (aka Oauth2 client applications)
curl -H $AUTHZ_HEADER $AUTH0_BASE_URL/api/v2/clients | jq

# TODO do i need to get rid of the quotes around the output of jq?
CLIENT_ID=$(curl -H $AUTHZ_HEADER -X POST -H "Content-Type: application/json" -d @./create-client.json $AUTH0_BASE_URL/api/v2/clients | jq .client_id)
echo $CLIENT_ID

```
