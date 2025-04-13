import { useEffect, useRef } from 'react';

const useGridScrollPersist = (pageId:string, gridRef:any) => {
  // Save scroll position before unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (gridRef.current) {
        const scrollPosition = gridRef.current.state;
        localStorage.setItem(`grid-scroll-${pageId}`, JSON.stringify({
          scrollTop: scrollPosition.scrollTop,
          scrollLeft: scrollPosition.scrollLeft
        }));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [pageId, gridRef]);

  // Restore scroll position on mount
  useEffect(() => {
    const savedPosition = localStorage.getItem(`grid-scroll-${pageId}`);
    if (savedPosition && gridRef.current) {
      const { scrollTop, scrollLeft } = JSON.parse(savedPosition);
      gridRef.current.scrollTo({
        scrollTop,
        scrollLeft
      });
    }
  }, [pageId, gridRef]);
};

export default useGridScrollPersist;
