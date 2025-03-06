SELECT
  CAST(id AS STRING) as Id,
  {{{temporal_fields}}},
  name as Name,
  is_active as IsActive,
  unit_name as UnitName,
  unit_price as UnitPrice,
  created_at as CreatedAt,
  updated_at as UpdatedAt
FROM {{expense_categories}}
