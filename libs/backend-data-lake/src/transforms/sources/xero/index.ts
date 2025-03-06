import { SourceTransform } from '../types';
import users from './users.sql?raw';
import contacts from './contacts.sql?raw';
import invoices from './invoices.sql?raw';
import bankTransactions from './bank_transactions.sql?raw';
import bankTransfers from './bank_transfers.sql?raw';
import payments from './payments.sql?raw';

export const xero: SourceTransform = {
  realm: 'accounting',
  source: 'xero',
  sourceTableNames: [
    'users',
    'contacts',
    'invoices',
    'bank_transactions',
    'bank_transfers',
    'payments',
  ],
  targetTables: [
    {
      tableName: 'users',
      description: 'Xero users',
      columns: [
        {
          name: 'Id',
          type: 'string',
          isNullable: true,
          description: 'The ID of the user',
        },
        {
          name: 'FirstName',
          type: 'string',
          isNullable: true,
          description: 'The first name of the user',
        },
        {
          name: 'LastName',
          type: 'string',
          isNullable: true,
          description: 'The last name of the user',
        },
        {
          name: 'Email',
          type: 'string',
          isNullable: true,
          description: 'The email of the user',
        },
        {
          name: 'Roles',
          type: 'array',
          isNullable: true,
          description: 'The roles of the user, an array of strings',
          items: {
            type: 'string',
          },
        },
        {
          name: 'CreatedAt',
          type: 'timestamp',
          isNullable: true,
          description: 'The creation date of the user',
        },
        {
          name: 'UpdatedAt',
          type: 'timestamp',
          isNullable: true,
          description: 'The update date of the user',
        },
      ],
    },
    {
      tableName: 'contacts',
      description: 'Xero contacts',
      columns: [
        {
          name: 'Id',
          type: 'string',
          isNullable: true,
          description: 'The ID of the contact',
        },
        {
          name: 'Name',
          type: 'string',
          isNullable: true,
          description: 'The name of the contact',
        },
        {
          name: 'FirstName',
          type: 'string',
          isNullable: true,
          description: 'The first name of the contact',
        },
        {
          name: 'LastName',
          type: 'string',
          isNullable: true,
          description: 'The last name of the contact',
        },
        {
          name: 'Email',
          type: 'string',
          isNullable: true,
          description: 'The email of the contact',
        },
        {
          name: 'IsActive',
          type: 'boolean',
          isNullable: true,
          description: 'Whether the contact is active',
        },
        {
          name: 'AccountNumber',
          type: 'string',
          isNullable: true,
          description: 'The account number of the contact',
        },
        {
          name: 'TaxNumber',
          type: 'string',
          isNullable: true,
          description: 'The tax number of the contact',
        },
        {
          name: 'isSupplier',
          type: 'boolean',
          isNullable: true,
          description: 'Whether the contact is a supplier',
        },
        {
          name: 'isCustomer',
          type: 'boolean',
          isNullable: true,
          description: 'Whether the contact is a customer',
        },
        {
          name: 'CreatedAt',
          type: 'timestamp',
          isNullable: true,
          description: 'The creation date of the contact',
        },
        {
          name: 'UpdatedAt',
          type: 'timestamp',
          isNullable: true,
          description: 'The update date of the contact',
        },
      ],
    },
    {
      tableName: 'invoices',
      description: 'Xero invoices',
      columns: [
        {
          name: 'Id',
          type: 'string',
          isNullable: true,
          description: 'The ID of the invoice',
        },
        {
          name: 'ContactId',
          type: 'string',
          isNullable: true,
          description: 'The ID of the contact',
        },
        {
          name: 'InvoiceNumber',
          type: 'string',
          isNullable: true,
          description: 'The number of the invoice',
        },
        {
          name: 'InvoiceDate',
          type: 'timestamp',
          isNullable: true,
          description: 'The date of the invoice',
        },
        {
          name: 'Reference',
          type: 'string',
          isNullable: true,
          description: 'The reference of the invoice',
        },
        {
          name: 'DueDate',
          type: 'timestamp',
          isNullable: true,
          description: 'The due date of the invoice',
        },
        {
          name: 'IsAccRec',
          type: 'boolean',
          isNullable: true,
          description: 'Whether this is an accounts receivable invoice',
        },
        {
          name: 'IsAccPay',
          type: 'boolean',
          isNullable: true,
          description: 'Whether this is an accounts payable invoice',
        },
        {
          name: 'IsDraft',
          type: 'boolean',
          isNullable: true,
          description: 'Whether the invoice is in draft status',
        },
        {
          name: 'IsAuthorised',
          type: 'boolean',
          isNullable: true,
          description: 'Whether the invoice is authorised',
        },
        {
          name: 'IsPaid',
          type: 'boolean',
          isNullable: true,
          description: 'Whether the invoice is paid',
        },
        {
          name: 'IsVoided',
          type: 'boolean',
          isNullable: true,
          description: 'Whether the invoice is voided',
        },
        {
          name: 'IsDeleted',
          type: 'boolean',
          isNullable: true,
          description: 'Whether the invoice is deleted',
        },
        {
          name: 'SubTotal',
          type: 'number',
          isNullable: true,
          description: 'The subtotal amount of the invoice',
        },
        {
          name: 'TotalTax',
          type: 'number',
          isNullable: true,
          description: 'The total tax amount of the invoice',
        },
        {
          name: 'TotalDiscount',
          type: 'number',
          isNullable: true,
          description: 'The total discount amount of the invoice',
        },
        {
          name: 'Total',
          type: 'number',
          isNullable: true,
          description: 'The total amount of the invoice',
        },
        {
          name: 'AmountPaid',
          type: 'number',
          isNullable: true,
          description: 'The amount paid on the invoice',
        },
        {
          name: 'AmountCredited',
          type: 'number',
          isNullable: true,
          description: 'The amount credited on the invoice',
        },
        {
          name: 'SentToContact',
          type: 'boolean',
          isNullable: true,
          description: 'Whether the invoice has been sent to the contact',
        },
        {
          name: 'FullyPaidOnDate',
          type: 'timestamp',
          isNullable: true,
          description: 'The date the invoice was fully paid',
        },
        {
          name: 'PlannedPaymentDate',
          type: 'timestamp',
          isNullable: true,
          description: 'The planned payment date for the invoice',
        },
        {
          name: 'ExpectedPaymentDate',
          type: 'timestamp',
          isNullable: true,
          description: 'The expected payment date for the invoice',
        },
        {
          name: 'CreatedAt',
          type: 'timestamp',
          isNullable: true,
          description: 'The creation date of the invoice',
        },
        {
          name: 'UpdatedAt',
          type: 'timestamp',
          isNullable: true,
          description: 'The last update date of the invoice',
        },
      ],
    },
    {
      tableName: 'bank_transactions',
      description: 'Xero bank transactions',
      columns: [
        {
          name: 'Id',
          type: 'string',
          isNullable: true,
          description: 'The ID of the bank transaction',
        },
        {
          name: 'IsReceive',
          type: 'boolean',
          isNullable: true,
          description: 'Whether this is a receive transaction',
        },
        {
          name: 'IsSpend',
          type: 'boolean',
          isNullable: true,
          description: 'Whether this is a spend transaction',
        },
        {
          name: 'IsPrePayment',
          type: 'boolean',
          isNullable: true,
          description: 'Whether this is a pre-payment transaction',
        },
        {
          name: 'ContactID',
          type: 'string',
          isNullable: true,
          description: 'The ID of the contact associated with this transaction',
        },
        {
          name: 'TransactionDate',
          type: 'timestamp',
          isNullable: true,
          description: 'The date of the transaction',
        },
        {
          name: 'IsReconciled',
          type: 'boolean',
          isNullable: true,
          description: 'Whether the transaction has been reconciled',
        },
        {
          name: 'Reference',
          type: 'string',
          isNullable: true,
          description: 'The reference for the transaction',
        },
        {
          name: 'SubTotal',
          type: 'number',
          isNullable: true,
          description: 'The subtotal amount of the transaction',
        },
        {
          name: 'TotalTax',
          type: 'number',
          isNullable: true,
          description: 'The total tax amount of the transaction',
        },
        {
          name: 'Total',
          type: 'number',
          isNullable: true,
          description: 'The total amount of the transaction',
        },
        {
          name: 'CurrencyCode',
          type: 'string',
          isNullable: true,
          description: 'The currency code for the transaction',
        },
        {
          name: 'CurrencyRate',
          type: 'number',
          isNullable: true,
          description: 'The exchange rate for the transaction currency',
        },
        {
          name: 'IsAuthorized',
          type: 'boolean',
          isNullable: true,
          description: 'Whether the transaction is authorized',
        },
        {
          name: 'IsDeleted',
          type: 'boolean',
          isNullable: true,
          description: 'Whether the transaction has been deleted',
        },
        {
          name: 'CreatedAt',
          type: 'timestamp',
          isNullable: true,
          description: 'The creation date of the transaction',
        },
        {
          name: 'UpdatedAt',
          type: 'timestamp',
          isNullable: true,
          description: 'The last update date of the transaction',
        },
      ],
    },
    {
      tableName: 'bank_transfers',
      description: 'Xero bank transfers',
      columns: [
        {
          name: 'Id',
          type: 'string',
          isNullable: true,
          description: 'The ID of the bank transfer',
        },
        {
          name: 'Date',
          type: 'timestamp',
          isNullable: true,
          description: 'The date of the bank transfer',
        },
        {
          name: 'CurrencyRate',
          type: 'number',
          isNullable: true,
          description: 'The exchange rate for the transfer',
        },
        {
          name: 'FromBankTransactionID',
          type: 'string',
          isNullable: true,
          description: 'The ID of the source bank transaction',
        },
        {
          name: 'ToBankTransactionID',
          type: 'string',
          isNullable: true,
          description: 'The ID of the destination bank transaction',
        },
        {
          name: 'FromBankAccountID',
          type: 'string',
          isNullable: true,
          description: 'The ID of the source bank account',
        },
        {
          name: 'ToBankAccountID',
          type: 'string',
          isNullable: true,
          description: 'The ID of the destination bank account',
        },
        {
          name: 'CreatedAt',
          type: 'timestamp',
          isNullable: true,
          description: 'The creation date of the bank transfer',
        },
        {
          name: 'UpdatedAt',
          type: 'timestamp',
          isNullable: true,
          description: 'The last update date of the bank transfer',
        },
      ],
    },
    {
      tableName: 'payments',
      description: 'Xero payments',
      columns: [
        {
          name: 'Id',
          type: 'string',
          isNullable: true,
          description: 'The ID of the payment',
        },
        {
          name: 'Date',
          type: 'timestamp',
          isNullable: true,
          description: 'The date of the payment',
        },
        {
          name: 'Amount',
          type: 'number',
          isNullable: true,
          description: 'The amount of the payment',
        },
        {
          name: 'CurrencyRate',
          type: 'number',
          isNullable: true,
          description: 'The exchange rate for the payment currency',
        },
        {
          name: 'IsAuthorized',
          type: 'boolean',
          isNullable: true,
          description: 'Whether the payment is authorized',
        },
        {
          name: 'IsDeleted',
          type: 'boolean',
          isNullable: true,
          description: 'Whether the payment is deleted',
        },
        {
          name: 'Reference',
          type: 'string',
          isNullable: true,
          description: 'The reference for the payment',
        },
        {
          name: 'IsReconciled',
          type: 'boolean',
          isNullable: true,
          description: 'Whether the payment is reconciled',
        },
        {
          name: 'IsAccountsPayablePayment',
          type: 'boolean',
          isNullable: true,
          description: 'Whether this is an accounts payable payment',
        },
        {
          name: 'IsAccountsReceivablePayment',
          type: 'boolean',
          isNullable: true,
          description: 'Whether this is an accounts receivable payment',
        },
        {
          name: 'IsCreditPayment',
          type: 'boolean',
          isNullable: true,
          description: 'Whether this is a credit payment',
        },
        {
          name: 'IsOverpaymentPayment',
          type: 'boolean',
          isNullable: true,
          description: 'Whether this is an overpayment',
        },
        {
          name: 'IsPrepaymentPayment',
          type: 'boolean',
          isNullable: true,
          description: 'Whether this is a prepayment',
        },
        {
          name: 'AccountId',
          type: 'string',
          isNullable: true,
          description: 'The ID of the associated account',
        },
        {
          name: 'InvoiceId',
          type: 'string',
          isNullable: true,
          description: 'The ID of the associated invoice',
        },
        {
          name: 'CreatedAt',
          type: 'timestamp',
          isNullable: true,
          description: 'The creation date of the payment',
        },
        {
          name: 'UpdatedAt',
          type: 'timestamp',
          isNullable: true,
          description: 'The last update date of the payment',
        },
      ],
    },
  ],
  getTargetTableTransformTemplate: (targetTableName) => {
    switch (targetTableName) {
      case 'users': {
        return users;
      }
      case 'contacts': {
        return contacts;
      }
      case 'invoices': {
        return invoices;
      }
      case 'bank_transactions': {
        return bankTransactions;
      }
      case 'bank_transfers': {
        return bankTransfers;
      }
      case 'payments': {
        return payments;
      }
    }
    throw new Error(
      `No transform template found for target table ${targetTableName}`
    );
  },
  sourceIdColumn: (sourceTableName: string) => {
    switch (sourceTableName) {
      case 'users': {
        return 'UserID';
      }
      case 'contacts': {
        return 'ContactID';
      }
      case 'invoices': {
        return 'InvoiceID';
      }
      case 'bank_transactions': {
        return 'BankTransactionID';
      }
      case 'bank_transfers': {
        return 'BankTransferID';
      }
      case 'payments': {
        return 'PaymentID';
      }
    }
    throw new Error(
      `No source ID column found for source table ${sourceTableName}`
    );
  },
};
