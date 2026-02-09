import { useCallback, useRef } from 'react';

export default function useScrollAnimation(options = {}) {
  const observerRef = useRef(null);

  const ref = useCallback((el) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('animate-visible');
          observer.unobserve(el);
        }
      },
      { threshold: options.threshold ?? 0.15 }
    );

    observer.observe(el);
    observerRef.current = observer;
  }, []);

  return ref;
}
