import { Metadata } from 'next'
import { LegalLayout } from '@/components/legal/legal-layout'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Learn how we collect, use, and protect your personal information.',
}

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated="January 15, 2024">
      <div className="space-y-8">
        {/* Introduction */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold">Introduction</h2>
          <p>
            This Privacy Policy describes how ProductName ("we," "us," or "our") collects, uses, and
            protects your information when you use our service. We are committed to protecting your
            privacy and handling your data transparently.
          </p>
        </section>

        {/* Information We Collect */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold">Information We Collect</h2>

          <h3 className="mb-3 text-xl font-medium">Personal Information</h3>
          <p className="mb-4">When you create an account or use our services, we may collect:</p>
          <ul className="mb-6 list-disc space-y-2 pl-6">
            <li>Name and contact information (email address, phone number)</li>
            <li>Account credentials (username, encrypted password)</li>
            <li>Profile information you choose to provide</li>
            <li>Billing information for paid services</li>
          </ul>

          <h3 className="mb-3 text-xl font-medium">Usage Data</h3>
          <p className="mb-4">
            We automatically collect certain information when you use our service:
          </p>
          <ul className="mb-6 list-disc space-y-2 pl-6">
            <li>Device information (IP address, browser type, operating system)</li>
            <li>Usage patterns and feature interactions</li>
            <li>Log data (access times, pages viewed, errors encountered)</li>
            <li>Cookies and similar tracking technologies</li>
          </ul>
        </section>

        {/* How We Use Your Information */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold">How We Use Your Information</h2>
          <p className="mb-4">We use your information for the following purposes:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong>Service Provision:</strong> To provide, maintain, and improve our services
            </li>
            <li>
              <strong>Account Management:</strong> To create and manage your account
            </li>
            <li>
              <strong>Communication:</strong> To send you updates, security alerts, and support
              messages
            </li>
            <li>
              <strong>Security:</strong> To protect against fraud and maintain service security
            </li>
            <li>
              <strong>Analytics:</strong> To understand how our service is used and improve user
              experience
            </li>
            <li>
              <strong>Legal Compliance:</strong> To comply with applicable laws and regulations
            </li>
          </ul>
        </section>

        {/* Information Sharing */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold">Information Sharing and Disclosure</h2>
          <p className="mb-4">
            We do not sell, rent, or trade your personal information. We may share your information
            only in the following circumstances:
          </p>

          <h3 className="mb-3 text-xl font-medium">Service Providers</h3>
          <p className="mb-4">
            We may share information with third-party service providers who help us operate our
            service, such as hosting providers, payment processors, and analytics services. These
            providers are contractually bound to protect your information.
          </p>

          <h3 className="mb-3 text-xl font-medium">Legal Requirements</h3>
          <p className="mb-4">
            We may disclose your information if required by law, court order, or government
            regulation, or if we believe disclosure is necessary to protect our rights or prevent
            harm.
          </p>

          <h3 className="mb-3 text-xl font-medium">Business Transfers</h3>
          <p>
            In the event of a merger, acquisition, or sale of our business, your information may be
            transferred as part of that transaction.
          </p>
        </section>

        {/* Data Security */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold">Data Security</h2>
          <p className="mb-4">
            We implement appropriate technical and organizational measures to protect your
            information:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>Encryption of data in transit and at rest</li>
            <li>Regular security assessments and updates</li>
            <li>Access controls and authentication measures</li>
            <li>Employee training on data protection practices</li>
          </ul>
          <p className="mt-4">
            However, no method of transmission over the internet or electronic storage is 100%
            secure. We cannot guarantee absolute security.
          </p>
        </section>

        {/* Your Rights */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold">Your Privacy Rights</h2>
          <p className="mb-4">
            Depending on your location, you may have the following rights regarding your personal
            information:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong>Access:</strong> Request a copy of the personal information we hold about you
            </li>
            <li>
              <strong>Correction:</strong> Request correction of inaccurate or incomplete
              information
            </li>
            <li>
              <strong>Deletion:</strong> Request deletion of your personal information
            </li>
            <li>
              <strong>Portability:</strong> Request transfer of your data to another service
            </li>
            <li>
              <strong>Restriction:</strong> Request restriction of processing your information
            </li>
            <li>
              <strong>Objection:</strong> Object to processing of your information for certain
              purposes
            </li>
          </ul>
          <p className="mt-4">
            To exercise these rights, please contact us at{' '}
            <a href="mailto:privacy@company.com" className="text-primary hover:underline">
              privacy@company.com
            </a>
            .
          </p>
        </section>

        {/* Data Retention */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold">Data Retention</h2>
          <p>
            We retain your personal information for as long as necessary to provide our services and
            fulfill the purposes outlined in this policy. We will delete or anonymize your
            information when it is no longer needed, unless we are required to retain it for legal
            or regulatory purposes.
          </p>
        </section>

        {/* International Transfers */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold">International Data Transfers</h2>
          <p>
            Your information may be transferred to and processed in countries other than your own.
            We ensure that such transfers are subject to appropriate safeguards, such as standard
            contractual clauses or adequacy decisions by relevant authorities.
          </p>
        </section>

        {/* Children's Privacy */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold">Children's Privacy</h2>
          <p>
            Our service is not intended for children under 13 years of age. We do not knowingly
            collect personal information from children under 13. If we become aware that we have
            collected personal information from a child under 13, we will take steps to delete such
            information.
          </p>
        </section>

        {/* Changes to Privacy Policy */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold">Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes
            by posting the new Privacy Policy on this page and updating the "Last updated" date. For
            significant changes, we may also send you a direct notification.
          </p>
        </section>
      </div>
    </LegalLayout>
  )
}
