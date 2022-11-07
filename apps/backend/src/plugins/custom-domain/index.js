module.exports = {
  deploy: {
    start: async ({ cloudformation, stage }) => {
      if (stage !== 'staging') {
        return cloudformation;
      }
      const customDomain = process.env.DECI_CUSTOM_DOMAIN;
      const CertificateArn = process.env.DECI_CERTIFICATE_ARN;
      const HostedZoneId = process.env.DECI_ZONE_ID;
      console.log(`Custom domain: stage = ${stage}, custom domain = ${customDomain}`);
      if (customDomain) {
        console.log(`Configuring domain name in deploy: ${customDomain}`);
        cloudformation.Resources.HTTP.Properties.Domain = {
          DomainName: customDomain,
          CertificateArn,
          Route53: {
            HostedZoneId,
            DistributionDomainName: customDomain,
          }
        };
      } else {
        delete cloudformation.Resources.HTTP.Properties.Domain;
      }

      return cloudformation;
    }
  }
};
