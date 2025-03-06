SELECT
  UserID as Id,
  {{{temporal_fields}}},
  FirstName,
  LastName,
  EmailAddress as Email,
  JSON_ARRAY([OrganisationRole]) as Roles,
  null as CreatedAt,
  UpdatedDateUTC as UpdatedAt
  FROM {{users}}
