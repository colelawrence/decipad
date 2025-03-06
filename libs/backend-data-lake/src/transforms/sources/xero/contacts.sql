SELECT
  ContactID as Id,
  {{{temporal_fields}}},
  Name,
  FirstName,
  LastName,
  AccountNumber,
  (ContactStatus = 'ACTIVE') as IsActive,
  EmailAddress as Email,
  TaxNumber,
  isSupplier,
  isCustomer,
  null as CreatedAt,
  UpdatedDateUTC as UpdatedAt
  FROM {{contacts}}
