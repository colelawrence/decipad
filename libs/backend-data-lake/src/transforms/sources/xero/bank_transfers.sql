SELECT
  BankTransferID as Id,
  {{{temporal_fields}}},
  Date as Date,
  CurrencyRate as CurrencyRate,

  FromBankTransactionID as FromBankTransactionID,
  ToBankTransactionID as ToBankTransactionID,

  CAST(JSON_VALUE(FromBankAccount.AccountID) AS STRING) as FromBankAccountID,
  CAST(JSON_VALUE(ToBankAccount.AccountID) AS STRING) as ToBankAccountID,

  null as UpdatedAt,
  CreatedDateUTC as CreatedAt,
  FROM {{bank_transfers}}
