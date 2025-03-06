# Data Lake Architecture

The Decipad data lake provides a flexible way to connect external data sources to your workspace. It enables you to import and analyze data from various sources while maintaining security and access controls through isolated BigQuery datasets per workspace.

## Overview

The data lake architecture consists of several key components:

1. **Connections** - Configurations that define how to connect to external data sources like databases, APIs, or file storage systems. Each connection is scoped to a workspace and contains:

   - Source type (e.g. CRM systems, time tracking tools, payment processors)
   - Connection credentials and configuration
   - Access permissions

2. **Airbyte Integration** - We use Airbyte as our Extract-Load (EL) service to:

   - Handle source connections to external systems
   - Manage data extraction and loading into BigQuery
   - Schedule and trigger data syncs
   - Monitor sync status and health

3. **BigQuery Datasets** - Each workspace gets its own isolated BigQuery dataset that:
   - Contains only that workspace's data
   - Enforces access controls and data isolation through a dedicated service account
   - Hosts both raw and normalized views

## Service Account Management

Each workspace gets its own dedicated Google Cloud service account to ensure complete data isolation:

1. **Creation Process**

   - When a new data lake is created for a workspace, we create a new service account using the Google Cloud IAM API
   - The service account name is derived from the workspace ID
   - A new key pair is generated for the service account

2. **Access Control**

   - The service account is granted specific permissions only to its workspace's BigQuery dataset
   - IAM policies and bindings are created to restrict the service account's access
   - The service account credentials are encrypted and stored in the workspace's data lake record

3. **Credential Management**
   - The service account's private key is securely stored in our database
   - Credentials are encoded using base64 and encrypted at rest
   - The service account is used for all BigQuery operations for that workspace

## Data Flow

1. When a new connection is created, we:

   - Configure the source connection in Airbyte
   - Set up a BigQuery destination using the workspace's service account
   - Create a sync schedule

2. Airbyte handles the extraction and loading of raw data into BigQuery

3. Upon receiving a webhook from Airbyte indicating successful sync:
   - We create normalized views on top of the raw data
   - Each vertical application (CRM, time-tracking, payments, etc.) gets mapped to a standardized schema
   - Views abstract away source-specific schemas into a unified format

## RESTful API

The data lake exposes a RESTful API at `/api/datalakes` with the following key endpoints:

- `GET /api/datalakes/:workspaceId` - Retrieves data lake configuration for a workspace
- `POST /api/datalakes/:workspaceId/connections` - Creates a new data source connection
- `GET /api/datalakes/:workspaceId/connections/:connectionId` - Gets connection details
- `DELETE /api/datalakes/:workspaceId/connections/:connectionId` - Removes a connection
- `POST /api/datalakes/:workspaceId/connections/:connectionId/test` - Tests connection validity

### Query API

The data lake provides a query endpoint for accessing normalized data:

`POST /api/datalakes/:workspaceId/query`

This endpoint allows querying the normalized views using standard SQL. The queries are executed against the workspace's isolated BigQuery dataset using the workspace's dedicated service account, ensuring data isolation and security.

### Query Execution Flow

When a SQL query is submitted to the query endpoint, we handle temporal versioning and table name mapping to provide consistent, point-in-time accurate results:

1. **Temporal Data Management**

   - Each record in our normalized views includes temporal fields that track when data was created, modified, and loaded
   - Rather than overwriting data during syncs, we maintain a full history of changes
   - Each record includes:
     - `_valid_from`: When this version of the record became active
     - `_valid_to`: When this version was superseded (null if current)
   - We explicitly exclude these columns from the query results

2. **Point-in-Time Querying**

   - Queries can specify a timestamp to get a consistent view of data as it existed at that moment
   - The temporal fields are used to automatically filter to the correct version of each record
   - This ensures that historical queries remain stable and reproducible
   - Without a specified timestamp, queries default to the current (latest) version of records

3. **Table Name Mapping**

When a SQL query is submitted to the query endpoint, we simplify access to the normalized views through table name mapping:

1. **Table Name Mapping**

   - We inject a SQL preamble that creates aliases for the fully-qualified BigQuery table names
   - The preamble consists of a series of WITH clauses that map each standardized table name to its fully-qualified counterpart
   - This allows users to write queries using simple standardized table names without needing to know the underlying project ID, dataset name, or normalized view structure

2. **Query Processing**
   - The user's SQL query is left unmodified - we do not validate or transform the query syntax
   - The preamble is prepended to the user's query, effectively creating a view layer that abstracts away the physical table locations
   - When executed, BigQuery resolves the table references through the WITH clause aliases to access the correct normalized views

This approach provides a clean abstraction layer that hides the complexity of the underlying data lake structure while maintaining full query flexibility for users.

## Development Environment Setup

To set up a local development environment for working with the data lake, follow these steps:

### Prerequisites

1. Install required tools:

   - Node.js 20+ and yarn
   - Docker Desktop
   - Google Cloud CLI (`gcloud`) _optional_ (In alternative you can use the Google Cloud console UI)

2. Set up Google Cloud:

   - Create a new GCP project or use an existing one
   - Enable the BigQuery API
   - Create a service account with BigQuery Admin permissions
   - Download the service account key JSON file

3. Install and configure Airbyte:
   - Follow the installation instructions at: https://docs.airbyte.com/using-airbyte/getting-started/oss-quickstart
   - Once installed, Airbyte will be available at http://localhost:8000

### Environment Configuration

1. Create a `.env` file in the `apps/backend` directory with:

   ```
   DATALAKE_GOOGLE_ROOT_SERVICE_CREDENTIALS=<base64 encoded service account key JSON file>
   DATALAKE_WEBHOOK_SECRET=<a secret you create>
   DATALAKE_AIRBYTE_CLIENT_ID=your-airbyte-client-id
   DATALAKE_AIRBYTE_CLIENT_SECRET=your-airbyte-client-secret
   DATALAKE_AIRBYTE_WORKSPACE_ID=your-airbyte-workspace-id
   ```

You will need to get the Airbyte workspace id from the Airbyte UI (check the URL in the browser).

The Airbyte client id can be discovered by running the command `abctl local credentials` and looking for the `client_id` field.

### Setup the Airbyte webhook

Go to Airbyte and define the webhook notification for the successful sync with the following URL:

`http://localhost:3000/api/datalakes/webhooks/successful-sync?secret=<the value of the secret you placed in the DATALAKE_WEBHOOK_SECRET env var>`

### Run Decipad and verify installation

1. Test the setup by creating a local Decipad workspace and then creating a Data Lake on that workspace.

2. Setup a connection to an existing provider

3. Verify that the connection source and destinations were created in Airbyte and that the sync is running.

4. After finishing the sync, verify that the data is available in BigQuery by running a query on the normalized views.

### Development Tips

- Monitor Airbyte syncs at http://localhost:8000
- Check BigQuery console for data verification
- Use `yarn build:backend:watch` during development for automatic rebuilds

### Troubleshooting

- Ensure ports 8000 and 3333 are not in use by other applications
- Check Docker logs if services fail to start
- Verify all environment variables are set correctly
- Ensure Google Cloud credentials have sufficient permissions

### Code Structure

The backend data lake code is organized in the `libs/backend-data-lake` directory with the following structure:

#### Services Layer

The services layer contains the core business logic:

- `createDataLake.ts` - Handles creation of new data lakes including:

  - Creating BigQuery datasets
  - Setting up Google Cloud service accounts and permissions
  - Managing data lake state in the database

- `createConnection.ts` - Manages data source connections:
  - Validates connection configurations
  - Ensures no duplicate connections per realm
  - Coordinates extract and load setup

#### Extract-Load Layer

The extract-load layer manages data pipeline configuration:

- `ensureExtractSource.ts` - Sets up data extraction from sources
- `ensureLoadDestination.ts` - Configures data loading into BigQuery
- `ensureConnection.ts` - Creates and manages Airbyte connections

#### Utils Layer

Helper utilities for common operations:

- `dataLakeId.ts` - Generates consistent IDs for data lake resources
- `googleBigQueryRootClient.ts` - Client for BigQuery operations
- `googleIamClient.ts` - Manages Google Cloud IAM operations
- `parseBigQueryCredentials.ts` - Handles credential parsing
- `encodeBigQueryCredentials.ts` - Manages credential encoding

#### Transforms Layer

The transforms layer handles data transformation and normalization:

- `transforms/` - Contains transformation logic for different data sources:
  - Standardizes raw data into consistent schemas
  - Applies business rules and data cleaning
  - Creates normalized views for analysis
  - Handles source-specific data mappings
  - Uses dbt-style SQL files for transformations

Key components:

- Source-specific transforms that convert raw data into standardized formats
- SQL transformation files following dbt patterns and best practices
- Common utilities for data type conversion and validation
- View definitions for normalized data access
- Schema management for transformed datasets

The transforms ensure data from different sources can be analyzed consistently while preserving the original raw data. Each source has its own transformation logic to handle unique data structures and requirements. The SQL-based transformation approach allows for version controlled, testable data transformations similar to dbt workflows.

#### Types

Common TypeScript types and interfaces are defined in:

- `types.ts` - Core type definitions including:
  - Data source types
  - Data realms
  - Connection states
  - Configuration interfaces

#### API Routing

The data lake API endpoints are exposed through the backend server:

1. Data Lake Management

   - POST `/api/datalakes` - Creates a new data lake
   - GET `/api/datalakes/:id` - Retrieves data lake status
   - DELETE `/api/datalakes/:id` - Removes a data lake

2. Connection Management

   - POST `/api/datalakes/:id/connections` - Creates new data source connection
   - GET `/api/datalakes/:id/connections` - Lists all connections
   - DELETE `/api/datalakes/:id/connections/:connectionId` - Removes a connection

3. Webhook Endpoints
   - POST `/api/datalakes/webhooks/successful-sync` - Handles Airbyte sync notifications

The API routes are protected by authentication middleware and validate request parameters before passing to the services layer. The services layer then coordinates the necessary operations across the extract-load components.

The code follows a layered architecture pattern separating core business logic, data pipeline management, and utilities for better maintainability and separation of concerns.
