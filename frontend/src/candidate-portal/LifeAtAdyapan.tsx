import React from 'react';
import SiteShell from '../components/layout/SiteShell';

const photos = [
  '/adyapan-team-fun.png',
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=85',
];

const LifeAtAdyapan: React.FC = () => {
  return (
    <SiteShell>
      <main>
        {/* ── LIFE HERO ── */}
        <section className="inner-hero life-hero">
          <div className="inner-hero-bg" />
          <div className="h-container inner-hero-content">
            <span className="kicker">LIFE AT ADYAPAN</span>
            <h1>
              Work with purpose. <br />
              <em>Grow together.</em>
            </h1>
            <p>
              A culture built around curiosity, collaboration, learning, and the ambitious people
              who make Adyapan what it is.
            </p>
          </div>
        </section>

        {/* ── GALLERY SECTION ── */}
        <section className="section-h">
          <div className="h-container">
            <div className="section-head">
              <div>
                <span className="kicker">INSIDE ADYAPAN</span>
                <h2>
                  More than <br />
                  <em>a workplace.</em>
                </h2>
              </div>
              <p>
                Bring your ideas, ask bold questions, celebrate progress, and keep growing with a
                team that cares about true educational and career impact.
              </p>
            </div>
            <div className="life-gallery-h">
              {photos.map((src, i) => (
                <div className={`life-photo-h p${i}`} key={src}>
                  <img src={src} alt="Adyapan team environment" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── THE CULTURE STATEMENT ── */}
        <section className="statement section-h">
          <div className="h-container statement-inner">
            <span className="kicker" style={{ color: '#fff' }}>
              THE CULTURE
            </span>
            <h2>
              Curious minds. <br />
              <em>Kind people.</em>
            </h2>
            <p>
              We want talented people to do meaningful work, learn quickly, achieve uncapped success,
              and enjoy every step of the journey.
            </p>
          </div>
        </section>
      </main>
    </SiteShell>
  );
};

export default LifeAtAdyapan;
