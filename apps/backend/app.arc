@app

decipad-backend


@http

get /graphql
post /graphql

get /api/auth/signin
post /api/auth/signin/:provider
get /api/auth/callback/:provider
get /api/auth/signout
post /api/auth/signout
get /api/auth/session
get /api/auth/csrf
get /api/auth/providers
get /api/auth/error
get /api/auth/token
get /api/auth/verify-request

get /api/syncdoc/:id
put /api/syncdoc/:id
put /api/syncdoc/:id/changes

get /api/invites/:inviteid/accept

get /api/userkeyvalidations/:userkeyvalidationid/validate


@ws


@tables

users
  id *String
  name String
  last_login Number
  image String
  email String
  secret String
  encrypt true

userprofiles
  user_id *String
  github_login String
  encrypt true

userkeys
  id *String
  user_id String
  validated_at Number
  validation_msg_sent_at Number
  encrypt true

userkeyvalidations
  id *String
  userkey_id: String
  expires_at TTL
  encrypt true

syncdoc
  id *String
  latest String
  encrypt true

connections
  id *String
  user_id String
  encrypt true

collabs
  id *String
  user_id String
  encrypt true

permissions
  id *String
  resource_type String
  resource_uri String
  resource_id String
  user_id String
  given_by_user_id String
  type String
  role_id String
  parent_resource_uri String
  parent_permission_id String
  can_comment Boolean
  encrypt true

invites
  id *String
  permission_id String
  resource_type String
  resource_id String
  resource_uri String
  user_id String
  invited_by_user_id String
  permission String
  parent_resource_uri String
  email String
  can_comment Boolean
  expires_at TTL
  encrypt true

verificationrequests
  id *String
  identifier String
  token String
  baseUrl: String
  expires TTL
  encrypt true

workspaces
  id *String
  name String
  encrypt true

workspaceroles
  id *String
  name String
  permission String
  workspace_id String
  encrypt true


@indexes

users
  secret *String
  name bySecret

collabs
  room *String

collabs
  conn *String

invites
  resource_uri *String
  name byResource

invites
  user_id *String
  name byUser

permissions
  resource_uri *String
  name byResource

permissions
  resource_uri *String
  user_id **String
  name byResourceAndUser

permissions
  user_id *String
  resource_type **String
  name byUserId

permissions
  user_id *String
  role_id **String
  name byUserAndRole

permissions
  parent_permission_id *String
  name byParentPermission

userkeys
  user_id *String
  name byUserId

userkeyvalidations
  userkey_id *String
  name byUserKeyId

verificationrequests
  identifier *String
  name byIdentifier

workspaceroles
  workspace_id *String
  name byWorkspaceId


@queues

sendemail
userkeys-changes
permissions-changes


#@plugins
#kafka

#@kafka-consumer-groups
#consumer1 topic1 10


@aws
region eu-west-2
timeout 30