import { Metadata } from 'next'
import { LegalLayout } from '@/components/legal/legal-layout'

export const metadata: Metadata = {
  title: 'GDPR Compliance',
  description: 'Learn about your data protection rights under GDPR.',
}

export default function GDPRPage() {
  return (
    <LegalLayout title="GDPR Compliance" lastUpdated="January 15, 2024">
      <div className="space-y-8">
        {/* Introduction */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold">Introduction</h2>
          <p className="mb-4">
            The General Data Protection Regulation (GDPR) is a comprehensive data protection law
            that came into effect on May 25, 2018. It applies to all companies that process the
            personal data of individuals residing in the European Union (EU).
          </p>
          <p>
            ProductName is committed to complying with GDPR requirements and protecting the privacy
            rights of all our users, regardless of their location. This page outlines your rights
            under GDPR and how we ensure compliance.
          </p>
        </section>

        {/* Your Rights Under GDPR */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold">Your Rights Under GDPR</h2>
          <p className="mb-4">
            As an individual whose personal data we process, you have the following rights under
            GDPR:
          </p>

          <div className="space-y-6">
            <div>
              <h3 className="mb-3 text-xl font-medium">1. Right to Information</h3>
              <p className="mb-2">
                You have the right to be informed about how we collect and use your personal data.
                We provide this information through our Privacy Policy and this GDPR page.
              </p>
            </div>

            <div>
              <h3 className="mb-3 text-xl font-medium">2. Right of Access</h3>
              <p className="mb-2">
                You have the right to request a copy of the personal data we hold about you. This
                includes:
              </p>
              <ul className="list-disc space-y-1 pl-6">
                <li>Account information and profile data</li>
                <li>Usage data and activity logs</li>
                <li>Communication records</li>
                <li>Any other personal data we have collected</li>
              </ul>
            </div>

            <div>
              <h3 className="mb-3 text-xl font-medium">3. Right to Rectification</h3>
              <p>
                You have the right to request that we correct any inaccurate or incomplete personal
                data we hold about you. You can update most of your information through your account
                settings, or contact us for assistance.
              </p>
            </div>

            <div>
              <h3 className="mb-3 text-xl font-medium">
                4. Right to Erasure (Right to be Forgotten)
              </h3>
              <p className="mb-2">
                You have the right to request that we delete your personal data in certain
                circumstances:
              </p>
              <ul className="list-disc space-y-1 pl-6">
                <li>The data is no longer necessary for the original purpose</li>
                <li>You withdraw consent and there is no other legal basis for processing</li>
                <li>Your data has been unlawfully processed</li>
                <li>Erasure is required for compliance with legal obligations</li>
              </ul>
            </div>

            <div>
              <h3 className="mb-3 text-xl font-medium">5. Right to Restrict Processing</h3>
              <p className="mb-2">
                You have the right to request that we limit how we process your personal data in
                certain situations:
              </p>
              <ul className="list-disc space-y-1 pl-6">
                <li>You contest the accuracy of the data</li>
                <li>Processing is unlawful but you prefer restriction over erasure</li>
                <li>We no longer need the data but you need it for legal claims</li>
                <li>You object to processing while we verify our legitimate interests</li>
              </ul>
            </div>

            <div>
              <h3 className="mb-3 text-xl font-medium">6. Right to Data Portability</h3>
              <p>
                You have the right to receive your personal data in a structured, commonly used, and
                machine-readable format, and to transmit that data to another controller when
                technically feasible.
              </p>
            </div>

            <div>
              <h3 className="mb-3 text-xl font-medium">7. Right to Object</h3>
              <p className="mb-2">
                You have the right to object to processing of your personal data in certain
                circumstances:
              </p>
              <ul className="list-disc space-y-1 pl-6">
                <li>Processing based on legitimate interests</li>
                <li>Direct marketing (including profiling)</li>
                <li>Processing for scientific, historical, or statistical purposes</li>
              </ul>
            </div>

            <div>
              <h3 className="mb-3 text-xl font-medium">
                8. Rights Related to Automated Decision Making
              </h3>
              <p>
                You have the right not to be subject to automated decision-making, including
                profiling, that produces legal effects or similarly significantly affects you.
              </p>
            </div>
          </div>
        </section>

        {/* How to Exercise Your Rights */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold">How to Exercise Your Rights</h2>

          <h3 className="mb-3 text-xl font-medium">Submit a Request</h3>
          <p className="mb-4">
            To exercise any of your GDPR rights, please contact us using one of the following
            methods:
          </p>
          <ul className="mb-6 list-disc space-y-2 pl-6">
            <li>
              Email us at{' '}
              <a href="mailto:gdpr@company.com" className="text-primary hover:underline">
                gdpr@company.com
              </a>
            </li>
            <li>Use our online data request form [if available]</li>
            <li>Send a written request to our postal address [listed in contact section]</li>
          </ul>

          <h3 className="mb-3 text-xl font-medium">Identity Verification</h3>
          <p className="mb-4">
            To protect your privacy and security, we may need to verify your identity before
            processing your request. This may involve:
          </p>
          <ul className="mb-6 list-disc space-y-2 pl-6">
            <li>Confirming your email address</li>
            <li>Asking for additional identifying information</li>
            <li>Requesting proof of identity documents</li>
          </ul>

          <h3 className="mb-3 text-xl font-medium">Response Time</h3>
          <p className="mb-4">
            We will respond to your request without undue delay and within one month of receipt. In
            complex cases, we may extend this period by up to two additional months, and we will
            inform you of any such extension.
          </p>

          <h3 className="mb-3 text-xl font-medium">Free of Charge</h3>
          <p>
            We will generally process your requests free of charge. However, we may charge a
            reasonable fee for manifestly unfounded or excessive requests, particularly if they are
            repetitive.
          </p>
        </section>

        {/* Legal Basis for Processing */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold">Legal Basis for Processing</h2>
          <p className="mb-4">
            Under GDPR, we must have a legal basis for processing your personal data. We process
            your data based on the following legal grounds:
          </p>

          <div className="space-y-4">
            <div>
              <h3 className="mb-2 text-lg font-medium">Consent</h3>
              <p className="text-sm">
                For marketing communications, cookies (non-essential), and other activities where
                you have given explicit consent.
              </p>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-medium">Contract Performance</h3>
              <p className="text-sm">
                To provide our services, process payments, and fulfill our contractual obligations
                to you.
              </p>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-medium">Legal Obligation</h3>
              <p className="text-sm">
                To comply with applicable laws, regulations, and legal processes.
              </p>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-medium">Legitimate Interests</h3>
              <p className="text-sm">
                For service improvement, security, fraud prevention, and other legitimate business
                purposes that don't override your fundamental rights.
              </p>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-medium">Vital Interests</h3>
              <p className="text-sm">
                To protect your vital interests or those of another person (rarely applicable).
              </p>
            </div>
          </div>
        </section>

        {/* Data Transfers */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold">International Data Transfers</h2>
          <p className="mb-4">
            When we transfer your personal data outside the European Economic Area (EEA), we ensure
            appropriate safeguards are in place:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong>Adequacy Decisions:</strong> Transfers to countries with adequate data
              protection laws
            </li>
            <li>
              <strong>Standard Contractual Clauses:</strong> EU-approved contracts that provide data
              protection guarantees
            </li>
            <li>
              <strong>Binding Corporate Rules:</strong> Internal policies for multinational
              organizations
            </li>
            <li>
              <strong>Certification Schemes:</strong> Industry-recognized data protection
              certifications
            </li>
          </ul>
        </section>

        {/* Data Protection Officer */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold">Data Protection Officer</h2>
          <p className="mb-4">
            We have appointed a Data Protection Officer (DPO) to oversee our data protection
            compliance. You can contact our DPO at:
          </p>
          <div className="bg-card rounded-lg border p-4">
            <p className="mb-2">
              <strong>Email:</strong>{' '}
              <a href="mailto:dpo@company.com" className="text-primary hover:underline">
                dpo@company.com
              </a>
            </p>
            <p>
              <strong>Postal Address:</strong> [DPO Address]
            </p>
          </div>
        </section>

        {/* Supervisory Authority */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold">Supervisory Authority</h2>
          <p className="mb-4">
            If you believe we have not adequately addressed your concerns, you have the right to
            lodge a complaint with your local data protection supervisory authority. For users in
            the EU, you can find your local authority at:
          </p>
          <p>
            <a
              href="https://edpb.europa.eu/about-edpb/about-edpb/members_en"
              className="text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              European Data Protection Board - Member Authorities
            </a>
          </p>
        </section>

        {/* Data Retention */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold">Data Retention</h2>
          <p className="mb-4">
            We retain your personal data only for as long as necessary to fulfill the purposes for
            which it was collected:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong>Account Data:</strong> Until account deletion plus 30 days for backup purposes
            </li>
            <li>
              <strong>Usage Analytics:</strong> 24 months from collection
            </li>
            <li>
              <strong>Marketing Data:</strong> Until consent is withdrawn
            </li>
            <li>
              <strong>Legal Requirements:</strong> As required by applicable laws (e.g., tax
              records)
            </li>
            <li>
              <strong>Security Logs:</strong> 12 months for security purposes
            </li>
          </ul>
        </section>

        {/* Security Measures */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold">Security Measures</h2>
          <p className="mb-4">
            We implement appropriate technical and organizational measures to ensure data security:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>Encryption of data in transit and at rest</li>
            <li>Regular security assessments and penetration testing</li>
            <li>Access controls and authentication mechanisms</li>
            <li>Employee training on data protection</li>
            <li>Incident response procedures</li>
            <li>Data backup and recovery systems</li>
          </ul>
        </section>

        {/* Breach Notification */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold">Data Breach Notification</h2>
          <p className="mb-4">
            In the event of a personal data breach that is likely to result in a high risk to your
            rights and freedoms, we will:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>Notify the relevant supervisory authority within 72 hours</li>
            <li>Inform affected individuals without undue delay</li>
            <li>Document the breach and our response measures</li>
            <li>Take immediate steps to contain and mitigate the breach</li>
          </ul>
        </section>

        {/* Children's Data */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold">Children's Data</h2>
          <p className="mb-4">
            Our service is not intended for children under 16 years of age (or the minimum age in
            their country for data processing consent). We do not knowingly collect personal data
            from children under this age.
          </p>
          <p>
            If we become aware that we have collected personal data from a child under the
            applicable age without parental consent, we will take steps to delete such information
            promptly.
          </p>
        </section>

        {/* Contact Information */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold">Contact Us</h2>
          <p className="mb-4">
            For any questions about GDPR compliance or to exercise your rights, please contact us:
          </p>
          <div className="bg-card space-y-2 rounded-lg border p-4">
            <p>
              <strong>GDPR Requests:</strong>{' '}
              <a href="mailto:gdpr@company.com" className="text-primary hover:underline">
                gdpr@company.com
              </a>
            </p>
            <p>
              <strong>General Privacy:</strong>{' '}
              <a href="mailto:privacy@company.com" className="text-primary hover:underline">
                privacy@company.com
              </a>
            </p>
            <p>
              <strong>Data Protection Officer:</strong>{' '}
              <a href="mailto:dpo@company.com" className="text-primary hover:underline">
                dpo@company.com
              </a>
            </p>
          </div>
        </section>
      </div>
    </LegalLayout>
  )
}
