import { useLayoutEffect, useState, RefObject } from 'react';

export function useResizeObserver<T extends HTMLElement>(ref: RefObject<T>) {
  const [entry, setEntry] = useState<ResizeObserverEntry | null>(null);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      setEntry(entries[0]);
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [ref]);

  return entry;
} 