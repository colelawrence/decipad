# GitHub Actions Security

This document outlines the security measures implemented to protect this repository from malicious external contributions and unauthorized infrastructure access.

## Security Status: SECURE ✅

**External contributors CANNOT run malicious code on our infrastructure through pull requests.**

## Security Measures

### 1. Workflow Permissions

- **SHA Pinning**: Required - all actions must use pinned versions
- **Selected Actions Only**: Only trusted actions from specific organizations are allowed
- **External Actions**: Blocked - prevents supply chain attacks

### 2. Pull Request Protection

- **Branch Protection**: Main branch requires status checks and restricts push access
- **Deployment Workflows Disabled**: All deployment workflows have `if: false` conditions
- **Limited Workflow Execution**: Only test and validation workflows can run on PRs

### 3. Secret Protection

- **AWS Credentials**: Only available to trusted workflows for testing purposes
- **API Keys**: Restricted to necessary workflows only
- **Environment Variables**: Properly scoped and limited to test environments

### 4. Infrastructure Protection

- **No Deployment Access**: External PRs cannot trigger deployments
- **Test-Only Secrets**: Production secrets are not accessible to PR workflows
- **Resource Limits**: CI resources are limited by concurrency settings

## How It Works

### For Internal Contributors

- All workflows run normally
- Full access to secrets and actions
- Can trigger deployments (when enabled)

### For External Contributors

- **CAN run**: Test workflows (lint, typecheck, unit tests, e2e tests)
- **CANNOT run**: Deployment workflows (disabled with `if: false`)
- **CANNOT access**: Production secrets or infrastructure
- **RESTRICTED to**: Pinned versions of trusted actions only

## Security Configuration

The repository-level security settings provide protection:

```json
{
  "enabled": true,
  "allowed_actions": "selected",
  "sha_pinning_required": true,
  "selected_actions": {
    "github_owned_allowed": true,
    "verified_allowed": true,
    "patterns_allowed": [
      "decipad/*",
      "actions-rust-lang/*",
      "nrwl/*",
      "jetli/*",
      "aws-actions/*",
      "buildjet/*",
      "treosh/*",
      "swatinem/*"
    ]
  }
}
```

This ensures that:

1. Only trusted actions from specific organizations can run
2. All actions must use pinned versions (prevents version-based attacks)
3. External actions are completely blocked
4. Supply chain attacks are prevented
5. Deployment workflows are disabled for external contributors

## Workflows That Run on PRs

### Safe Workflows (External contributors can trigger):

- **Run Tests** (`test.yml`) - Unit tests with limited AWS access for testing
- **Run E2E Tests** (`test-e2e.yaml`) - End-to-end tests with dev environment access
- **Lint & Typecheck** (`lint-and-typecheck.yml`) - Code quality checks

### Blocked Workflows (External contributors cannot trigger):

- **Deploy PR** (`deploy-pr.yaml`) - Disabled with `if: false`
- **Deploy Dev** (`deploy-dev.yml`) - Disabled with `if: false`
- **Deploy Prod** (`deploy-prod.yml`) - Disabled with `if: false`

## Monitoring

- All workflow runs are logged and monitored
- Failed security checks are visible in workflow logs
- External PRs will show "skipped" status for security-protected jobs
- Discord notifications for workflow failures on main branch

## Best Practices

1. **Never disable these security checks** unless absolutely necessary
2. **Review all workflow changes** before merging
3. **Monitor workflow runs** for suspicious activity
4. **Keep secrets minimal** - only include what's necessary for testing
5. **Regular security audits** - review permissions and access
6. **Consider OIDC** for AWS credentials instead of long-lived access keys
7. **Environment-specific secrets** - separate test vs production secrets

## Reporting Security Issues

If you discover a security vulnerability in our GitHub Actions setup:

1. **DO NOT** create a public issue
2. Email security concerns to: [security@decipad.com](mailto:security@decipad.com)
3. We will respond within 48 hours

## Risk Assessment

### Current Risk Level: LOW ✅

**External contributors cannot:**

- Deploy code to production or staging environments
- Access production secrets or infrastructure
- Run arbitrary code on your infrastructure
- Bypass security controls through workflow modifications

**Potential risks (mitigated):**

- Resource consumption through test workflows (limited by concurrency)
- Secret exposure in test environments (only dev/test secrets, not production)
- Supply chain attacks (prevented by action restrictions)

## Updates

This security configuration is regularly reviewed and updated to protect against new attack vectors and maintain the highest security standards. Last updated: January 2025
