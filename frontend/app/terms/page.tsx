
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms & Conditions | Inkline',
  description: 'Terms governing the use of Inkline and its published articles.',
};

export default function TermsPage() {
  return (
    <main className="article-detail-page">
      <div className="article-detail-container">
        <p className="login-eyebrow">INKLINE</p>
        <h1 className="article-detail-title">Terms &amp; Conditions</h1>

        <div className="article-detail-content">
          <p>Last updated: October 20, 2026</p>

          <p>
            Welcome to Inkline. By accessing or using this website, you agree
            to these Terms &amp; Conditions. If you do not agree, please stop
            using the website.
          </p>

          <h2>1. About Inkline</h2>
          <p>
            Inkline is a website for publishing and reading articles,
            ideas, stories, and other written content.
          </p>

          <h2>2. Intellectual Property</h2>
          <p>
            Unless otherwise stated, original articles and other content
            published by Siddartha Mishra are protected by applicable
            intellectual property laws.
          </p>
          <p>
            You may read and share links to articles. You must not copy,
            republish, distribute, or commercially exploit protected content
            without permission, except where permitted by law.
          </p>
          <p>
            Third-party names, trademarks, quotations, and materials remain
            subject to their respective rights.
          </p>

          <h2>3. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use the website for unlawful purposes.</li>
            <li>Attempt to compromise the website or its security.</li>
            <li>Interfere with website services or abuse its features.</li>
            <li>Misrepresent authorship or submit fraudulent complaints.</li>
          </ul>

          <h2>4. Copyright Complaints</h2>
          <p>
            If you believe content on Inkline infringes your copyright,
            contact the site owner with the relevant URL, a description
            of the work, an explanation of the concern, and your contact
            information. We will review legitimate complaints and take
            appropriate action where warranted.
          </p>

          <h2>5. Accuracy and Availability</h2>
          <p>
            Articles are provided for general informational and educational
            purposes. We do not guarantee that every article is complete,
            accurate, or up to date. The website may occasionally be
            unavailable or change without notice.
          </p>

          <h2>6. External Links</h2>
          <p>
            Articles may link to third-party websites. Inkline does not
            control and is not responsible for their content or policies.
          </p>

          <h2>7. Limitation of Liability</h2>
          <p>
            To the extent permitted by applicable law, Inkline is not liable
            for losses arising from use of the website or reliance on its
            content. Nothing in these terms excludes liability that cannot
            lawfully be excluded.
          </p>

          <h2>8. Changes to These Terms</h2>
          <p>
            These terms may be updated from time to time. The latest version
            will be published on this page with its updated date.
          </p>

          <h2>9. Applicable Law</h2>
          <p>
            These terms are subject to applicable laws of India. Any
            jurisdiction or dispute provisions should be interpreted
            consistently with applicable law.
          </p>

          <h2>10. Contact</h2>
          <p>
            For questions about these terms or copyright concerns, contact
            the website owner using the contact details provided on Inkline.
          </p>
        </div>
      </div>
    </main>
  );
}
