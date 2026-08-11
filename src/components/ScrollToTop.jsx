import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

const scrollPositions = new Map();

const ScrollToTop = () => {
  const { pathname } = useLocation();
  const navType = useNavigationType();
  const prevPathnameRef = useRef(pathname);

  // Monitor scroll position continuously on hub/list pages
  useEffect(() => {
    const handleScroll = () => {
      if (['/games', '/conversation', '/stories', '/levels', '/my-words'].includes(pathname)) {
        scrollPositions.set(pathname, window.scrollY);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  // Handle route change scroll behavior
  useEffect(() => {
    const prevPath = prevPathnameRef.current;
    
    // Save scroll position of page being left if valid
    if (prevPath && window.scrollY > 0) {
      scrollPositions.set(prevPath, window.scrollY);
    }

    const savedScroll = scrollPositions.get(pathname);
    const isReturningToGames = pathname === '/games' && (prevPath?.startsWith('/games/') || prevPath === '/conversation');
    const isReturningToConvo = pathname === '/conversation' && prevPath?.startsWith('/conversation');

    if (savedScroll !== undefined && (isReturningToGames || isReturningToConvo || navType === 'POP')) {
      // Restore scroll position after DOM renders
      const timer = setTimeout(() => {
        window.scrollTo({ top: savedScroll, behavior: 'instant' });
      }, 0);
      return () => clearTimeout(timer);
    } else {
      window.scrollTo(0, 0);
    }

    prevPathnameRef.current = pathname;
  }, [pathname, navType]);

  return null;
};

export default ScrollToTop;
