import { Metadata } from 'next'
import { LegalLayout } from '@/components/legal/legal-layout'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms and conditions for using our service.',
}

export default function TermsOfServicePage() {
  return (
    <LegalLayout title="Terms of Service" lastUpdated="January 15, 2024">
      <div className="space-y-8">
        {/* Introduction */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold">Introduction</h2>
          <p>
            These Terms of Service ("Terms") govern your use of ProductName's service operated by
            [Company Name] ("us," "we," or "our"). By accessing or using our service, you agree to
            be bound by these Terms. If you disagree with any part of these Terms, you may not
            access the service.
          </p>
        </section>

        {/* Acceptance of Terms */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold">Acceptance of Terms</h2>
          <p className="mb-4">
            By accessing and using this service, you accept and agree to be bound by the terms and
            provision of this agreement.
          </p>
          <p>
            If you do not agree to abide by the above, please do not use this service. We reserve
            the right to change these Terms at any time, and such changes will be effective
            immediately upon posting.
          </p>
        </section>

        {/* Use License */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold">Use License</h2>
          <p className="mb-4">
            Permission is granted to temporarily use our service for personal, non-commercial
            transitory viewing only. This is the grant of a license, not a transfer of title, and
            under this license you may not:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>Modify or copy the service materials</li>
            <li>Use the materials for any commercial purpose or for any public display</li>
            <li>Attempt to reverse engineer any software contained in our service</li>
            <li>Remove any copyright or other proprietary notations from the materials</li>
          </ul>
          <p className="mt-4">
            This license shall automatically terminate if you violate any of these restrictions and
            may be terminated by us at any time.
          </p>
        </section>

        {/* User Accounts */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold">User Accounts</h2>

          <h3 className="mb-3 text-xl font-medium">Account Creation</h3>
          <p className="mb-4">
            To access certain features of our service, you must register for an account. When you
            create an account, you must provide information that is accurate, complete, and current
            at all times.
          </p>

          <h3 className="mb-3 text-xl font-medium">Account Security</h3>
          <p className="mb-4">
            You are responsible for safeguarding the password and for maintaining the security of
            your account. You agree to:
          </p>
          <ul className="mb-6 list-disc space-y-2 pl-6">
            <li>Choose a strong, unique password</li>
            <li>Keep your login credentials confidential</li>
            <li>Notify us immediately of any unauthorized use of your account</li>
            <li>Accept responsibility for all activities that occur under your account</li>
          </ul>

          <h3 className="mb-3 text-xl font-medium">Account Termination</h3>
          <p>
            We may terminate or suspend your account immediately, without prior notice or liability,
            for any reason whatsoever, including breach of these Terms.
          </p>
        </section>

        {/* Acceptable Use */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold">Acceptable Use Policy</h2>
          <p className="mb-4">You agree not to use the service:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>For any unlawful purpose or to solicit others to perform acts</li>
            <li>
              To violate any international, federal, provincial, or state regulations, rules, laws,
              or local ordinances
            </li>
            <li>
              To infringe upon or violate our intellectual property rights or the intellectual
              property rights of others
            </li>
            <li>
              To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or
              discriminate
            </li>
            <li>To submit false or misleading information</li>
            <li>To upload or transmit viruses or any other type of malicious code</li>
            <li>To collect or track the personal information of others</li>
            <li>To spam, phish, pharm, pretext, spider, crawl, or scrape</li>
            <li>For any obscene or immoral purpose</li>
            <li>To interfere with or circumvent the security features of the service</li>
          </ul>
        </section>

        {/* Content and Intellectual Property */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold">Content and Intellectual Property</h2>

          <h3 className="mb-3 text-xl font-medium">Our Content</h3>
          <p className="mb-4">
            The service and its original content, features, and functionality are and will remain
            the exclusive property of [Company Name] and its licensors. The service is protected by
            copyright, trademark, and other laws.
          </p>

          <h3 className="mb-3 text-xl font-medium">User Content</h3>
          <p className="mb-4">
            Our service may allow you to post, link, store, share and otherwise make available
            certain information, text, graphics, videos, or other material ("Content"). You are
            responsible for the Content that you post to the service, including its legality,
            reliability, and appropriateness.
          </p>

          <p className="mb-4">
            By posting Content to the service, you grant us the right and license to use, modify,
            publicly perform, publicly display, reproduce, and distribute such Content on and
            through the service.
          </p>
        </section>

        {/* Privacy Policy */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold">Privacy Policy</h2>
          <p>
            Your privacy is important to us. Please review our Privacy Policy, which also governs
            your use of the service, to understand our practices.
          </p>
        </section>

        {/* Prohibited Uses */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold">Prohibited Uses</h2>
          <p className="mb-4">You may not use our service:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>To engage in any activity that disrupts or interferes with the service</li>
            <li>To attempt unauthorized access to other computer systems</li>
            <li>To engage in any activity that could disable, overburden, or impair the service</li>
            <li>To use any robot, spider, or other automatic device to monitor our service</li>
            <li>To introduce any viruses, trojan horses, worms, or other malicious code</li>
            <li>To attempt to gain unauthorized access to any portion of the service</li>
          </ul>
        </section>

        {/* Service Availability */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold">Service Availability</h2>
          <p className="mb-4">
            We strive to provide reliable service, but we cannot guarantee 100% uptime. The service
            may be temporarily unavailable due to maintenance, updates, or unforeseen circumstances.
          </p>
          <p>
            We reserve the right to modify or discontinue the service at any time with reasonable
            notice to users.
          </p>
        </section>

        {/* Disclaimer */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold">Disclaimer</h2>
          <p className="mb-4">
            The information on this service is provided on an "as is" basis. To the fullest extent
            permitted by law, this Company:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              Excludes all representations and warranties relating to this service and its contents
            </li>
            <li>
              Does not warrant that the service will be constantly available, or available at all
            </li>
            <li>
              Does not warrant that the information on this service is complete, true, accurate, or
              non-misleading
            </li>
          </ul>
        </section>

        {/* Limitation of Liability */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold">Limitation of Liability</h2>
          <p>
            In no event shall [Company Name], nor its directors, employees, partners, agents,
            suppliers, or affiliates, be liable for any indirect, incidental, special,
            consequential, or punitive damages, including without limitation, loss of profits, data,
            use, goodwill, or other intangible losses, resulting from your use of the service.
          </p>
        </section>

        {/* Indemnification */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold">Indemnification</h2>
          <p>
            You agree to defend, indemnify, and hold harmless [Company Name] and its licensee and
            licensors, and their employees, contractors, agents, officers and directors, from and
            against any and all claims, damages, obligations, losses, liabilities, costs or debt,
            and expenses (including but not limited to attorney's fees).
          </p>
        </section>

        {/* Termination */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold">Termination</h2>
          <p className="mb-4">
            We may terminate or suspend your account and bar access to the service immediately,
            without prior notice or liability, under our sole discretion, for any reason whatsoever
            and without limitation, including but not limited to a breach of the Terms.
          </p>
          <p>
            If you wish to terminate your account, you may simply discontinue using the service or
            contact us to request account deletion.
          </p>
        </section>

        {/* Governing Law */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold">Governing Law</h2>
          <p>
            These Terms shall be interpreted and governed by the laws of [Your Jurisdiction],
            without regard to its conflict of law provisions. Our failure to enforce any right or
            provision of these Terms will not be considered a waiver of those rights.
          </p>
        </section>

        {/* Changes to Terms */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold">Changes to Terms</h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any
            time. If a revision is material, we will provide at least 30 days notice prior to any
            new terms taking effect. What constitutes a material change will be determined at our
            sole discretion.
          </p>
        </section>

        {/* Contact Information */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold">Contact Information</h2>
          <p>
            If you have any questions about these Terms of Service, please contact us at{' '}
            <a href="mailto:legal@company.com" className="text-primary hover:underline">
              legal@company.com
            </a>
            .
          </p>
        </section>
      </div>
    </LegalLayout>
  )
}
