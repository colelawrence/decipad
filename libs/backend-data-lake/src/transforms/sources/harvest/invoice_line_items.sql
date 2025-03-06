SELECT
  CAST(JSON_VALUE(line_item.id) AS STRING) as Id,
  {{#temporal_fields_from_unnested}}CAST(JSON_VALUE(line_item.id) AS STRING){{/temporal_fields_from_unnested}},
  CAST(id AS STRING) as InvoiceId,
  CAST(JSON_VALUE(line_item.project.id) AS STRING) as ProjectId,
  JSON_VALUE(line_item.kind.name) as Kind,
  JSON_VALUE(line_item.description) as Description,
  JSON_VALUE(line_item.quantity) as Quantity,
  JSON_VALUE(line_item.unit_price) as UnitPrice,
  JSON_VALUE(line_item.amount) as Amount
FROM {{invoices}}, UNNEST(JSON_QUERY_ARRAY(line_items)) as line_item
