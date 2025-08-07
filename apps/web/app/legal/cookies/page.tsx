import { Metadata } from 'next'
import { LegalLayout } from '@/components/legal/legal-layout'

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'Learn about how we use cookies and similar technologies.',
}

export default function CookiePolicyPage() {
  return (
    <LegalLayout title="Cookie Policy" lastUpdated="January 15, 2024">
      <div className="space-y-8">
        {/* Introduction */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold">What Are Cookies</h2>
          <p className="mb-4">
            Cookies are small text files that are stored on your computer or mobile device when you
            visit a website. They are widely used to make websites work more efficiently and provide
            information to website owners.
          </p>
          <p>
            This Cookie Policy explains how ProductName ("we," "us," or "our") uses cookies and
            similar technologies when you visit our website and use our services.
          </p>
        </section>

        {/* How We Use Cookies */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold">How We Use Cookies</h2>
          <p className="mb-4">We use cookies for several reasons:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong>Essential functionality:</strong> To provide core features of our service
            </li>
            <li>
              <strong>Security:</strong> To protect your account and prevent fraud
            </li>
            <li>
              <strong>Performance:</strong> To analyze how our service is used and improve it
            </li>
            <li>
              <strong>Personalization:</strong> To remember your preferences and settings
            </li>
            <li>
              <strong>Analytics:</strong> To understand user behavior and improve our service
            </li>
          </ul>
        </section>

        {/* Types of Cookies */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold">Types of Cookies We Use</h2>

          <h3 className="mb-3 text-xl font-medium">Strictly Necessary Cookies</h3>
          <p className="mb-4">
            These cookies are essential for the website to function properly. They enable core
            functionality such as page navigation, access to secure areas, and authentication. The
            website cannot function properly without these cookies.
          </p>
          <div className="mb-6 overflow-x-auto">
            <table className="border-border w-full border">
              <thead className="bg-muted">
                <tr>
                  <th className="border-border border px-4 py-2 text-left">Cookie Name</th>
                  <th className="border-border border px-4 py-2 text-left">Purpose</th>
                  <th className="border-border border px-4 py-2 text-left">Duration</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border-border border px-4 py-2">
                    <code>session_id</code>
                  </td>
                  <td className="border-border border px-4 py-2">
                    Authentication and session management
                  </td>
                  <td className="border-border border px-4 py-2">Session</td>
                </tr>
                <tr>
                  <td className="border-border border px-4 py-2">
                    <code>csrf_token</code>
                  </td>
                  <td className="border-border border px-4 py-2">Security and CSRF protection</td>
                  <td className="border-border border px-4 py-2">Session</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="mb-3 text-xl font-medium">Performance Cookies</h3>
          <p className="mb-4">
            These cookies collect information about how visitors use our website, such as which
            pages are visited most often and if users receive error messages. This data helps us
            improve how our website works.
          </p>
          <div className="mb-6 overflow-x-auto">
            <table className="border-border w-full border">
              <thead className="bg-muted">
                <tr>
                  <th className="border-border border px-4 py-2 text-left">Cookie Name</th>
                  <th className="border-border border px-4 py-2 text-left">Purpose</th>
                  <th className="border-border border px-4 py-2 text-left">Duration</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border-border border px-4 py-2">
                    <code>_analytics</code>
                  </td>
                  <td className="border-border border px-4 py-2">
                    Usage analytics and performance monitoring
                  </td>
                  <td className="border-border border px-4 py-2">2 years</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="mb-3 text-xl font-medium">Functional Cookies</h3>
          <p className="mb-4">
            These cookies enable the website to provide enhanced functionality and personalization.
            They may be set by us or by third-party providers whose services we have added to our
            pages.
          </p>
          <div className="mb-6 overflow-x-auto">
            <table className="border-border w-full border">
              <thead className="bg-muted">
                <tr>
                  <th className="border-border border px-4 py-2 text-left">Cookie Name</th>
                  <th className="border-border border px-4 py-2 text-left">Purpose</th>
                  <th className="border-border border px-4 py-2 text-left">Duration</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border-border border px-4 py-2">
                    <code>theme</code>
                  </td>
                  <td className="border-border border px-4 py-2">
                    Remember user theme preference (dark/light mode)
                  </td>
                  <td className="border-border border px-4 py-2">1 year</td>
                </tr>
                <tr>
                  <td className="border-border border px-4 py-2">
                    <code>language</code>
                  </td>
                  <td className="border-border border px-4 py-2">
                    Remember user language preference
                  </td>
                  <td className="border-border border px-4 py-2">1 year</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="mb-3 text-xl font-medium">Targeting Cookies</h3>
          <p className="mb-4">
            These cookies may be set through our site by our advertising partners. They may be used
            by those companies to build a profile of your interests and show you relevant
            advertisements on other sites.
          </p>
          <p className="text-muted-foreground mb-4 text-sm">
            <em>
              Note: We currently do not use targeting cookies, but this section is included for
              future reference.
            </em>
          </p>
        </section>

        {/* Third-Party Cookies */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold">Third-Party Cookies</h2>
          <p className="mb-4">
            Some cookies on our website are set by third-party services that appear on our pages. We
            use the following third-party services that may set cookies:
          </p>

          <h3 className="mb-3 text-xl font-medium">Analytics Services</h3>
          <ul className="mb-4 list-disc space-y-2 pl-6">
            <li>
              <strong>Google Analytics:</strong> To understand how visitors interact with our
              website
            </li>
            <li>
              <strong>Cloudflare:</strong> For security and performance optimization
            </li>
          </ul>

          <h3 className="mb-3 text-xl font-medium">Security Services</h3>
          <ul className="mb-4 list-disc space-y-2 pl-6">
            <li>
              <strong>Cloudflare Turnstile:</strong> For bot protection and security verification
            </li>
          </ul>

          <p>
            These third parties have their own privacy policies and cookie policies. We recommend
            reviewing them to understand how they use cookies.
          </p>
        </section>

        {/* Managing Cookies */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold">Managing Cookies</h2>

          <h3 className="mb-3 text-xl font-medium">Browser Settings</h3>
          <p className="mb-4">
            Most web browsers allow you to control cookies through their settings. You can:
          </p>
          <ul className="mb-6 list-disc space-y-2 pl-6">
            <li>View what cookies are stored on your device</li>
            <li>Delete all cookies or specific ones</li>
            <li>Block cookies from specific sites</li>
            <li>Block all cookies</li>
            <li>Set your browser to notify you when cookies are being set</li>
          </ul>

          <h3 className="mb-3 text-xl font-medium">Browser-Specific Instructions</h3>
          <div className="space-y-3">
            <p>
              <strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data
            </p>
            <p>
              <strong>Firefox:</strong> Options → Privacy & Security → Cookies and Site Data
            </p>
            <p>
              <strong>Safari:</strong> Preferences → Privacy → Manage Website Data
            </p>
            <p>
              <strong>Edge:</strong> Settings → Cookies and site permissions → Cookies and site data
            </p>
          </div>

          <h3 className="mb-3 text-xl font-medium">Important Note</h3>
          <p>
            Please note that if you disable or delete certain cookies, some features of our website
            may not function properly, and you may not be able to access certain parts of our
            service.
          </p>
        </section>

        {/* Cookie Consent */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold">Cookie Consent</h2>
          <p className="mb-4">
            When you first visit our website, you will see a cookie consent banner. This banner
            explains our use of cookies and asks for your consent to use non-essential cookies.
          </p>
          <p className="mb-4">You can:</p>
          <ul className="mb-4 list-disc space-y-2 pl-6">
            <li>Accept all cookies</li>
            <li>Reject non-essential cookies</li>
            <li>Customize your cookie preferences</li>
          </ul>
          <p>
            You can change your cookie preferences at any time by clicking the "Cookie Settings"
            link in our website footer.
          </p>
        </section>

        {/* Mobile Devices */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold">Mobile Devices</h2>
          <p className="mb-4">
            If you access our service through a mobile device, we may collect device information and
            use mobile analytics to improve our service. This may include:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>Device type and operating system</li>
            <li>App usage statistics</li>
            <li>Crash reports and performance data</li>
          </ul>
        </section>

        {/* Local Storage */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold">Local Storage and Other Technologies</h2>
          <p className="mb-4">
            In addition to cookies, we may use other storage technologies such as:
          </p>
          <ul className="mb-4 list-disc space-y-2 pl-6">
            <li>
              <strong>Local Storage:</strong> To store user preferences and settings
            </li>
            <li>
              <strong>Session Storage:</strong> To maintain state during your session
            </li>
            <li>
              <strong>Web Beacons:</strong> To track email opens and interactions
            </li>
          </ul>
          <p>
            These technologies serve similar purposes to cookies and are subject to the same
            controls in your browser settings.
          </p>
        </section>

        {/* Updates */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold">Updates to This Policy</h2>
          <p>
            We may update this Cookie Policy from time to time to reflect changes in our practices
            or for other operational, legal, or regulatory reasons. We will notify you of any
            material changes by updating the "Last updated" date at the top of this policy.
          </p>
        </section>

        {/* More Information */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold">More Information</h2>
          <p className="mb-4">
            If you have questions about our use of cookies or this Cookie Policy, please contact us
            at{' '}
            <a href="mailto:privacy@company.com" className="text-primary hover:underline">
              privacy@company.com
            </a>
            .
          </p>
          <p>
            For more information about cookies in general, you can visit{' '}
            <a
              href="https://www.allaboutcookies.org"
              className="text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              www.allaboutcookies.org
            </a>
            .
          </p>
        </section>
      </div>
    </LegalLayout>
  )
}
