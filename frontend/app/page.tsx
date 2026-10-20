import type { Metadata } from 'next';

import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { ArticleList } from '@/components/articles/ArticleList';

export const metadata: Metadata = {
  title: 'Stories worth reading',
  description:
    'Thoughtful articles, ideas, and stories for curious minds.',
};

export default function HomePage() {
  return (
    <>
      <SiteHeader />

      <main className="page-main">
        <section className="hero-section">
          <div className="container">
            <p className="eyebrow">
              <span className="eyebrow-dot" />
              AN INDEPENDENT JOURNAL
            </p>

            <h1 className="hero-title">
              A space for
              <br />
              <span>thoughtful ideas.</span>
            </h1>

            <div className="hero-bottom">
              <p className="hero-description">
                Stories, perspectives, and discoveries for people who
                like to look a little closer.
              </p>

              <a href="#latest-stories" className="hero-link">
                Explore the stories <span aria-hidden="true">↓</span>
              </a>
            </div>

            <div className="hero-rule">
              <span>CURIOUS MINDS, OPEN PAGES</span>
              <span>EST. 2026</span>
            </div>
          </div>
        </section>

        <section
          id="latest-stories"
          className="stories-section container"
        >
          <div className="section-heading">
            <div>
              <p className="eyebrow">THE READING ROOM</p>
              <h2>Latest stories<span>.</span></h2>
            </div>

            <p className="section-note">
              Take your time.
              <br />
              There’s no rush here.
            </p>
          </div>

          <ArticleList />
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
