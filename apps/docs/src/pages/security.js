import React from 'react';
import '../css/custom.css';

export default function Terms() {
  return (
    <div
      class="gallery"
      style={{
        backgroundColor: '#f4f6fa',
      }}
    >
      <div class="navbar-gallery-wrapper">
        <div class="navbar-gallery">
          <div class="header-gallery">
            <a href="https://www.decipad.com">
              <img
                src="https://uploads-ssl.webflow.com/61dda5267f2552f1a1c52b1f/622257a785a56d257a078fa0_Logomark.svg"
                loading="eager"
                alt=""
                className="logo-svg logo-gallery"
                style={{ backgroundColor: 'transparent' }}
              />
            </a>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
            }}
          >
            <div class="login-gallery">
              <div
                style={{
                  marginLeft: '8px',
                  padding: '7px 12px 8px',
                  borderRadius: '10px',
                  backgroundColor: '#fff',
                  color: '#121213',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: '500',
                  fontSize: '15px',
                  height: '30.5px',
                  lineHeight: '15px',
                  marginTop: '-1px',
                }}
              >
                <a
                  href="https://app.decipad.com/"
                  style={{
                    color: '#121213',
                    fontSize: '14px',
                    textDecoration: 'none',
                  }}
                >
                  Login
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        style={{
          backgroundImage:
            'radial-gradient(circle farthest-corner at 50% -30%, #fafcff, #f2f5f9 30%, #fff 90%)',
        }}
      >
        <div
          style={{
            maxWidth: '800px',
            margin: 'auto',
            marginTop: '100px',
            paddingBottom: '120px',
          }}
        >
          <div
            class="fadeIn"
            style={{
              margin: '20px',
            }}
          >
            <div
              style={{
                marginBottom: '50px',
              }}
            >
              <center>
                <h1
                  class="title-gallery"
                  style={{
                    fontSize: '70px',
                    lineHeight: '120%',
                    fontWeight: '500',
                  }}
                >
                  Security and privacy
                </h1>
                <p
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '16px',
                    color: '#5f6486',
                  }}
                >
                  Date of Last Revision: July 3, 2024
                </p>
              </center>
            </div>
            <p>
              At N1N Ltd and its affiliates we take the security and privacy of
              our customer's data very seriously and we are constantly improving
              our security, audit, and compliance solutions with our customers
              in mind, based on the following principles:
              <ul>
                <li>
                  Access should be limited to only those with a legitimate
                  business need granted based on the principle of least
                  privilege.
                </li>
                <li>
                  Security controls should be implemented and layered according
                  to the principle of defense-in-depth and applied consistently
                  across all the areas of the company/product.
                </li>
              </ul>
              <br />
              <h2>Data protection</h2>
              <ul>
                <li>
                  <strong>Data Storage and encryption: </strong>our customer's
                  data is securely stored in Amazon DynamoDB tables and S3
                  buckets, meaning that all data is encrypted using advanced
                  standards. We apply stringent individual privacy protections
                  to all GitHub users worldwide, regardless of their country of
                  origin or location.
                </li>
                <li>
                  <strong>Access Controls: </strong>We use AWS Identity and
                  Access Management (IAM) to enforce the principle of least
                  privilege, ensuring that each user has the minimum access
                  necessary.
                </li>
              </ul>
              <h2>Data transmission</h2>
              <ul>
                <li>
                  <strong>Transport Layer Security (TLS) and HTTPS: </strong>we
                  use TLS to encrypt data in transit, ensuring that our
                  customer's data information is secure as it moves between our
                  customer's device and our servers. All communication between
                  our customer's browser and our application is secured using
                  HTTPS, which is a secure version of HTTP.
                </li>
                <li>
                  <strong>Certificates: </strong>our application uses
                  AWS-managed certificates to handle encryption, ensuring that
                  our security infrastructure is always up-to-date with the
                  latest standards.
                </li>
              </ul>
              <h2>Secret management</h2>
              <ul>
                <li>
                  <strong>Application secrets: </strong>all application secrets
                  are securely stored in GitHub secrets, preventing direct
                  access by any individuals, including N1N Ltd or GitHub
                  employees, and managing these values is strictly limited.
                </li>
                <li>
                  <strong>Encryption keys: </strong>all encryption keys are
                  managed via AWS Key Management System, that stores key
                  material in Hardware Security Modules, preventing direct
                  access by any individuals, including employees of Amazon and
                  N1N Inc.
                </li>
              </ul>
              <h2>Product security</h2>
              <ul>
                <li>
                  <strong>Vulnerability scanning: </strong>N1N Ltd requires
                  vulnerability scanning at key stages of our Development
                  Lifecycle, by performing static analysis testing and malicious
                  dependency scanning during pull requests.
                </li>
              </ul>
              <h2>Company security</h2>
              <ul>
                <li>
                  <strong>Endpoint protection: </strong>All corporate devices
                  are centrally managed and are equipped with mobile device
                  management software and anti-malware protection. We use MDM
                  software to enforce secure configuration of endpoints, such as
                  disk encryption, screen lock configuration, and software
                  updates.
                </li>
                <li>
                  <strong>Identity and access management: </strong>N1N Ltd
                  utilizes vendor access management solutions, such as AWS IAM,
                  Google Single Sign-On, GitHub Single Sign-On, or one-time
                  password logins, depending on the platform. We enforce the use
                  of multi-factor authentication (MFA) whenever available.
                  Access to applications for N1N Ltd employees is granted based
                  on their roles and is automatically revoked upon termination
                  of employment. Any additional access requires approval
                  according to the policies established for each application.
                </li>
              </ul>
              <h2>Compliance</h2>
              <ul>
                <li>
                  <strong>SOC2 Type Certification: </strong>we are in the
                  process of being SOC2 Type 2 certified, which demonstrates our
                  commitment to maintaining the highest standards of security,
                  availability, processing integrity, confidentiality, and
                  privacy.
                </li>
                <li>
                  <strong>Continuous Monitoring and Updates: </strong>we
                  continuously monitor our systems for potential vulnerabilities
                  and apply regular updates to keep our security measures
                  current.
                </li>
              </ul>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
