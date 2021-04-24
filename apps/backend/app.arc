@app
decipad-backend

@http
post /test
get /test/:id

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

@ws

@tables
test
  key *String
  value String

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

@indexes

collabs
  room *String

collabs
  conn *String

#@plugins
#kafka

#@kafka-consumer-groups
#consumer1 topic1 10

# @aws
# profile default
# region us-west-1
