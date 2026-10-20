
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Inkline',
  description: 'How Inkline handles information and cookies.',
};

export default function PrivacyPage() {
  return (
    <main className="article-detail-page">
      <div className="article-detail-container">
        <p className="login-eyebrow">INKLINE</p>
        <h1 className="article-detail-title">Privacy Policy</h1>

        <div className="article-detail-content">
          <p>Last updated: October 20, 2026</p>

          <p>
            This policy explains how Inkline handles information when you
            visit the website, read articles, or use owner-only features.
          </p>

          <h2>1. Information We Process</h2>
          <p>
            Depending on how you use the website, information processed may
            include authentication details, account information, article
            interactions such as likes, and technical information needed to
            operate and secure the service.
          </p>

          <h2>2. Cookies</h2>
          <p>
            Inkline uses cookies to support authentication and remember
            anonymous article-like state. Some cookies may be HttpOnly,
            meaning browser JavaScript cannot read them. Production cookies
            are configured for secure HTTPS use.
          </p>
          <p>
            Clearing cookies or using another browser may affect whether
            the website recognizes a previous like.
          </p>

          <h2>3. How Information Is Used</h2>
          <p>Information may be used to:</p>
          <ul>
            <li>Operate the website and its features.</li>
            <li>Authenticate the site owner.</li>
            <li>Remember article-like state and count likes.</li>
            <li>Protect the service against errors, abuse, and security threats.</li>
          </ul>

          <h2>4. Storage and Service Providers</h2>
          <p>
            Information may be stored or processed by the database, hosting
            provider, and other service providers used to operate Inkline.
            Their locations and retention practices depend on the services
            selected for deployment.
          </p>

          <h2>5. Retention and Security</h2>
          <p>
            Information is retained as needed to operate the website,
            maintain records, and meet applicable legal obligations.
            Reasonable technical measures are used to protect information,
            but no internet service can guarantee absolute security.
          </p>

          <h2>6. Third-Party Links</h2>
          <p>
            Articles may link to external websites. Their privacy practices
            are governed by their own policies.
          </p>

          <h2>7. Your Requests</h2>
          <p>
            You may contact the site owner to ask about personal information
            associated with you or to request a correction or deletion,
            subject to applicable law and legitimate record-retention needs.
          </p>

          <h2>8. Changes to This Policy</h2>
          <p>
            This policy may be updated when the website or its services
            change. The latest version will appear on this page.
          </p>

          <h2>9. Contact</h2>
          <p>
            For privacy questions, contact the website owner using the
            contact details published on Inkline.
          </p>
        </div>
      </div>
    </main>
  );
}
