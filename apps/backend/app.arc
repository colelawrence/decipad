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

get /api/workspaces
put /api/workspaces
put /api/workspaces/changes

get /api/workspaces/:workspaceid
put /api/workspaces/:workspaceid
put /api/workspaces/:workspaceid/changes

get /api/workspaces/:workspaceid/pads
put /api/workspaces/:workspaceid/pads
put /api/workspaces/:workspaceid/pads/changes

get /api/pads/:padid
put /api/pads/:padid
put /api/pads/:padid/changes

get /api/pads/:padid/content
put /api/pads/:padid/content
put /api/pads/:padid/content/changes

get /api/invites/:inviteid/accept

get /api/userkeyvalidations/:userkeyvalidationid/validate

@ws


@tables

users
  id *String
  name String
  last_login Number
  avatar String
  email String
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
  encrypt true

teams
  id *String
  name String
  encrypt true

invites
  id *String
  resource_type String
  resource_id String
  user_id String
  invited_by_user_id String
  permission String
  expires_at TTL
  encrypt true


@indexes

collabs
  room *String

collabs
  conn *String

permissions
  resource_uri *String
  name byResource

permissions
  user_id *String
  resource_type **String
  name byUserId

userkeys
  user_id *String
  name byUserId

userkeyvalidations
  userkey_id *String
  name byUserKeyId


@queues

sendemail
userkeys-changes


#@plugins
#kafka

#@kafka-consumer-groups
#consumer1 topic1 10

@aws
region eu-west-2
timeout 30