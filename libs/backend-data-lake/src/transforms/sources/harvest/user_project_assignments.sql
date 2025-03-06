SELECT
  CAST(id AS STRING) as Id,
  {{{temporal_fields}}},
  CAST(JSON_VALUE(user.id) AS STRING) as UserId,
  CAST(JSON_VALUE(project.id) AS STRING) as ProjectId,
  is_active as IsActive,
  is_project_manager as IsProjectManager,
  use_default_rates as UseDefaultRates,
  hourly_rate as HourlyRate,
  budget as Budget,
  created_at as CreatedAt,
  updated_at as UpdatedAt
  FROM {{user_assignments}}
