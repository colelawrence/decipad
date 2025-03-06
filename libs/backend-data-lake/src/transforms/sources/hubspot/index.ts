import { SourceTransform } from '../types';
import users from './users.sql?raw';
import campaigns from './campaigns.sql?raw';
import contacts from './contacts.sql?raw';
import companies from './companies.sql?raw';
import deals from './deals.sql?raw';

export const hubspot: SourceTransform = {
  realm: 'crm',
  source: 'hubspot',
  sourceTableNames: ['owners', 'campaigns', 'contacts', 'companies', 'deals'],
  targetTables: [
    {
      tableName: 'users',
      description: 'CRM system users',
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
          name: 'Teams',
          type: 'array',
          isNullable: true,
          description: 'The teams of the user',
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
      tableName: 'campaigns',
      description: 'CRM system campaigns',
      columns: [
        {
          name: 'Id',
          type: 'string',
          isNullable: true,
          description: 'The ID of the campaign',
        },
        {
          name: 'Name',
          type: 'string',
          isNullable: true,
          description: 'The name of the campaign',
        },
        {
          name: 'Type',
          type: 'string',
          isNullable: true,
          description: 'The type of campaign',
        },
        {
          name: 'SubType',
          type: 'string',
          isNullable: true,
          description: 'The subtype of campaign',
        },
        {
          name: 'Subject',
          type: 'string',
          isNullable: true,
          description: 'The subject of the campaign',
        },
        {
          name: 'AppId',
          type: 'string',
          isNullable: true,
          description: 'The ID of the app',
        },
        {
          name: 'AppName',
          type: 'string',
          isNullable: true,
          description: 'The name of the app',
        },
        {
          name: 'OpenCount',
          type: 'number',
          isNullable: true,
          description: 'Number of times the campaign was opened',
        },
        {
          name: 'SentCount',
          type: 'number',
          isNullable: true,
          description: 'Number of times the campaign was sent',
        },
        {
          name: 'ClickCount',
          type: 'number',
          isNullable: true,
          description: 'Number of clicks on the campaign',
        },
        {
          name: 'PrintCount',
          type: 'number',
          isNullable: true,
          description: 'Number of times the campaign was printed',
        },
        {
          name: 'ReplyCount',
          type: 'number',
          isNullable: true,
          description: 'Number of replies to the campaign',
        },
        {
          name: 'BounceCount',
          type: 'number',
          isNullable: true,
          description: 'Number of bounces for the campaign',
        },
        {
          name: 'DroppedCount',
          type: 'number',
          isNullable: true,
          description: 'Number of dropped messages for the campaign',
        },
        {
          name: 'ForwardCount',
          type: 'number',
          isNullable: true,
          description: 'Number of forwards of the campaign',
        },
        {
          name: 'DeferredCount',
          type: 'number',
          isNullable: true,
          description: 'Number of deferred messages for the campaign',
        },
        {
          name: 'DeliveredCount',
          type: 'number',
          isNullable: true,
          description: 'Number of delivered messages for the campaign',
        },
        {
          name: 'ProcessedCount',
          type: 'number',
          isNullable: true,
          description: 'Number of processed messages for the campaign',
        },
        {
          name: 'SpamReportCount',
          type: 'number',
          isNullable: true,
          description: 'Number of spam reports for the campaign',
        },
        {
          name: 'SuppressedCount',
          type: 'number',
          isNullable: true,
          description: 'Number of suppressed messages for the campaign',
        },
        {
          name: 'MtaDroppedCount',
          type: 'number',
          isNullable: true,
          description: 'Number of MTA dropped messages for the campaign',
        },
        {
          name: 'StatusChangeCount',
          type: 'number',
          isNullable: true,
          description: 'Number of status changes for the campaign',
        },
        {
          name: 'UnsubscribedCount',
          type: 'number',
          isNullable: true,
          description: 'Number of unsubscribes from the campaign',
        },
        {
          name: 'CreatedAt',
          type: 'timestamp',
          isNullable: true,
          description: 'The creation date of the campaign',
        },
        {
          name: 'LastUpdated',
          type: 'timestamp',
          isNullable: true,
          description: 'The last update date of the campaign',
        },
      ],
    },
    {
      tableName: 'contacts',
      description: 'CRM system contacts',
      columns: [
        {
          name: 'Id',
          type: 'string',
          isNullable: true,
          description: 'The ID of the contact',
        },
        {
          name: 'IsArchived',
          type: 'boolean',
          isNullable: true,
          description: 'Whether the contact is archived',
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
          description: 'The email address of the contact',
        },
        {
          name: 'Phone',
          type: 'string',
          isNullable: true,
          description: 'The phone number of the contact',
        },
        {
          name: 'Website',
          type: 'string',
          isNullable: true,
          description: 'The website of the contact',
        },
        {
          name: 'JobFunction',
          type: 'string',
          isNullable: true,
          description: 'The job function of the contact',
        },
        {
          name: 'Type',
          type: 'string',
          isNullable: true,
          description: 'The type of contact',
        },
        {
          name: 'CompanySize',
          type: 'string',
          isNullable: true,
          description: "The size of the contact's company",
        },
        {
          name: 'Company',
          type: 'string',
          isNullable: true,
          description: 'The company name of the contact',
        },
        {
          name: 'Country',
          type: 'string',
          isNullable: true,
          description: 'The country of the contact',
        },
        {
          name: 'State',
          type: 'string',
          isNullable: true,
          description: 'The state/region of the contact',
        },
        {
          name: 'Industry',
          type: 'string',
          isNullable: true,
          description: 'The industry of the contact',
        },
        {
          name: 'NumEmployees',
          type: 'number',
          isNullable: true,
          description: "The number of employees at the contact's company",
        },
        {
          name: 'AnnualRevenue',
          type: 'number',
          isNullable: true,
          description: "The annual revenue of the contact's company",
        },
        {
          name: 'CloseDate',
          type: 'timestamp',
          isNullable: true,
          description: 'The close date for the contact',
        },
        {
          name: 'DaysToClose',
          type: 'number',
          isNullable: true,
          description: 'The number of days to close',
        },
        {
          name: 'TotalRevenue',
          type: 'number',
          isNullable: true,
          description: 'The total revenue associated with the contact',
        },
        {
          name: 'LifecycleStage',
          type: 'string',
          isNullable: true,
          description: 'The lifecycle stage of the contact',
        },
        {
          name: 'AcquisitionSource',
          type: 'string',
          isNullable: true,
          description: 'The source of acquisition for the contact',
        },
        {
          name: 'RecentDealAmount',
          type: 'number',
          isNullable: true,
          description: 'The amount of the most recent deal',
        },
        {
          name: 'CurrentlyInWorkflow',
          type: 'boolean',
          isNullable: true,
          description: 'Whether the contact is currently in a workflow',
        },
        {
          name: 'AnalyticsSource',
          type: 'string',
          isNullable: true,
          description: 'The analytics source of the contact',
        },
        {
          name: 'MarketableStatus',
          type: 'string',
          isNullable: true,
          description: 'The marketable status of the contact',
        },
        {
          name: 'LeadStatus',
          type: 'string',
          isNullable: true,
          description: 'The lead status of the contact',
        },
        {
          name: 'LastContacted',
          type: 'timestamp',
          isNullable: true,
          description: 'When the contact was last contacted',
        },
        {
          name: 'FirstConversionDate',
          type: 'timestamp',
          isNullable: true,
          description: 'The date of first conversion',
        },
        {
          name: 'RecentConversionDate',
          type: 'timestamp',
          isNullable: true,
          description: 'The date of most recent conversion',
        },
        {
          name: 'FirstUrl',
          type: 'string',
          isNullable: true,
          description: 'The first URL visited by the contact',
        },
        {
          name: 'FirstOutreachDate',
          type: 'timestamp',
          isNullable: true,
          description: 'The date of first outreach',
        },
        {
          name: 'RegistrationMethod',
          type: 'string',
          isNullable: true,
          description: 'The method of registration',
        },
        {
          name: 'TimeInOpportunity',
          type: 'string',
          isNullable: true,
          description: 'Time spent in opportunity stage',
        },
        {
          name: 'FirstDealCreatedDate',
          type: 'timestamp',
          isNullable: true,
          description: 'The date when first deal was created',
        },
        {
          name: 'RecentDealCloseDate',
          type: 'timestamp',
          isNullable: true,
          description: 'The close date of most recent deal',
        },
        {
          name: 'DateEnteredCustomer',
          type: 'timestamp',
          isNullable: true,
          description: 'The date when contact became a customer',
        },
        {
          name: 'DateEnteredOpportunity',
          type: 'timestamp',
          isNullable: true,
          description: 'The date when contact became an opportunity',
        },
        {
          name: 'LastSalesActivityDate',
          type: 'timestamp',
          isNullable: true,
          description: 'The date of last sales activity',
        },
        {
          name: 'LastSalesActivityType',
          type: 'string',
          isNullable: true,
          description: 'The type of last sales activity',
        },
        {
          name: 'LifecycleStageLeadDate',
          type: 'timestamp',
          isNullable: true,
          description: 'The date when contact entered lead stage',
        },
        {
          name: 'OwnerUserId',
          type: 'string',
          isNullable: true,
          description: 'The ID of the contact owner',
        },
        {
          name: 'AssociatedCompanyId',
          type: 'string',
          isNullable: true,
          description: 'The ID of the associated company',
        },
        {
          name: 'CreatedAt',
          type: 'timestamp',
          isNullable: true,
          description: 'The creation date of the contact',
        },
        {
          name: 'LastUpdated',
          type: 'timestamp',
          isNullable: true,
          description: 'The last update date of the contact',
        },
      ],
    },
    {
      tableName: 'companies',
      description: 'CRM system companies',
      columns: [
        {
          name: 'Id',
          type: 'string',
          isNullable: true,
          description: 'The ID of the company',
        },
        {
          name: 'IsArchived',
          type: 'boolean',
          isNullable: true,
          description: 'Whether the company is archived',
        },
        {
          name: 'Name',
          type: 'string',
          isNullable: true,
          description: 'The name of the company',
        },
        {
          name: 'Type',
          type: 'string',
          isNullable: true,
          description: 'The type of company',
        },
        {
          name: 'Country',
          type: 'string',
          isNullable: true,
          description: 'The country of the company',
        },
        {
          name: 'State',
          type: 'string',
          isNullable: true,
          description: 'The state/region of the company',
        },
        {
          name: 'Industry',
          type: 'string',
          isNullable: true,
          description: 'The industry of the company',
        },
        {
          name: 'NumEmployees',
          type: 'number',
          isNullable: true,
          description: 'The number of employees at the company',
        },
        {
          name: 'AnnualRevenue',
          type: 'number',
          isNullable: true,
          description: 'The annual revenue of the company',
        },
        {
          name: 'TotalRevenue',
          type: 'number',
          isNullable: true,
          description: 'The total revenue of the company',
        },
        {
          name: 'TotalMoneyRaised',
          type: 'number',
          isNullable: true,
          description: 'The total amount of money raised by the company',
        },
        {
          name: 'LifecycleStage',
          type: 'string',
          isNullable: true,
          description: 'The lifecycle stage of the company',
        },
        {
          name: 'LeadStatus',
          type: 'string',
          isNullable: true,
          description: 'The lead status of the company',
        },
        {
          name: 'TimeInLead',
          type: 'number',
          isNullable: true,
          description: 'The time spent in lead stage',
        },
        {
          name: 'DaysToClose',
          type: 'number',
          isNullable: true,
          description: 'The number of days to close',
        },
        {
          name: 'NumOpenDeals',
          type: 'number',
          isNullable: true,
          description: 'The number of open deals',
        },
        {
          name: 'RecentDealAmount',
          type: 'number',
          isNullable: true,
          description: 'The amount of the most recent deal',
        },
        {
          name: 'AnalyticsSource',
          type: 'string',
          isNullable: true,
          description: 'The analytics source',
        },
        {
          name: 'TotalDealValue',
          type: 'number',
          isNullable: true,
          description: 'The total value of all deals',
        },
        {
          name: 'LastContacted',
          type: 'timestamp',
          isNullable: true,
          description: 'When the company was last contacted',
        },
        {
          name: 'NumAssociatedDeals',
          type: 'number',
          isNullable: true,
          description: 'The number of associated deals',
        },
        {
          name: 'FirstConversionDate',
          type: 'timestamp',
          isNullable: true,
          description: 'The date of first conversion',
        },
        {
          name: 'DateEnteredLead',
          type: 'timestamp',
          isNullable: true,
          description: 'The date entered lead stage',
        },
        {
          name: 'CreatedByUserId',
          type: 'string',
          isNullable: true,
          description: 'The ID of the user who created the company',
        },
        {
          name: 'FirstContactCreatedate',
          type: 'timestamp',
          isNullable: true,
          description: 'The date first contact was created',
        },
        {
          name: 'DateEnteredCustomer',
          type: 'timestamp',
          isNullable: true,
          description: 'The date entered customer stage',
        },
        {
          name: 'DateEnteredOpportunity',
          type: 'timestamp',
          isNullable: true,
          description: 'The date entered opportunity stage',
        },
        {
          name: 'LastSalesActivityDate',
          type: 'timestamp',
          isNullable: true,
          description: 'The date of last sales activity',
        },
        {
          name: 'LastSalesActivityType',
          type: 'string',
          isNullable: true,
          description: 'The type of last sales activity',
        },
        {
          name: 'TargetAccountProbability',
          type: 'number',
          isNullable: true,
          description: 'The probability of becoming a target account',
        },
        {
          name: 'LastMeetingBooked',
          type: 'timestamp',
          isNullable: true,
          description: 'The date of last meeting booked',
        },
        {
          name: 'AnalyticsLatestSource',
          type: 'string',
          isNullable: true,
          description: 'The latest analytics source',
        },
        {
          name: 'AnalyticsLatestSourceTimestamp',
          type: 'timestamp',
          isNullable: true,
          description: 'The timestamp of latest analytics source',
        },
        {
          name: 'AnalyticsNumVisits',
          type: 'number',
          isNullable: true,
          description: 'The number of analytics visits',
        },
        {
          name: 'AnalyticsNumPageviews',
          type: 'number',
          isNullable: true,
          description: 'The number of analytics pageviews',
        },
        {
          name: 'AnalyticsFirstVisitTimestamp',
          type: 'timestamp',
          isNullable: true,
          description: 'The timestamp of first analytics visit',
        },
        {
          name: 'CreatedAt',
          type: 'timestamp',
          isNullable: true,
          description: 'The creation date of the company',
        },
        {
          name: 'LastUpdated',
          type: 'timestamp',
          isNullable: true,
          description: 'The last update date of the company',
        },
      ],
    },
    {
      tableName: 'deals',
      description: 'CRM system deals',
      columns: [
        {
          name: 'Id',
          type: 'string',
          isNullable: true,
          description: 'The ID of the deal',
        },
        {
          name: 'IsClosed',
          type: 'boolean',
          isNullable: true,
          description: 'Whether the deal is closed',
        },
        {
          name: 'Name',
          type: 'string',
          isNullable: true,
          description: 'The name of the deal',
        },
        {
          name: 'Type',
          type: 'string',
          isNullable: true,
          description: 'The type of deal',
        },
        {
          name: 'DaysToClose',
          type: 'number',
          isNullable: true,
          description: 'Number of days to close the deal',
        },
        {
          name: 'DealScore',
          type: 'number',
          isNullable: true,
          description: 'The score of the deal',
        },
        {
          name: 'ClosedAmount',
          type: 'number',
          isNullable: true,
          description: 'The closed amount of the deal',
        },
        {
          name: 'IsClosedWon',
          type: 'boolean',
          isNullable: true,
          description: 'Whether the deal was won',
        },
        {
          name: 'ClosedWonDate',
          type: 'timestamp',
          isNullable: true,
          description: 'The date when deal was won',
        },
        {
          name: 'ClosedWonReason',
          type: 'string',
          isNullable: true,
          description: 'The reason why deal was won',
        },
        {
          name: 'IsClosedLost',
          type: 'boolean',
          isNullable: true,
          description: 'Whether the deal was lost',
        },
        {
          name: 'ClosedLostReason',
          type: 'string',
          isNullable: true,
          description: 'The reason why deal was lost',
        },
        {
          name: 'CloseDate',
          type: 'timestamp',
          isNullable: true,
          description: 'The close date of the deal',
        },
        {
          name: 'ForecastAmount',
          type: 'number',
          isNullable: true,
          description: 'The forecasted amount of the deal',
        },
        {
          name: 'DealStageProbability',
          type: 'number',
          isNullable: true,
          description: 'The probability of deal stage',
        },
        {
          name: 'OwnerUserId',
          type: 'string',
          isNullable: true,
          description: 'The ID of the deal owner',
        },
        {
          name: 'AnalyticsSource',
          type: 'string',
          isNullable: true,
          description: 'The analytics source of the deal',
        },
        {
          name: 'LastContacted',
          type: 'timestamp',
          isNullable: true,
          description: 'The date of last contact',
        },
        {
          name: 'CreatedAt',
          type: 'timestamp',
          isNullable: true,
          description: 'The creation date of the deal',
        },
        {
          name: 'LastUpdated',
          type: 'timestamp',
          isNullable: true,
          description: 'The last update date of the deal',
        },
      ],
    },
  ], // TODO: add target tables
  getTargetTableTransformTemplate: (targetTableName) => {
    switch (targetTableName) {
      case 'users': {
        return users;
      }
      case 'campaigns': {
        return campaigns;
      }
      case 'contacts': {
        return contacts;
      }
      case 'companies': {
        return companies;
      }
      case 'deals': {
        return deals;
      }
    }
    throw new Error(
      `No transform template found for target table ${targetTableName}`
    );
  },
  sourceIdColumn: () => 'id',
};
