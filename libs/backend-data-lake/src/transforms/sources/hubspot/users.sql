SELECT
  id as Id,
  {{{temporal_fields}}},
  firstName as FirstName,
  lastName as LastName,
  email as Email,
  teams as Teams,
  createdAt as CreatedAt,
  updatedAt as UpdatedAt
  FROM {{owners}}
