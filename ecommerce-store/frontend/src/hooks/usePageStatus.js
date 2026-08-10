import { useEffect } from 'react';

// Exposes the page's data-loading status on <body data-page-status="...">.
// The build-time prerenderer reads this to avoid saving a static snapshot
// while the page is still loading or failed to load its data.
export const usePageStatus = (status) => {
  useEffect(() => {
    if (!status) return undefined;

    document.body.dataset.pageStatus = status;

    return () => {
      delete document.body.dataset.pageStatus;
    };
  }, [status]);
};
