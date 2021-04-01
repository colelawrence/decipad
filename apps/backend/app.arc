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

userkeys
  id *String
  user_id String

@shared
src src/shared

@plugins
kafka

@kafka-consumer-groups
consumer1 topic1 10

# @aws
# profile default
# region us-west-1
