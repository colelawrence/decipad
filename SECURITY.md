# Security Policy

## Supported Versions

This project is currently in open-source mode. All versions are considered supported for security updates.

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it responsibly:

1. **DO NOT** create a public GitHub issue
2. Email security concerns to: [security@decipad.com](mailto:security@decipad.com)
3. Include as much detail as possible about the vulnerability
4. We will respond within 48 hours

## Security Best Practices

### Environment Variables

This project uses environment variables for all sensitive configuration. **Never commit real API keys or secrets to the repository.**

#### Required Environment Variables

See `.env.example` for a complete list of required environment variables.

#### Key Security Variables

- `JWT_SECRET`: Use a strong, random secret for JWT token signing
- `STRIPE_SECRET_KEY`: Your Stripe secret key (starts with `sk_`)
- `OPENAI_API_KEY`: Your OpenAI API key
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret access key
- All other API keys and secrets

### Development Setup

1. Copy `.env.example` to `.env.local`
2. Fill in your actual API keys and secrets
3. Never commit `.env.local` or any file containing real secrets
4. Use test/development API keys when possible

### Production Deployment

- Use a secure secret management system (AWS Secrets Manager, HashiCorp Vault, etc.)
- Rotate secrets regularly
- Use least-privilege access for all API keys
- Monitor for unauthorized access

## Security Features

- All workflows are disabled by default (product discontinued)
- No hardcoded production secrets in the codebase
- Environment-based configuration
- Input validation and sanitization
- Secure authentication flows

## Known Security Considerations

- This project integrates with multiple third-party services
- Ensure all API keys have appropriate permissions and rate limits
- Monitor for unusual activity in connected services
- Keep all dependencies updated

## Contributing

When contributing to this project:

1. Never commit real API keys or secrets
2. Use placeholder values in examples
3. Update security documentation if adding new integrations
4. Follow secure coding practices

## Contact

For security-related questions or concerns, contact: [security@decipad.com](mailto:security@decipad.com)
