import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <Link href="/" className="footer-brand">
          inkline<span>.</span>
        </Link>

        <p>Ideas worth your time. Stories worth remembering.</p>

        <nav className="footer-links" aria-label="Legal">
          <Link href="/terms">Terms &amp; Conditions</Link>
          <Link href="/privacy">Privacy Policy</Link>
        </nav>

        <span className="footer-copyright">
          © 2026 Inkline.
          Articles © Siddartha Mishra. All rights reserved.
        </span>
      </div>
    </footer>
  );
}
