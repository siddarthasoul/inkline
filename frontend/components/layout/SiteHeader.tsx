import Link from 'next/link';

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand" aria-label="Inkline home">
          <img src="/inkline-mark.svg" alt="" className="brand-logo" width="32" height="32" />
          <span>inkline</span>
        </Link>

        <nav className="header-nav" aria-label="Main navigation">
          <Link href="/">Stories</Link>
          <Link href="/login" className="nav-owner-link">
            Owner login <span aria-hidden="true">↗</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
