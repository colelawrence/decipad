function pkg({ arc, cloudformation, stage='staging', inventory, createFunction }) {

  const customDomain = process.env.DECI_CUSTOM_DOMAIN;
  const CertificateArn = process.env.DECI_CERTIFICATE_ARN;
  const HostedZoneId = process.env.DECI_ZONE_ID;
  console.log(`Custom domain: stage = ${stage}, custom domain = ${customDomain}`);
  if (stage === 'staging' && customDomain) {
    console.log(`Configuring domain name in deploy: ${customDomain}`);
    cloudformation.Resources.HTTP.Properties.Domain = {
      DomainName: customDomain,
      CertificateArn,
      Route53: {
        HostedZoneId,
        DistributionDomainName: customDomain,
      }
    };
  }

  return cloudformation;
}

module.exports = { 'package': pkg };
