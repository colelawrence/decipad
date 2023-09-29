import { testWithSandbox as test } from '@decipad/backend-test-sandbox';
import { stripeWebhookHandler } from '@decipad/lambdas';
import { thirdParty } from '@decipad/backend-config';
import Stripe from 'stripe';
import { addMonths } from 'date-fns';
import { Workspace } from '@decipad/backendtypes';
import { ensureGraphqlResponseIsErrorFree } from './utils/ensureGraphqlResponseIsErrorFree';
import { APIGatewayProxyEventV2, Context } from 'aws-lambda';
import { GetWorkspacesDocument } from '@decipad/graphql-client';

test('workspaces', (ctx) => {
  const stripeConfig = thirdParty().stripe;
  const stripe = new Stripe(stripeConfig.apiKey, {
    apiVersion: '2023-08-16',
  });
  const { test: it } = ctx;
  let workspace: Workspace;
  let context: Context;
  let stripeEvent: Stripe.Event;
  let mockedEvent: APIGatewayProxyEventV2;

  beforeAll(async () => {
    const auth = await ctx.auth();
    const client = ctx.graphql.withAuth(auth);

    workspace = (
      await ensureGraphqlResponseIsErrorFree(
        client.mutate({
          mutation: ctx.gql`
          mutation {
            createWorkspace(workspace: { name: "Workspace 1" }) {
              id
              name
            }
          }
        `,
        })
      )
    ).data.createWorkspace;

    await client.mutate({
      mutation: ctx.gql`
        mutation {
          incrementQueryCount(id: "${workspace.id}") {
            queryCount
            quotaLimit
          }
        }
      `,
    });

    stripeEvent = {
      id: 'evt_1NuywjB0kCiHMJmLmpKXGHIf',
      object: 'event',
      api_version: '2023-08-16',
      created: Date.now(),
      data: {
        object: {
          id: 'sub_123',
          object: 'checkout.session',
          after_expiration: null,
          allow_promotion_codes: true,
          amount_subtotal: 1000,
          amount_total: 1000,
          automatic_tax: {
            enabled: true,
            status: 'complete',
          },
          billing_address_collection: 'auto',
          cancel_url: 'https://stripe.com',
          client_reference_id: workspace.id,
          consent: {
            promotions: null,
            terms_of_service: 'accepted',
          },
          consent_collection: {
            promotions: 'none',
            terms_of_service: 'required',
          },
          created: Date.now(),
          currency: 'usd',
          currency_conversion: null,
          custom_fields: [],
          custom_text: {
            shipping_address: null,
            submit: null,
            terms_of_service_acceptance: null,
          },
          customer: '456',
          customer_creation: 'if_required',
          customer_details: {
            address: {
              city: null,
              country: 'GB',
              line1: null,
              line2: null,
              postal_code: '123',
              state: null,
            },
            email: 'test@n1n.co',
            name: 'test user',
            phone: null,
            tax_exempt: 'none',
            tax_ids: [],
          },
          customer_email: null,
          expires_at: addMonths(Date.now(), 1),
          invoice: '789',
          invoice_creation: null,
          livemode: false,
          locale: 'auto',
          metadata: {},
          mode: 'subscription',
          payment_intent: null,
          payment_link: 'foo.bar',
          payment_method_collection: 'always',
          payment_method_configuration_details: {
            id: 'pmc_1NI6ldB0kCiHMJmLs8LIhAeB',
            parent: null,
          },
          payment_method_options: null,
          payment_method_types: ['card', 'link', 'cashapp'],
          payment_status: 'paid',
          phone_number_collection: {
            enabled: false,
          },
          recovered_from: null,
          setup_intent: null,
          shipping_address_collection: null,
          shipping_cost: null,
          shipping_details: null,
          shipping_options: [],
          status: 'complete',
          submit_type: 'auto',
          subscription: 'sub_123',
          success_url: 'https://stripe.com',
          total_details: {
            amount_discount: 0,
            amount_shipping: 0,
            amount_tax: 0,
          },
          url: null,
        },
      },
      livemode: false,
      pending_webhooks: 3,
      request: {
        id: null,
        idempotency_key: null,
      },
      type: 'checkout.session.completed',
    };

    mockedEvent = {
      headers: {
        'stripe-signature': stripe.webhooks.generateTestHeaderString({
          payload: JSON.stringify(stripeEvent),
          secret: stripeConfig.webhookSecret,
        }),
      },
      body: JSON.stringify(stripeEvent),
      version: '1',
      rawPath: '',
      rawQueryString: '',
      routeKey: '',
      requestContext: {
        accountId: '',
        apiId: '',
        http: {
          method: 'GET',
          path: '',
          protocol: '',
          sourceIp: '',
          userAgent: '',
        },
        domainName: '',
        domainPrefix: '',
        requestId: '',
        routeKey: '',
        stage: '',
        time: '',
        timeEpoch: Date.now(),
      },
      isBase64Encoded: true,
    };
    context = {
      ...ctx,
      functionName: '',
      functionVersion: '',
      callbackWaitsForEmptyEventLoop: false,
      memoryLimitInMB: '',
      awsRequestId: '',
      logGroupName: '',
      logStreamName: '',
      invokedFunctionArn: '',
      getRemainingTimeInMillis: () => 2000,
      done: jest.fn(),
      succeed: jest.fn(),
      fail: jest.fn(),
    };

    expect(workspace).toMatchObject({ name: 'Workspace 1' });
  });

  it('can subscribe a paid plan', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth());

    await stripeWebhookHandler(mockedEvent, context, jest.fn());

    const { workspaces } = (
      await client.query({
        query: GetWorkspacesDocument,
      })
    ).data;

    const { workspaceSubscription, isPremium, workspaceExecutedQuery } =
      workspaces[0];

    expect(workspaceSubscription.paymentStatus).toBe('paid');
    expect(isPremium).toBeTruthy();
    expect(workspaceExecutedQuery.quotaLimit).toBe(500);
  });

  it('can update a subscription', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth());
    const updateStripeEvent = {
      ...stripeEvent,
      data: {
        ...stripeEvent.data,
        object: {
          ...stripeEvent.data.object,
          status: 'trialing',
        },
      },
      type: 'customer.subscription.updated',
    };

    const updateMockedEvent = {
      ...mockedEvent,
      headers: {
        'stripe-signature': stripe.webhooks.generateTestHeaderString({
          payload: JSON.stringify(updateStripeEvent),
          secret: stripeConfig.webhookSecret,
        }),
      },
      body: JSON.stringify(updateStripeEvent),
    };

    await stripeWebhookHandler(updateMockedEvent, context, jest.fn());

    const { workspaces } = (
      await client.query({
        query: GetWorkspacesDocument,
      })
    ).data;

    const { workspaceSubscription, isPremium, workspaceExecutedQuery } =
      workspaces[0];

    expect(workspaceSubscription).not.toBeNull();
    expect(isPremium).toBeTruthy();
    expect(workspaceExecutedQuery.quotaLimit).toBe(500);
  });

  it('can reset the query count when a subscription is renewed', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth());
    const invoiceStripeEvent = {
      ...stripeEvent,
      type: 'invoice.created',
    };

    const invoiceMockedEvent = {
      ...mockedEvent,
      headers: {
        'stripe-signature': stripe.webhooks.generateTestHeaderString({
          payload: JSON.stringify(invoiceStripeEvent),
          secret: stripeConfig.webhookSecret,
        }),
      },
      body: JSON.stringify(invoiceStripeEvent),
    };

    await stripeWebhookHandler(invoiceMockedEvent, context, jest.fn());

    const { workspaces } = (
      await client.query({
        query: GetWorkspacesDocument,
      })
    ).data;

    const { workspaceSubscription, workspaceExecutedQuery } = workspaces[0];

    expect(workspaceSubscription).not.toBeNull();
    expect(workspaceExecutedQuery.queryCount).toBe(0);
  });

  it('can cancel an existing subscription', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth());
    const cancelStripeEvent = {
      ...stripeEvent,
      data: {
        ...stripeEvent.data,
        object: {
          ...stripeEvent.data.object,
          status: 'canceled',
        },
      },
      type: 'customer.subscription.deleted',
    };

    const cancelMockedEvent = {
      ...mockedEvent,
      headers: {
        'stripe-signature': stripe.webhooks.generateTestHeaderString({
          payload: JSON.stringify(cancelStripeEvent),
          secret: stripeConfig.webhookSecret,
        }),
      },
      body: JSON.stringify(cancelStripeEvent),
    };

    await stripeWebhookHandler(cancelMockedEvent, context, jest.fn());

    const { workspaces } = (
      await client.query({
        query: GetWorkspacesDocument,
      })
    ).data;

    const { workspaceSubscription, isPremium, workspaceExecutedQuery } =
      workspaces[0];

    expect(workspaceSubscription).toBeNull();
    expect(isPremium).toBeFalsy();
    expect(workspaceExecutedQuery.quotaLimit).toBe(50);
  });
});
