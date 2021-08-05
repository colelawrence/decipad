// These values will be hard-coded for now so that we don't depend on flaky env vars
// There are no secrets in these, so it's ok, you can relax.
const CertificateArn = 'arn:aws:acm:eu-west-2:974894071214:certificate/98cb3526-6405-4341-80d1-6695b096ab05';
const HostedZoneId = 'Z03939041TD6X5Z4MAXDZ';

function package({ arc, cloudformation, stage='staging', inventory, createFunction }) {

  const customDomain = process.env.DECI_CUSTOM_DOMAIN;
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

module.exports = { package };
