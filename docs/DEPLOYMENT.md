# Deployment Guide

This guide provides comprehensive instructions for deploying the Decipad application to AWS using the Architect framework, including different deployment environments and advanced configurations.

> **New to Decipad?** Make sure you've completed the [Local Setup Guide](LOCAL_SETUP.md) and understand the [Architecture](ARCHITECTURE.md) before deploying.

## Quick Navigation

- [Prerequisites](#prerequisites) - Required software and AWS setup
- [Environment Configuration](#environment-configuration) - Setting up environment variables
- [Deployment Environments](#deployment-environments) - Dev, staging, and production
- [Deployment Process](#deployment-process) - Step-by-step deployment
- [Verification](#verification-and-testing) - Testing your deployment
- [Monitoring](#monitoring-and-logging) - Observability and debugging
- [Rollback Procedures](#rollback-procedures) - Reverting changes if needed

## Prerequisites

Before deploying the application, ensure you have the following:

### Required Software

- **AWS Account**: An AWS account with appropriate permissions for creating and managing resources
- **AWS CLI**: Version 2.x or higher ([Installation guide](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html))
- **Node.js**: Version 24.0.0 or higher
- **Yarn**: Package manager
- **Rust**: For WebAssembly compilation
- **wasm-pack**: WebAssembly packaging tool

### AWS Permissions

Your AWS account needs permissions for:

- **Lambda**: Create, update, and manage Lambda functions
- **API Gateway**: Create and manage API Gateway resources
- **DynamoDB**: Create and manage DynamoDB tables
- **S3**: Create and manage S3 buckets
- **SQS**: Create and manage SQS queues
- **CloudFormation**: Deploy and manage CloudFormation stacks
- **IAM**: Create and manage IAM roles and policies

## Environment Configuration

### 1. Environment Variables

Create environment files for your target environment:

```bash
# Copy example files
cp .env.example .env
cp apps/backend/.env.example apps/backend/.env
```

### 2. Required Environment Variables

Configure the following environment variables:

#### Core Application

- `DECI_APP_URL_BASE`: Base URL for the application
- `NODE_ENV`: Environment (development, staging, production)

#### AWS Configuration

- `AWS_REGION`: AWS region (default: eu-west-2)
- `AWS_ACCESS_KEY_ID`: AWS access key
- `AWS_SECRET_ACCESS_KEY`: AWS secret key

#### Database

- `DYNAMODB_TABLE_PREFIX`: Prefix for DynamoDB tables
- `DYNAMODB_ENDPOINT`: DynamoDB endpoint (for local development)

#### External Services

- `SENTRY_DSN`: Sentry DSN for error tracking
- `SENTRY_ORG`: Sentry organization
- `SENTRY_PROJECT`: Sentry project
- `SENTRY_AUTH_TOKEN`: Sentry authentication token

#### Analytics and Monitoring

- `VITE_ANALYTICS_WRITE_KEY`: Analytics write key
- `VITE_POSTHOG_API_KEY`: PostHog API key
- `VITE_POSTHOG_HOST`: PostHog host URL

#### AI Services

- `OPENAI_API_KEY`: OpenAI API key for AI features
- `AI_SERVICE_URL`: AI service endpoint

#### Email Services

- `MAILERSEND_API_KEY`: MailerSend API key for email

#### Payment Processing

- `STRIPE_SECRET_KEY`: Stripe secret key
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook secret

### 3. AWS Credentials Configuration

Configure AWS credentials:

```bash
aws configure
```

- **AWS Access Key ID**: Your access key
- **AWS Secret Access Key**: Your secret key
- **Default region**: `eu-west-2`
- **Default output format**: `json`

## Deployment Environments

### Development Deployment

For development and testing:

```bash
yarn deploy
```

This deploys to a development environment with:

- Development-specific configurations
- Debug logging enabled
- Hot reloading capabilities

### Staging Deployment

For staging environment:

```bash
yarn deploy:staging
```

Staging environment features:

- Production-like configuration
- Limited access
- Testing data

### Production Deployment

For production environment:

```bash
yarn deploy:prod
```

Production deployment includes:

- Optimized builds
- Production configurations
- Full monitoring and logging
- CDN integration

## Deployment Process

### 1. Pre-deployment Checks

Before deploying, run these checks:

```bash
# Install dependencies
yarn install

# Run tests
yarn test

# Lint code
yarn lint

# Type check
yarn typecheck

# Build all packages
yarn build
```

### 2. Build Process

The deployment script automatically:

1. **Builds WebAssembly modules**:

   ```bash
   yarn build:wasm
   ```

2. **Builds frontend**:

   ```bash
   yarn build:frontend
   ```

3. **Builds backend**:

   ```bash
   yarn build:backend
   ```

4. **Generates GraphQL types**:
   ```bash
   yarn build:graphql
   ```

### 3. Deployment Steps

The deployment process includes:

1. **Infrastructure Deployment**: Deploys AWS resources using Architect
2. **Lambda Functions**: Uploads and configures Lambda functions
3. **Database Setup**: Creates and configures DynamoDB tables
4. **API Gateway**: Sets up API Gateway endpoints
5. **Static Assets**: Uploads frontend assets to S3
6. **Environment Configuration**: Sets environment variables

## Custom Deployment Scenarios

### Private Instance Deployment

Deploy a private instance for specific clients:

```bash
yarn deploy:private
```

Features:

- Isolated environment
- Custom domain configuration
- Client-specific branding

### Pull Request Deployment

Deploy preview environments for pull requests:

```bash
yarn deploy:pr
```

Features:

- Automatic PR previews
- Temporary environments
- Easy testing and review

### Client-Specific Deployment

Deploy for specific clients:

```bash
yarn deploy:private:client
```

## Verification and Testing

### 1. Health Checks

After deployment, verify the application:

```bash
# Check API health
curl https://your-app-url.com/api/version

# Check GraphQL endpoint
curl https://your-app-url.com/graphql
```

### 2. Database Verification

Verify DynamoDB tables:

```bash
# List tables
aws dynamodb list-tables

# Check table status
aws dynamodb describe-table --table-name your-table-name
```

### 3. Lambda Functions

Check Lambda function status:

```bash
# List functions
aws lambda list-functions

# Check function configuration
aws lambda get-function --function-name your-function-name
```

### 4. S3 Buckets

Verify S3 bucket configuration:

```bash
# List buckets
aws s3 ls

# Check bucket contents
aws s3 ls s3://your-bucket-name
```

## Monitoring and Logging

### 1. CloudWatch Logs

Monitor application logs:

```bash
# View Lambda logs
aws logs describe-log-groups

# Stream logs
aws logs tail /aws/lambda/your-function-name --follow
```

### 2. Error Tracking

- **Sentry**: Automatic error tracking and performance monitoring
- **CloudWatch**: AWS native logging and monitoring
- **Custom Analytics**: Application-specific metrics

### 3. Performance Monitoring

- **Web Vitals**: Core web vitals tracking
- **API Performance**: Response time monitoring
- **Database Performance**: DynamoDB metrics

## Rollback Procedures

### 1. Quick Rollback

Rollback to previous version:

```bash
# Deploy previous version
yarn deploy:rollback

# Or specific version
yarn deploy:version <version>
```

### 2. Database Rollback

If database changes are involved:

```bash
# Restore from backup
aws dynamodb restore-table-from-backup

# Or manual data restoration
```

### 3. Configuration Rollback

Revert configuration changes:

```bash
# Update environment variables
aws lambda update-function-configuration

# Or redeploy with previous config
```

## Security Considerations

### 1. Environment Variables

- Store sensitive variables in AWS Systems Manager Parameter Store
- Use AWS Secrets Manager for highly sensitive data
- Never commit secrets to version control

### 2. IAM Permissions

- Use least privilege principle
- Create specific IAM roles for different services
- Regularly audit permissions

### 3. Network Security

- Configure VPC and security groups appropriately
- Use HTTPS for all communications
- Implement proper CORS policies

## Troubleshooting

### Common Issues

1. **Build Failures**:

   - Check Node.js and Yarn versions
   - Clear cache: `yarn clean`
   - Verify Rust installation

2. **Deployment Failures**:

   - Check AWS credentials
   - Verify permissions
   - Check CloudFormation stack status

3. **Runtime Issues**:
   - Check CloudWatch logs
   - Verify environment variables
   - Test API endpoints

### Getting Help

- **Documentation**: Check this guide and other docs
- **Logs**: Review CloudWatch and Sentry logs
- **Community**: Join Discord or GitHub discussions
- **Support**: Contact support@decipad.com

## Best Practices

### 1. Deployment Strategy

- Use blue-green deployments for zero downtime
- Test in staging before production
- Implement proper rollback procedures

### 2. Monitoring

- Set up comprehensive monitoring
- Create alerts for critical issues
- Regular performance reviews

### 3. Security

- Regular security audits
- Keep dependencies updated
- Implement proper access controls

### 4. Documentation

- Document deployment procedures
- Keep runbooks updated
- Share knowledge with team
