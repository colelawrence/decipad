SELECT
  CAST(id AS STRING) as Id,
  {{{temporal_fields}}},
  name as Name,
  is_active as IsActive,
  is_default as IsDefault,
  billable_by_default as BillableByDefault,
  default_hourly_rate as DefaultHourlyRate,
  created_at as CreatedAt,
  updated_at as UpdatedAt
  FROM {{tasks}}
