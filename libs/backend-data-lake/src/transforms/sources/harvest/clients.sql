SELECT
  CAST(id AS STRING) as Id,
  {{{temporal_fields}}},
  name as Name,
  is_active as IsActive,
  currency as Currency,
  created_at as CreatedAt,
  updated_at as UpdatedAt
  FROM {{clients}}
