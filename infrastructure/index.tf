terraform {
  required_providers {
    auth0 = {
      source  = "auth0/auth0"
      version = "~> 0.49.0"
    }
  }
}

variable "auth0_domain" {
  type = string
  default = "dev-xs3s7x1ddlcr6zwk.us.auth0.com"
}

variable "auth0_client_id" {
  type = string 
}

variable "auth0_client_secret" {
  type = string
}

variable "sendgrid_from_address" {
  type = string
  default = "hello@example.com"
}

variable "sendgrid_api_key" {
  type = string
  default = "fake key"
}

variable "logo_uri" {
  type = string
  default = "https://avatars.githubusercontent.com/u/8503034?v=4"
}

# instead of configuring this provider, you can also follow https://registry.terraform.io/providers/auth0/auth0/latest/docs/guides/quickstart and set AUTHO_DOMAIN, CLIENT_ID, and CLIENT_SECRET as TF_VARS_... env vars
provider "auth0" {
  domain        = var.auth0_domain
  client_id     = var.auth0_client_id
  client_secret = var.auth0_client_secret
  debug         = "false"
}

// ################## Config and general ##################
output "oauth2Issuer" {
  value = "https://${var.auth0_domain}/"
}
output "oauth2OpenIdConfigurationUrl" {
  value = "https://${var.auth0_domain}/.well-known/openid-configuration"
}

// ################## Client Applications ##################

resource "auth0_client" "webapp" {
  name                  = "My First Custom Application"
  description           = "Used by the web appp"
  logo_uri              = "https://avatars.githubusercontent.com/u/8503034?v=4"
  callbacks             = ["http://localhost:3000/"]
  allowed_origins       = ["http://localhost:3000/"]
  web_origins           = ["http://localhost:3000/"]
  allowed_logout_urls   = ["http://localhost:3000/"]
  grant_types           = ["authorization_code"]
  app_type              = "spa"
  is_first_party        = true
  oidc_conformant       = true
  sso                   = true
  sso_disabled          = false
  custom_login_page_on  = false
  initiate_login_uri    = "https://127.0.0.1/"
  organization_usage    = "allow" // individual users AND organization users
  organization_require_behavior = "pre_login_prompt" // TODO: should actually be 'post_login_prompt' but pulumi auth0 provider doesn't support it yet. Does terraform support it? if so, let's create a ticket in https://github.com/pulumi/pulumi-auth0. For some reason, auth0 docs also say post_login_prompt is not supported https://auth0.com/docs/manage-users/organizations/configure-organizations/define-organization-behavior#management-api. The request works however (global search for `Ref set organization_require_behavior to post_login_prompt`). Worst case, I need to use https://developer.hashicorp.com/terraform/language/resources/provisioners/remote-exec
}
resource "auth0_client_credentials" "webapp_credentials" {
  client_id            = auth0_client.webapp.id
  authentication_method = "none" // SPAs are public clients
}

output "oauth2ClientId" {
  value = auth0_client.webapp.client_id
}


// ################## Connections ##################
resource "auth0_connection" "user_db_connection" {
  name     = "user-db"
  strategy = "auth0" // = Auth0-managed database

  options {
    password_policy = "good"
    brute_force_protection = true
    password_dictionary {
      enable = true
    }
    disable_signup = false // allow users to self-register
    disable_self_service_change_password = false
  }

  display_name = "User Database"
}

resource "auth0_connection_clients" "connection_clients" {
  connection_id = auth0_connection.user_db_connection.id
  enabled_clients = [
    auth0_client.webapp.id,
  ]
}

// ################## Resource Server (aka APIs) and Permission scopes ##################

resource "auth0_resource_server" "api" {
  name                 = "market-finder-api"
  identifier           = "farmers-market-api"
  allow_offline_access = false                # no refresh token
  enforce_policies     = true                 # enables 'RBAC'
  token_dialect        = "access_token_authz" # enables 'Add Permissions in the Access Token' https://github.com/auth0/terraform-provider-auth0/issues/257

  # https://github.com/auth0/terraform-provider-auth0/blob/main/MIGRATION_GUIDE.md#:~:text=avoid%20diffing%20issues.-,lifecycle%20%7B,-ignore_changes%20%3D%20%5Bscopes
  lifecycle {
    ignore_changes = [scopes]
  }
}

output "apiOauth2Audience" {
  value = auth0_resource_server.api.identifier
}

resource "auth0_resource_server_scope" "read_markets_all" {
  scope                      = "read:markets:all"
  description                = "Read all markets"
  resource_server_identifier = auth0_resource_server.api.identifier
}
resource "auth0_resource_server_scope" "read_markets_own" {
  scope                      = "read:markets:own"
  description                = "Read own markets, i.e. created by the user herself"
  resource_server_identifier = auth0_resource_server.api.identifier
}
resource "auth0_resource_server_scope" "create_markets" {
  scope                      = "create:markets"
  description                = "create markets"
  resource_server_identifier = auth0_resource_server.api.identifier
}
resource "auth0_resource_server_scope" "delete_markets" {
  scope                      = "delete:markets"
  description                = "delete markets"
  resource_server_identifier = auth0_resource_server.api.identifier
}
resource "auth0_resource_server_scope" "update_markets" {
  scope                      = "update:markets"
  description                = "update markets"
  resource_server_identifier = auth0_resource_server.api.identifier
}

// ################## Roles and Permissions ##################

resource "auth0_role" "admin_role" {
  name        = "admin"
  description = "Administrator"

  # https://github.com/auth0/terraform-provider-auth0/blob/main/MIGRATION_GUIDE.md#:~:text=issues.%0A%09lifecycle%20%7B-,ignore_changes,-%3D%20%5B%20permissions%20%5D%0A%09%7D%0A%7D
  lifecycle {
    ignore_changes = [permissions]
  }
}

resource "auth0_role_permissions" "admin_role_permissions" {
  role_id = auth0_role.admin_role.id
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = auth0_resource_server_scope.read_markets_all.scope
  }
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = auth0_resource_server_scope.read_markets_own.scope
  }
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = auth0_resource_server_scope.create_markets.scope
  }
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = auth0_resource_server_scope.delete_markets.scope
  }
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = auth0_resource_server_scope.update_markets.scope
  }
}

resource "auth0_role" "enduser_role" {
  name        = "enduser"
  description = "Enduser with read-only access to own markets"

  lifecycle {
    ignore_changes = [permissions]
  }
}

resource "auth0_role_permissions" "enduser_role_permissions" {
  role_id = auth0_role.enduser_role.id
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = auth0_resource_server_scope.read_markets_own.scope
  }
}

resource "auth0_organization" "test_organization" {
  name = "test-organization"
  display_name = "Amazing Test Organization"
}

resource "auth0_organization_connection" "test_organization_connection" {
  connection_id = auth0_connection.user_db_connection.id
  organization_id = auth0_organization.test_organization.id
}

output "testOrganizationId" {
  value = auth0_organization.test_organization.id
}


# ################## Custom Domain ##################

# resource "auth0_custom_domain" "custom-domain" {
#   domain = var.custom_domain_name
#   type   = "auth0ManagedCerts"
# }

# ################## Email Provider ##################

resource "auth0_email" "sendgrid-email-provider" {
  name = "sendgrid"

  credentials {
    api_key = var.sendgrid_api_key
  }

  default_from_address = var.sendgrid_from_address
  enabled              = true
}

# ################## Branding and Customization ##################
resource "auth0_branding" "branding" {
  colors {
    primary = "#1f6830"
    page_background = "#142b1a"
  }
  logo_url = var.logo_uri
}

resource "auth0_branding_theme" "branding_theme" {
  display_name = "Farmers Market Green"
  colors {}
  borders {}
  fonts {
    title {
      bold = false
      size = 150
    }
    subtitle {
      bold = false
      size = 87.5
    }
    body_text {
      bold = false
      size = 87.5
    }
    buttons_text {
      bold = false
      size = 100
    }
    input_labels {
      bold = false
      size = 100
    }
    links {
      bold = true
      size = 87.5
    }
  }
  page_background {}
  widget {}
}

resource "auth0_prompt_custom_text" "login_prompt_custom_texts" {
  prompt = "login"
  language = "en"
  body = jsonencode({
    login = {
      alertListTitle = "Alerts"
      buttonText = "Continue"
      description = "Login to"
      editEmailText = "Edit"
      emailPlaceholder = "Email address"
      # double $ is escaped $ in terraform
      federatedConnectionButtonText = "Continue with $${connectionName}"
      footerLinkText = "Sign up"
      footerText = "Don't have an account?"
      forgotPasswordText = "Forgot password?"
      invitationDescription = "Log in to accept $${inviterName}'s invitation to join $${companyName} on $${clientName}."
      invitationTitle = "You've Been Invited!"
      logoAltText = "$${companyName}"
      pageTitle = "Log in | $${clientName}"
      passwordPlaceholder = "Password"
      separatorText = "Or"
      signupActionLinkText = "$${footerLinkText}"
      signupActionText = "$${footerText}"
      title = "Welcome"
      usernamePlaceholder = "Username or email address"
    }
  })
}

resource "auth0_prompt_custom_text" "signup_prompt_custom_texts" {
  prompt = "signup"
  language = "en"
  body = jsonencode({
    signup = {
      title = "Greetings my friend"
    }
  })
}
