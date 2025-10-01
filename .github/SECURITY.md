# GitHub Actions Security

This document outlines the security measures implemented to protect this repository from malicious external contributions.

## Security Measures

### 1. Workflow Permissions

- **Actions**: Limited to `local_only` - only actions from this repository can run
- **SHA Pinning**: Required - all actions must use pinned versions
- **External Actions**: Blocked - prevents supply chain attacks

### 2. Pull Request Protection

- **External Actions**: Blocked at repository level - only local actions allowed
- **SHA Pinning**: Required - all actions must use pinned versions
- **Malicious Workflows**: External contributors cannot use external actions or modify workflow behavior

### 3. Secret Protection

- **AWS Credentials**: Only available to trusted workflows
- **API Keys**: Restricted to necessary workflows only
- **Environment Variables**: Properly scoped and limited

## How It Works

### For Internal Contributors

- All workflows run normally
- Full access to secrets and actions
- No restrictions on workflow execution

### For External Contributors

- Can run workflows but with restrictions
- Cannot use external actions (supply chain protection)
- Cannot access repository secrets from external actions
- All actions must use pinned versions (prevents version-based attacks)

## Security Protection

The repository-level security settings provide protection:

```json
{
  "enabled": true,
  "allowed_actions": "local_only",
  "sha_pinning_required": true
}
```

This ensures that:

1. Only actions from this repository can run
2. External actions are completely blocked
3. All actions must use pinned versions
4. Supply chain attacks are prevented

## Monitoring

- All workflow runs are logged
- Failed security checks are visible in workflow logs
- External PRs will show "skipped" status for security-protected jobs

## Best Practices

1. **Never disable these security checks** unless absolutely necessary
2. **Review all workflow changes** before merging
3. **Monitor workflow runs** for suspicious activity
4. **Keep secrets minimal** - only include what's necessary
5. **Regular security audits** - review permissions and access

## Reporting Security Issues

If you discover a security vulnerability in our GitHub Actions setup:

1. **DO NOT** create a public issue
2. Email security concerns to: [security@decipad.com](mailto:security@decipad.com)
3. We will respond within 48 hours

## Updates

This security configuration is regularly reviewed and updated to protect against new attack vectors and maintain the highest security standards.
