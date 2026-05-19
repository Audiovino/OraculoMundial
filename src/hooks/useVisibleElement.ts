import { useEffect, useRef, useState } from 'react';

/**
 * Hook para detectar si un elemento es visible en el viewport
 * Optimiza el renderizado de componentes 3D pesados
 */
export const useVisibleElement = (options?: IntersectionObserverInit) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, {
      threshold: 0.1,
      rootMargin: '50px', // Empezar a cargar 50px antes de ser visible
      ...options
    });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
      observer.disconnect();
    };
  }, [options]);

  return { ref, isVisible };
};
