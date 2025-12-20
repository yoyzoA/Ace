import { useEffect } from 'react';
import { siteConfig } from '../data/siteConfig';

export const usePageMeta = ({ title, description }) => {
  useEffect(() => {
    const baseTitle = siteConfig.name;
    document.title = title ? `${title} | ${baseTitle}` : baseTitle;

    if (description) {
      const metaTag = document.querySelector('meta[name="description"]');
      if (metaTag) {
        metaTag.setAttribute('content', description);
      }
    }
  }, [title, description]);
};
