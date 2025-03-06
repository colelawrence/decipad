import { SourceTransform } from '../types';
import users from './users.sql?raw';
import clients from './clients.sql?raw';
import projects from './projects.sql?raw';
import userProjectAssignments from './user_project_assignments.sql?raw';
import tasks from './tasks.sql?raw';
import timeEntries from './time_entries.sql?raw';
import invoices from './invoices.sql?raw';
import invoiceLineItems from './invoice_line_items.sql?raw';
import estimates from './estimates.sql?raw';
import estimateLineItems from './estimate_line_items.sql?raw';
import expenseCategories from './expense_categories.sql?raw';
import expenses from './expenses.sql?raw';

export const harvest: SourceTransform = {
  realm: 'timetracking',
  source: 'harvest',
  sourceTableNames: [
    'users',
    'clients',
    'projects',
    'user_assignments',
    'tasks',
    'time_entries',
    'invoices',
    'estimates',
    'expense_categories',
    'expenses',
  ],
  targetTables: [
    {
      tableName: 'users',
      description: 'time-tracking system users',
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
          name: 'TimeZone',
          type: 'string',
          isNullable: true,
          description: 'The time zone of the user',
        },
        {
          name: 'IsContractor',
          type: 'boolean',
          isNullable: true,
          description: 'true if the user is a contractor',
        },
        {
          name: 'IsActive',
          type: 'boolean',
          isNullable: true,
          description: 'true if the user is active',
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
          name: 'WeeklyCapacity',
          type: 'number',
          isNullable: true,
          description:
            'The number of hours per week this person is available to work in seconds',
        },
        {
          name: 'CostRate',
          type: 'number',
          isNullable: true,
          description:
            'The cost rate to use for this user when calculating a project’s costs vs billable amount',
        },
        {
          name: 'DefaultHourlyRate',
          type: 'number',
          isNullable: true,
          description:
            'The billable rate to use for this user when they are added to a project',
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
      tableName: 'clients',
      description: 'Clients we work for',
      columns: [
        {
          name: 'Id',
          type: 'string',
          isNullable: true,
          description: 'The ID of the client',
        },
        {
          name: 'Name',
          type: 'string',
          isNullable: true,
          description: 'The name of the client',
        },
        {
          name: 'IsActive',
          type: 'boolean',
          isNullable: true,
          description: 'true if the client is active',
        },
        {
          name: 'Currency',
          type: 'string',
          isNullable: true,
          description: 'The currency of the client',
        },
        {
          name: 'CreatedAt',
          type: 'timestamp',
          isNullable: true,
          description: 'The creation date of the client',
        },
        {
          name: 'UpdatedAt',
          type: 'timestamp',
          isNullable: true,
          description: 'The update date of the client',
        },
      ],
    },
    {
      tableName: 'projects',
      description: 'projects to track time against',
      columns: [
        {
          name: 'Id',
          type: 'string',
          isNullable: true,
          description: 'The ID of the client',
        },
        {
          name: 'ClientId',
          type: 'string',
          isNullable: true,
          description: 'The ID of the client',
        },
        {
          name: 'Name',
          type: 'string',
          isNullable: true,
          description: 'The name of the project',
        },
        {
          name: 'Code',
          type: 'string',
          isNullable: true,
          description: 'The code associated with the project',
        },
        {
          name: 'IsActive',
          type: 'boolean',
          isNullable: true,
          description: 'true if the project is active',
        },
        {
          name: 'IsBillable',
          type: 'boolean',
          isNullable: true,
          description: 'true if the project is billable',
        },
        {
          name: 'IsFixedFee',
          type: 'boolean',
          isNullable: true,
          description: 'true if the project is fixed fee',
        },
        {
          name: 'BillBy',
          type: 'string',
          isNullable: true,
          description: 'The billing method of the project',
        },
        {
          name: 'HourlyRate',
          type: 'number',
          isNullable: true,
          description: 'The hourly rate of the project',
        },
        {
          name: 'HoursBudget',
          type: 'number',
          isNullable: true,
          description: 'The budget of the project in hours',
        },
        {
          name: 'BudgetBy',
          type: 'string',
          isNullable: true,
          description: 'The budget method of the project',
        },
        {
          name: 'CostBudget',
          type: 'number',
          isNullable: true,
          description: 'The budget of the project in money',
        },
        {
          name: 'Fee',
          type: 'number',
          isNullable: true,
          description: 'The fee of the project',
        },
        {
          name: 'StartsOn',
          type: 'timestamp',
          isNullable: true,
          description: 'The start date of the project',
        },
        {
          name: 'EndsOn',
          type: 'timestamp',
          isNullable: true,
          description: 'The end date of the project',
        },
        {
          name: 'CreatedAt',
          type: 'timestamp',
          isNullable: true,
          description: 'The creation date of the client',
        },
        {
          name: 'UpdatedAt',
          type: 'timestamp',
          isNullable: true,
          description: 'The update date of the client',
        },
      ],
    },
    {
      tableName: 'user_project_assignments',
      description: 'user assignments to projects',
      columns: [
        {
          name: 'Id',
          type: 'string',
          isNullable: true,
          description: 'The ID of the user project assignment',
        },
        {
          name: 'UserId',
          type: 'string',
          isNullable: true,
          description: 'The ID of the user',
        },
        {
          name: 'ProjectId',
          type: 'string',
          isNullable: true,
          description: 'The ID of the project',
        },
        {
          name: 'IsActive',
          type: 'boolean',
          isNullable: true,
          description: 'true if the user assignment to this project is active',
        },
        {
          name: 'IsProjectManager',
          type: 'boolean',
          isNullable: true,
          description: 'true if the user is a project manager on this project',
        },
        {
          name: 'UseDefaultRates',
          type: 'boolean',
          isNullable: true,
          description:
            "Determines which billable rate(s) will be used on the project for this user when bill_by is People. When true, the project will use the user's default billable rates. When false, the project will use the custom rate defined on this user assignment.",
        },
        {
          name: 'HourlyRate',
          type: 'number',
          isNullable: true,
          description:
            "Custom rate used when the project's bill_by is People and use_default_rates is false",
        },
        {
          name: 'Budget',
          type: 'number',
          isNullable: true,
          description: "Budget used when the project's budget_by is person.",
        },
        {
          name: 'CreatedAt',
          type: 'timestamp',
          isNullable: true,
          description: 'The creation date of the user assignment',
        },
        {
          name: 'UpdatedAt',
          type: 'timestamp',
          isNullable: true,
          description: 'The update date of the user assignment',
        },
      ],
    },
    {
      tableName: 'tasks',
      description: 'tasks to track time against',
      columns: [
        {
          name: 'Id',
          type: 'string',
          isNullable: true,
          description: 'The ID of the task',
        },
        {
          name: 'Name',
          type: 'string',
          isNullable: true,
          description: 'The name of the task',
        },
        {
          name: 'IsActive',
          type: 'boolean',
          isNullable: true,
          description: 'true if the task is active',
        },
        {
          name: 'IsDefault',
          type: 'boolean',
          isNullable: true,
          description: 'true if the task is the default task for the project',
        },
        {
          name: 'BillableByDefault',
          type: 'boolean',
          isNullable: true,
          description: 'true if the task is billable by default',
        },
        {
          name: 'DefaultHourlyRate',
          type: 'number',
          isNullable: true,
          description: 'The default hourly rate for the task',
        },
        {
          name: 'CreatedAt',
          type: 'timestamp',
          isNullable: true,
          description: 'The creation date of the task',
        },
        {
          name: 'UpdatedAt',
          type: 'timestamp',
          isNullable: true,
          description: 'The update date of the task',
        },
      ],
    },
    {
      tableName: 'time_entries',
      description: 'time entries to track time against',
      columns: [
        {
          name: 'UserId',
          type: 'string',
          isNullable: true,
          description: 'The ID of the user',
        },
        {
          name: 'TaskId',
          type: 'string',
          isNullable: true,
          description: 'The ID of the task',
        },
        {
          name: 'ProjectId',
          type: 'string',
          isNullable: true,
          description: 'The ID of the project',
        },
        {
          name: 'UserProjectAssignmentId',
          type: 'string',
          isNullable: true,
          description: 'The ID of the user project assignment',
        },
        {
          name: 'ClientId',
          type: 'string',
          isNullable: true,
          description: 'The ID of the client',
        },
        {
          name: 'SpentDate',
          type: 'timestamp',
          isNullable: true,
          description: 'The date the time was spent',
        },
        {
          name: 'Hours',
          type: 'number',
          isNullable: true,
          description: 'The number of hours spent',
        },
        {
          name: 'RoundedHours',
          type: 'number',
          isNullable: true,
          description: 'The rounded number of hours spent',
        },
        {
          name: 'StartedTime',
          type: 'timestamp',
          isNullable: true,
          description:
            'Time the time entry was started (if tracking by start/end times)',
        },
        {
          name: 'EndedTime',
          type: 'timestamp',
          isNullable: true,
          description:
            'Time the time entry was ended (if tracking by start/end times)',
        },
        {
          name: 'IsRunning',
          type: 'boolean',
          isNullable: true,
          description: 'true if the time entry is running',
        },
        {
          name: 'IsBillable',
          type: 'boolean',
          isNullable: true,
          description: 'true if the time entry is billable',
        },
        {
          name: 'IsBudgeted',
          type: 'boolean',
          isNullable: true,
          description:
            'Whether or not the time entry counts towards the project budget',
        },
        {
          name: 'BillableRate',
          type: 'number',
          isNullable: true,
          description: 'The billable rate of the time entry',
        },
        {
          name: 'CostRate',
          type: 'number',
          isNullable: true,
          description: 'The cost rate of the time entry',
        },
        {
          name: 'IsLocked',
          type: 'boolean',
          isNullable: true,
          description: 'true if the time entry is locked',
        },
        {
          name: 'IsClosed',
          type: 'boolean',
          isNullable: true,
          description: 'true if the time entry is closed',
        },
        {
          name: 'IsBilled',
          type: 'boolean',
          isNullable: true,
          description: 'true if the time entry has been invoiced',
        },
        {
          name: 'InvoiceId',
          type: 'string',
          isNullable: true,
          description: 'The ID of the invoice',
        },
        {
          name: 'CreatedAt',
          type: 'timestamp',
          isNullable: true,
          description: 'The creation date of the time entry',
        },
        {
          name: 'UpdatedAt',
          type: 'timestamp',
          isNullable: true,
          description: 'The update date of the time entry',
        },
      ],
    },
    {
      tableName: 'invoices',
      description: 'invoices',
      columns: [
        {
          name: 'Id',
          type: 'string',
          isNullable: true,
          description: 'The ID of the invoice',
        },
        {
          name: 'Number',
          type: 'string',
          isNullable: true,
          description: 'The number of the invoice',
        },
        {
          name: 'Subject',
          type: 'string',
          isNullable: true,
          description: 'The subject of the invoice',
        },
        {
          name: 'IssueDate',
          type: 'timestamp',
          isNullable: true,
          description: 'The issue date of the invoice',
        },
        {
          name: 'State',
          type: 'string',
          isNullable: true,
          description:
            'The current state of the invoice: draft, open, paid, or closed',
        },
        {
          name: 'ClientId',
          type: 'string',
          isNullable: true,
          description: 'The ID of the client',
        },
        {
          name: 'EstimateId',
          type: 'string',
          isNullable: true,
          description: 'The ID of the estimate',
        },
        {
          name: 'RetainerId',
          type: 'string',
          isNullable: true,
          description: 'The ID of the retainer',
        },
        {
          name: 'CreatedByUserId',
          type: 'string',
          isNullable: true,
          description: 'The ID of the user who created the invoice',
        },
        {
          name: 'PeriodStart',
          type: 'timestamp',
          isNullable: true,
          description: 'The start date of the invoice period',
        },
        {
          name: 'PeriodEnd',
          type: 'timestamp',
          isNullable: true,
          description: 'The end date of the invoice period',
        },
        {
          name: 'Amount',
          type: 'number',
          isNullable: true,
          description: 'The amount of the invoice',
        },
        {
          name: 'DueAmount',
          type: 'number',
          isNullable: true,
          description: 'The amount of the invoice that is due',
        },
        {
          name: 'TaxAmount',
          type: 'number',
          isNullable: true,
          description: 'The amount of the invoice that is tax',
        },
        {
          name: 'Currency',
          type: 'string',
          isNullable: true,
          description: 'The currency of the invoice',
        },
        {
          name: 'DueDate',
          type: 'timestamp',
          isNullable: true,
          description: 'The due date of the invoice',
        },
        {
          name: 'SentAt',
          type: 'timestamp',
          isNullable: true,
          description: 'The date the invoice was sent',
        },
        {
          name: 'PaidAt',
          type: 'timestamp',
          isNullable: true,
          description: 'The date the invoice was paid',
        },
        {
          name: 'ClosedAt',
          type: 'timestamp',
          isNullable: true,
          description: 'The date the invoice was closed',
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
          description: 'The update date of the invoice',
        },
      ],
    },
    {
      tableName: 'invoice_line_items',
      description: 'invoice line items',
      columns: [
        {
          name: 'InvoiceId',
          type: 'string',
          isNullable: true,
          description: 'The ID of the invoice',
        },
        {
          name: 'ProjectId',
          type: 'string',
          isNullable: true,
          description: 'The ID of the project',
        },
        {
          name: 'Kind',
          type: 'string',
          isNullable: true,
          description: 'The kind of the invoice line item',
        },
        {
          name: 'Description',
          type: 'string',
          isNullable: true,
          description: 'The description of the invoice line item',
        },
        {
          name: 'Quantity',
          type: 'number',
          isNullable: true,
          description: 'The quantity of the invoice line item',
        },
        {
          name: 'UnitPrice',
          type: 'number',
          isNullable: true,
          description: 'The unit price of the invoice line item',
        },
        {
          name: 'Amount',
          type: 'number',
          isNullable: true,
          description: 'The amount of the invoice line item',
        },
      ],
    },
    {
      tableName: 'estimates',
      description: 'estimates',
      columns: [
        {
          name: 'Id',
          type: 'string',
          isNullable: true,
          description: 'The ID of the estimate',
        },
        {
          name: 'Subject',
          type: 'string',
          isNullable: true,
          description: 'The subject of the estimate',
        },
        {
          name: 'IssueDate',
          type: 'timestamp',
          isNullable: true,
          description: 'The issue date of the estimate',
        },
        {
          name: 'State',
          type: 'string',
          isNullable: true,
          description:
            'The current state of the estimate: draft, sent, accepted, or declined',
        },
        {
          name: 'ClientId',
          type: 'string',
          isNullable: true,
          description: 'The ID of the client',
        },
        {
          name: 'CreatedByUserId',
          type: 'string',
          isNullable: true,
          description: 'The ID of the user who created the estimate',
        },
        {
          name: 'Amount',
          type: 'number',
          isNullable: true,
          description: 'The amount of the estimate',
        },
        {
          name: 'TaxAmount',
          type: 'number',
          isNullable: true,
          description: 'The amount of the estimate that is tax',
        },
        {
          name: 'Currency',
          type: 'string',
          isNullable: true,
          description: 'The currency of the estimate',
        },
        {
          name: 'SentAt',
          type: 'timestamp',
          isNullable: true,
          description: 'The date the estimate was sent',
        },
        {
          name: 'AcceptedAt',
          type: 'timestamp',
          isNullable: true,
          description: 'The date the estimate was accepted',
        },
        {
          name: 'DeclinedAt',
          type: 'timestamp',
          isNullable: true,
          description: 'The date the estimate was declined',
        },
        {
          name: 'CreatedAt',
          type: 'timestamp',
          isNullable: true,
          description: 'The creation date of the estimate',
        },
        {
          name: 'UpdatedAt',
          type: 'timestamp',
          isNullable: true,
          description: 'The update date of the estimate',
        },
      ],
    },
    {
      tableName: 'estimate_line_items',
      description: 'estimate line items',
      columns: [
        {
          name: 'EstimateId',
          type: 'string',
          isNullable: true,
          description: 'The ID of the estimate',
        },
        {
          name: 'ProjectId',
          type: 'string',
          isNullable: true,
          description: 'The ID of the project',
        },
        {
          name: 'Kind',
          type: 'string',
          isNullable: true,
          description: 'The kind of the estimate line item',
        },
        {
          name: 'Description',
          type: 'string',
          isNullable: true,
          description: 'The description of the estimate line item',
        },
        {
          name: 'Quantity',
          type: 'number',
          isNullable: true,
          description: 'The quantity of the estimate line item',
        },
        {
          name: 'UnitPrice',
          type: 'number',
          isNullable: true,
          description: 'The unit price of the estimate line item',
        },
        {
          name: 'Amount',
          type: 'number',
          isNullable: true,
          description: 'The amount of the estimate line item',
        },
      ],
    },
    {
      tableName: 'expense_categories',
      description: 'expense categories',
      columns: [
        {
          name: 'Id',
          type: 'string',
          isNullable: true,
          description: 'The ID of the expense category',
        },
        {
          name: 'Name',
          type: 'string',
          isNullable: true,
          description: 'The name of the expense category',
        },
        {
          name: 'IsActive',
          type: 'boolean',
          isNullable: true,
          description: 'Whether the expense category is active',
        },
        {
          name: 'UnitName',
          type: 'string',
          isNullable: true,
          description: 'The unit name of the expense category',
        },
        {
          name: 'UnitPrice',
          type: 'number',
          isNullable: true,
          description: 'The unit price of the expense category',
        },
        {
          name: 'CreatedAt',
          type: 'timestamp',
          isNullable: true,
          description: 'The creation date of the expense category',
        },
        {
          name: 'UpdatedAt',
          type: 'timestamp',
          isNullable: true,
          description: 'The update date of the expense category',
        },
      ],
    },
    {
      tableName: 'expenses',
      description: 'expenses',
      columns: [
        {
          name: 'Id',
          type: 'string',
          isNullable: true,
          description: 'The ID of the expense',
        },
        {
          name: 'ClientId',
          type: 'string',
          isNullable: true,
          description: 'The ID of the client',
        },
        {
          name: 'ProjectId',
          type: 'string',
          isNullable: true,
          description: 'The ID of the project',
        },
        {
          name: 'ExpenseCategoryId',
          type: 'string',
          isNullable: true,
          description: 'The ID of the expense category',
        },
        {
          name: 'CreatedByUserId',
          type: 'string',
          isNullable: true,
          description: 'The ID of the user who created the expense',
        },
        {
          name: 'UserProjectAssignmentId',
          type: 'string',
          isNullable: true,
          description: 'The ID of the user project assignment',
        },
        {
          name: 'InvoiceId',
          type: 'string',
          isNullable: true,
          description: 'The ID of the invoice',
        },
        {
          name: 'UnitQuantity',
          type: 'number',
          isNullable: true,
          description: 'The quantity of units of the expense',
        },
        {
          name: 'TotalCost',
          type: 'number',
          isNullable: true,
          description: 'The total cost of the expense',
        },
        {
          name: 'IsBillable',
          type: 'boolean',
          isNullable: true,
          description: 'Whether the expense is billable',
        },
        {
          name: 'IsClosed',
          type: 'boolean',
          isNullable: true,
          description: 'Whether the expense is closed',
        },
        {
          name: 'IsLocked',
          type: 'boolean',
          isNullable: true,
          description: 'Whether the expense is locked',
        },
        {
          name: 'IsBilled',
          type: 'boolean',
          isNullable: true,
          description: 'Whether the expense is billed',
        },
        {
          name: 'SpentDate',
          type: 'timestamp',
          isNullable: true,
          description: 'The date the expense was spent',
        },
        {
          name: 'CreatedAt',
          type: 'timestamp',
          isNullable: true,
          description: 'The creation date of the expense',
        },
        {
          name: 'UpdatedAt',
          type: 'timestamp',
          isNullable: true,
          description: 'The update date of the expense',
        },
      ],
    },
  ],
  getTargetTableTransformTemplate: (targetTableName) => {
    switch (targetTableName) {
      case 'users': {
        return users;
      }
      case 'clients': {
        return clients;
      }
      case 'projects': {
        return projects;
      }
      case 'user_project_assignments': {
        return userProjectAssignments;
      }
      case 'tasks': {
        return tasks;
      }
      case 'time_entries': {
        return timeEntries;
      }
      case 'invoices': {
        return invoices;
      }
      case 'invoice_line_items': {
        return invoiceLineItems;
      }
      case 'estimates': {
        return estimates;
      }
      case 'estimate_line_items': {
        return estimateLineItems;
      }
      case 'expense_categories': {
        return expenseCategories;
      }
      case 'expenses': {
        return expenses;
      }
    }
    throw new Error(
      `No transform template found for target table ${targetTableName}`
    );
  },
  sourceIdColumn: () => {
    return 'id';
  },
};
