SELECT
  PaymentID as Id,
  {{{temporal_fields}}},
  Date as Date,
  Amount as Amount,
  CurrencyRate as CurrencyRate,
  (Status = "Authorized") as isAuthorized,
  (Status = "Deleted") as isDeleted,
  Reference as Reference,
  IsReconciled as IsReconciled,
  (PaymentType = 'ACCPAYPAYMENT' OR PaymentType = 'APCREDITPAYMENT' OR PaymentType = 'APPREPAYMENTPAYMENT' OR PaymentType = 'APOVERPAYMENTPAYMENT') as IsAccountsPayablePayment,
  (PaymentType = 'ACCRECPAYMENT' OR PaymentType = 'ARCREDITPAYMENT' OR PaymentType = 'AROVERPAYMENTPAYMENT' OR PaymentType = 'ARPREPAYMENTPAYMENT') as IsAccountsReceivablePayment,
  (PaymentType = 'ARCREDITPAYMENT' OR PaymentType = 'APCREDITPAYMENT') as IsCreditPayment,
  (PaymentType = 'AROVERPAYMENTPAYMENT' Or PaymentType = 'APOVERPAYMENTPAYMENT') as IsOverpaymentPayment,
  (PaymentType = 'ARPREPAYMENTPAYMENT' OR PaymentType = 'APPREPAYMENTPAYMENT') as isPrepaymentPayment,

  CAST(JSON_VALUE(Account.AccountID) AS STRING) as AccountId,
  CAST(JSON_VALUE(Invoice.InvoiceID) AS STRING) as InvoiceId,
  
  UpdatedDateUTC as UpdatedAt,
  null as CreatedAt,
  FROM {{payments}}
