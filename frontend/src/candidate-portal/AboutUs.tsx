import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Target, Users, Award } from 'lucide-react';
import SiteShell from '../components/layout/SiteShell';

const AboutUs: React.FC = () => {
  return (
    <SiteShell>
      <main>
        {/* ── ABOUT HERO ── */}
        <section className="inner-hero about-hero">
          <div className="inner-hero-bg" />
          <div className="h-container inner-hero-content">
            <span className="kicker">ABOUT ADYAPAN CAREER</span>
            <h1>
              People first. <br />
              <em>Opportunity always.</em>
            </h1>
            <p>
              A next-generation career platform designed to connect ambitious people with
              meaningful work and help organizations discover high-velocity emerging talent.
            </p>
          </div>
        </section>

        {/* ── OUR PURPOSE SPLIT STORY ── */}
        <section className="section-h">
          <div className="h-container split-story">
            <div>
              <span className="kicker">OUR PURPOSE</span>
              <h2>
                Turning potential <br />
                <em>into possibility.</em>
              </h2>
            </div>
            <div>
              <p>
                Adyapan brings real talent, transparent hiring, and corporate career opportunities closer together.
                The hiring platform creates a thoughtful, fast, and transparent
                experience for job seekers and corporate recruiters alike.
              </p>
              <p>
                We believe great hiring starts with visibility, context, and human-centered evaluation —
                not just rigid keyword filtering or endless application waiting times.
              </p>
            </div>
          </div>
        </section>

        {/* ── VALUE GRID & VALUE STACK ── */}
        <section className="section-soft-h section-h">
          <div className="h-container value-grid-h">
            <div className="value-card-h about-image-h">
              <span>APPLY · INTERVIEW · GET HIRED</span>
            </div>

            <div className="value-stack-h">
              <div>
                <span className="kicker">01</span>
                <h3>Industry-ready talent</h3>
                <p>
                  Give candidates opportunities to showcase practical skills, live projects, and
                  readiness from Day 1.
                </p>
              </div>
              <div>
                <span className="kicker">02</span>
                <h3>Career-focused growth</h3>
                <p>
                  Build a journey where every application, interview conversation, and offer adds
                  unstoppable momentum.
                </p>
              </div>
              <div>
                <span className="kicker">03</span>
                <h3>Human-centered hiring</h3>
                <p>
                  Use advanced AI tools to reduce friction while keeping people, empathy, and
                  potential at the center.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </SiteShell>
  );
};

export default AboutUs;
