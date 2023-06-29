import * as auth0 from '@pulumi/auth0';
import * as pulumi from '@pulumi/pulumi';

/**
 * Guide terraformify Auth0 https://auth0.com/blog/use-terraform-to-manage-your-auth0-configuration/
 */

// ################## Config and general ##################
const config = new pulumi.Config();
const auth0Config = new pulumi.Config('auth0');
const auth0Domain = auth0Config.require('domain');
const logoUri = 'https://avatars.githubusercontent.com/u/8503034?v=4';
// const logoUri = config.require('logoUri');
// const sendgridApiKey = config.requireSecret('sendgridApiKey');
// const sendgridFromAddress = config.require('sendgridFromAddress');
const sendgridApiKey = 'fake-key';
const sendgridFromAddress = 'hello@example.com';
const customDomainName = config.get('customDomainName');

export const oauth2Issuer = pulumi.interpolate`https://${auth0Domain}/`;
export const oauth2OpenIdConfigurationUrl = pulumi.interpolate`https://${auth0Domain}/.well-known/openid-configuration`;

// ################## Client Applications ##################
const client = new auth0.Client('WebApp', {
  name: 'My First Custom Application',
  description: 'Used by the web appp',
  logoUri,
  callbacks: ['http://localhost:3000/'],
  allowedOrigins: ['http://localhost:3000/'],
  webOrigins: ['http://localhost:3000/'],
  allowedLogoutUrls: ['http://localhost:3000/'],
  grantTypes: ['authorization_code'],
  appType: 'spa',
  isFirstParty: true,
  oidcConformant: true,
  sso: true,
  ssoDisabled: false,
  customLoginPageOn: false,
  initiateLoginUri: 'https://127.0.0.1/',
  organizationUsage: 'allow', // individual users AND organization users
  organizationRequireBehavior: 'pre_login_prompt', // TODO: should actually be 'post_login_prompt' but pulumi auth0 provider doesn't support it yet. Does terraform support it? if so, let's create a ticket in https://github.com/pulumi/pulumi-auth0. For some reason, auth0 docs also say post_login_prompt is not supported https://auth0.com/docs/manage-users/organizations/configure-organizations/define-organization-behavior#management-api. The request works however (global search for `Ref set organization_require_behavior to post_login_prompt`). Worst case, I need to use https://developer.hashicorp.com/terraform/language/resources/provisioners/remote-exec
  // tokenEndpointAuthMethod: 'none', // deprecated, https://github.com/auth0/terraform-provider-auth0/blob/main/MIGRATION_GUIDE.md
});

const clientCredentials = new auth0.ClientCredentials('webapp-credentials', {
  clientId: client.id,
  authenticationMethod: 'none', // SPAs are public clients
});

// ################## Connections ##################
const connection = new auth0.Connection('user-db-connection', {
  name: 'user-db',
  strategy: 'auth0', // = Auth0-managed database
  options: {
    passwordPolicy: 'good',
    bruteForceProtection: true,
    passwordDictionary: {
      enable: true,
    },
    disableSignup: false, // allow users to self-register
    disableSelfServiceChangePassword: false,
  },
  displayName: 'User Database',
});
new auth0.ConnectionClients('user-db-connection-clients', {
  connectionId: connection.id,
  enabledClients: [client.id],
});

export const clientId = client.clientId;

// ################## Resource Server (aka APIs) and Permission scopes ##################
const api = new auth0.ResourceServer(
  'api',
  {
    identifier: 'farmers-market-api',
    name: 'Farmers Market API',
    allowOfflineAccess: false, // no refresh token
    enforcePolicies: true, // enables 'RBAC'
    tokenDialect: 'access_token_authz', // enables 'Add Permissions in the Access Token' https://github.com/auth0/terraform-provider-auth0/issues/257
  },
  {
    ignoreChanges: ['scopes'], // following https://github.com/auth0/terraform-provider-auth0/blob/main/MIGRATION_GUIDE.md#role-permissions:~:text=ignore_changes%20%3D%20%5Bscopes%5D
  },
);
export const apiOauth2Audience = api.identifier;

const apiPermissions = new auth0.ResourceServerScopes('api-scopes', {
  resourceServerIdentifier: api.identifier,
  scopes: [
    { name: 'read:markets:all', description: 'Read all markets' },
    {
      name: 'read:markets:own',
      description: 'Read own markets, i.e. created by the user herself',
    },
    { name: 'create:markets', description: 'create markets' },
    { name: 'delete:markets', description: 'delete markets' },
    { name: 'update:markets', description: 'update markets' },
  ],
});

// ################## Roles and Permissions ##################
const adminRole = new auth0.Role(
  'admin-role',
  {
    description: 'Administrator',
    name: 'admin',
  },
  {
    ignoreChanges: ['permissions'], // following https://github.com/auth0/terraform-provider-auth0/blob/main/MIGRATION_GUIDE.md#role-permissions:~:text=ignore_changes%20%3D%20%5B%20permissions%20%5D
  },
);
const adminRolePermissions = new auth0.RolePermissions(
  'admin-role-permissions',
  {
    roleId: adminRole.id,
    permissions: apiPermissions.scopes.apply((scopes) =>
      scopes.map((s) => ({
        name: s.name,
        resourceServerIdentifier: api.identifier,
      })),
    ),
  },
);
export const adminRoleId = adminRole.id;
export const adminRoleName = adminRole.name;

const enduserRole = new auth0.Role(
  'enduser-role',
  {
    description: 'Enduser with read-only access',
    name: 'enduser',
  },
  {
    ignoreChanges: ['permissions'], // following https://github.com/auth0/terraform-provider-auth0/blob/main/MIGRATION_GUIDE.md#role-permissions:~:text=ignore_changes%20%3D%20%5B%20permissions%20%5D
  },
);
const enduserPermissions = new auth0.RolePermissions(
  'enduser-role-permissions',
  {
    roleId: enduserRole.id,
    permissions: apiPermissions.scopes.apply(
      (scopes) =>
        scopes
          .map((s) => ({
            name: s.name,
            resourceServerIdentifier: api.identifier,
          }))
          .filter((p) => p.name.startsWith('read:')), // only allow read permissions
    ),
  },
);
export const enduserRoleId = enduserRole.id;
export const enduserRoleName = enduserRole.name;

// ################## Test organization ##################
const testOrganization = new auth0.Organization('test-org', {
  name: 'test-organization',
  displayName: 'Amazing Test Organization',
});
export const testOrganizationId = testOrganization.id;
export const testOrganizationName = testOrganization.name;

const testOrganizationConnection = new auth0.OrganizationConnection(
  'test-org-connection',
  {
    connectionId: connection.id,
    organizationId: testOrganization.id,
  },
);

// ################## BRANDING AND CUSTOMIZATION ##################
const branding = new auth0.Branding('branding', {
  colors: {
    primary: '#1f6830',
    pageBackground: '#142b1a',
  },
  logoUrl: logoUri,
});

// TODO get the
new auth0.BrandingTheme('branding-theme', {
  displayName: 'Farmers Market Green',
  colors: {},
  borders: {},
  fonts: {
    title: {
      bold: false,
      size: 150,
    },
    subtitle: {
      bold: false,
      size: 87.5,
    },
    bodyText: {
      bold: false,
      size: 87.5,
    },
    buttonsText: {
      bold: false,
      size: 100,
    },
    inputLabels: {
      bold: false,
      size: 100,
    },
    links: {
      bold: true,
      size: 87.5,
    },
  },
  pageBackground: {},
  widget: {},
});

// to get a complete list of what prompts are available and what translations keys the selected prompt support, visit https://manage.auth0.com/dashboard/<region>/<your auth0 tenant>/custom_text (in UI -> Branding -> Universal Login -> Advanced Options -> Custom Text -> select Prompt -> Raw JSON)
const loginPromptCustomTexts = new auth0.PromptCustomText(
  'login-prompt-custom-texts',
  {
    prompt: 'login',
    language: 'en',
    body: JSON.stringify({
      login: {
        alertListTitle: 'Alerts',
        buttonText: 'Continue',
        description: 'Login to',
        editEmailText: 'Edit',
        emailPlaceholder: 'Email address',
        federatedConnectionButtonText: 'Continue with ${connectionName}',
        footerLinkText: 'Sign up',
        footerText: "Don't have an account?",
        forgotPasswordText: 'Forgot password?',
        invitationDescription:
          "Log in to accept ${inviterName}'s invitation to join ${companyName} on ${clientName}.",
        invitationTitle: "You've Been Invited!",
        logoAltText: '${companyName}',
        pageTitle: 'Log in | ${clientName}',
        passwordPlaceholder: 'Password',
        separatorText: 'Or',
        signupActionLinkText: '${footerLinkText}',
        signupActionText: '${footerText}',
        title: 'Welcome',
        usernamePlaceholder: 'Username or email address',
      },
    }),
  },
);
const signupPromptCustomTexts = new auth0.PromptCustomText(
  'signup-prompt-custom-texts',
  {
    prompt: 'signup',
    language: 'en',
    body: JSON.stringify({
      signup: {
        title: 'Greetings my friend',
      },
    }),
  },
);

// ################## Email Provider ##################

// https://www.pulumi.com/registry/packages/auth0/api-docs/email/
const sendgridEmailProvider = new auth0.Email('sendgrid-email-provider', {
  name: 'sendgrid',
  credentials: {
    apiKey: sendgridApiKey,
  },
  defaultFromAddress: sendgridFromAddress,
  enabled: true,
});

// ################## Custom Domain ##################

if (customDomainName) {
  const customDomain = new auth0.CustomDomain('custom-domain', {
    domain: customDomainName,
    type: 'auth0ManagedCerts',
  });
}
