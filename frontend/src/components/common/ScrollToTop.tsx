import { useEffect, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop ensures that navigating between pages always starts at the top section (0, 0)
 * rather than retaining the scroll offset from the previously viewed page.
 * If a hash anchor is provided (e.g. #faq), it scrolls smoothly to that specific element.
 */
const ScrollToTop = () => {
  const { pathname, search, hash } = useLocation();

  useLayoutEffect(() => {
    // Disable browser default scroll restoration to prevent landing midway on route change
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    if (hash) {
      // If a specific section hash is requested, scroll to it
      const targetId = hash.replace('#', '');
      const timer = setTimeout(() => {
        const elem = document.getElementById(targetId);
        if (elem) {
          elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
        }
      }, 50);
      return () => clearTimeout(timer);
    } else {
      // Reset scroll position to top-left instantly on every page change
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      // Secondary micro-task to catch any asynchronous layout recalculations
      const timer = setTimeout(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }, 10);
      return () => clearTimeout(timer);
    }
  }, [pathname, search, hash]);

  return null;
};

export default ScrollToTop;
