SELECT
  CAST(id AS STRING) as Id,
  {{{temporal_fields}}},
  first_name as FirstName,
  last_name as LastName,
  email as Email,
  timezone as TimeZone,
  is_contractor as IsContractor,
  is_active as IsActive,
  roles as Roles,
  weekly_capacity as WeeklyCapacity,
  cost_rate as CostRate,
  default_hourly_rate as DefaultHourlyRate,
  created_at as CreatedAt,
  updated_at as UpdatedAt
  FROM {{users}}
