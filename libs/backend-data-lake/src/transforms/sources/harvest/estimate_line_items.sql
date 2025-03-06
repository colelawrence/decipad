SELECT
  CAST(JSON_VALUE(line_item.id) as STRING) as Id,
  {{#temporal_fields_from_unnested}}CAST(JSON_VALUE(line_item.id) AS STRING){{/temporal_fields_from_unnested}},
  CAST(id AS STRING) as EstimateId,
  CAST(JSON_VALUE(line_item.project.id) as STRING) as ProjectId,
  JSON_VALUE(line_item.kind.name) as Kind,
  JSON_VALUE(line_item.description) as Description,
  JSON_VALUE(line_item.quantity) as Quantity,
  JSON_VALUE(line_item.unit_price) as UnitPrice,
  JSON_VALUE(line_item.amount) as Amount,
FROM {{estimates}}, UNNEST(JSON_QUERY_ARRAY(line_items)) as line_item
