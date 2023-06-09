@app
decipad-backend

@sandbox
useAws false
no-hydrate true
livereload false

@sandbox-startup
node scripts/sandbox_seed_db.js

@http
any /*
any /docs
any /docs/*
any /.storybook
any /.storybook/*

any /graphql

get /api/version

post /api/auth/signin/:provider
get /api/auth/callback/:provider
get /api/auth/token
post /api/auth/signout
get /api/auth/*

get /api/invites/:inviteid/accept
get /api/userkeyvalidations/:userkeyvalidationid/validate
get /api/externaldatasources/:id/auth
get /api/externaldatasources/callback
get /api/externaldatasources/:id/data
any /api/externaldatasources/db/:id/data
any /api/ai/generate-sql/:id
any /api/ai/rewrite-paragraph
get /api/pads/:padid/attachments/:attachmentid
post /api/pads/:padid/images
any /api/pads/:padid/export
get /api/pads/:padid/logs
get /api/pads/:padid/backups/export
get /api/pads/:padid
post /api/discord
get /api/ws
get /api/import/url
get /api/clear

@static
folder public

@ws

@tables
users
  id *String
  name String
  description String
  last_login Number
  image String
  email String
  secret String
  encrypt true
  hide_checklist Boolean
  onboarded Boolean

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

connections
  id *String
  room String
  user_id String
  encrypt true
  expires_at TTL

collabs
  id *String
  user_id String
  room String
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
  secret String
  parent_resource_uri String
  parent_permission_id String
  can_comment Boolean
  created_at Number
  encrypt true

invites
  id *String
  permission_id String
  resource_type String
  resource_id String
  resource_uri String
  user_id String
  role_id String
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
  sent: Boolean
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

subscriptions
  id *String
  connection_id String
  user_id String
  gqltype String
  filter String

pads
  id *String
  name String
  icon String
  workspace_id String

sections
  id *String
  name String
  color String
  workspace_id String

tags
  id *String
  tag String
  resource_uri String

usertags
  id *String
  workspace_id String
  user_id String
  tag String

usertaggedresources
  id *String
  user_id String
  tag String
  workspace_id String
  resource_uri String

futurefileattachments
  id *String
  user_id String
  resource_uri String
  filename String
  filetype String
  expires_at TTL

fileattachments
  id *String
  user_id String
  resource_uri String
  filename String
  filetype String
  filesize Number

externaldatasources
  id *String
  padId: String

externaldatasourcekeys
  id *String
  resource_uri String
  user_id String
  status_code String
  expiresAt TTL
  encrypt true

docsync
  id *String

docsyncupdates
  id *String
  seq **String

docsyncsnapshots
  id *String
  docsync_id String
  name String
  data String

allowlist
  id *String

superadminusers
  id *String

usergoals
  id *String # /user/:id/goal/#tag
  user_id String
  fulfilledAt Number

logs
  resource *String
  seq **String
  user_id String
  content String
  expiresAt TTL

secrets
  id *String # /workspace/:id/secret/#name
  workspace_id String
  secret String
  encrypt true

@tables-indexes
users
  secret *String
  name bySecret

connections
  room *String
  name byRoom

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

pads
  workspace_id *String
  sequence **Number
  name byWorkspace

pads
  workspace_id *String
  name byWorkspaceOnly

sections
  workspace_id *String
  name byWorkspace

pads
  section_id *String
  name bySection

permissions
  resource_uri *String
  name byResource

permissions
  resource_uri *String
  user_id **String
  name byResourceAndUser

permissions
  resource_uri *String
  secret **String
  name byResourceAndSecret

permissions
  secret *String
  name bySecret

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

subscriptions
  user_id *String
  gqltype **String
  name byUserAndType

subscriptions
  connection_id *String
  name byConnection

tags
  resource_uri *String
  name byResource

usertags
  user_id *String
  workspace_id **String
  name byUserAndWorkspace

usertaggedresources
  user_id *String
  tag **String
  name byUserAndTag

usertaggedresources
  resource_uri *String
  tag **String
  name byResourceAndTag

usertaggedresources
  resource_uri *String
  user_id **String
  name byResourceAndUser

fileattachments
  resource_uri *String
  name byResource

externaldatasources
  padId *String
  name byPadId

externaldatasourcekeys
  resource_uri *String
  name byResource

usergoals
  user_id *String
  name byUserId

docsyncsnapshots
  docsync_id *String
  name byDocsyncId

docsyncsnapshots
  docsync_id *String
  snapshotName **String
  name byDocsyncIdAndSnapshotName

secrets
  workspace_id *String
  name byWorkspace

@queues
sendemail
notify-subscriptions
userkeys-changes
permissions-changes
pads-changes
tags-changes
usertaggedresources-changes
fileattachments-changes
docsyncupdates-changes
sync-after-connect

@plugins
s3
custom-domain

@aws
region eu-west-2
timeout 60
runtime nodejs16.x
