import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { siteConfig } from '../data/siteConfig';

const setMetaByName = (name, content) => {
  if (!content) return;
  let tag = document.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('name', name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
};

const setMetaByProperty = (property, content) => {
  if (!content) return;
  let tag = document.querySelector(`meta[property="${property}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('property', property);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
};

export const usePageMeta = ({ title, description, image, schema }) => {
  const location = useLocation();

  useEffect(() => {
    const baseTitle = siteConfig.name;
    const fullTitle = title ? `${title} | ${baseTitle}` : baseTitle;
    document.title = fullTitle;

    if (description) {
      setMetaByName('description', description);
      setMetaByProperty('og:description', description);
      setMetaByName('twitter:description', description);
    }

    setMetaByProperty('og:title', fullTitle);
    setMetaByName('twitter:title', fullTitle);

    const shareImage = `${siteConfig.siteUrl}${image || siteConfig.logo}`;
    setMetaByProperty('og:image', shareImage);
    setMetaByName('twitter:image', shareImage);

    const canonicalUrl = `${siteConfig.siteUrl}${location.pathname}`;
    let canonicalTag = document.querySelector('link[rel="canonical"]');
    if (!canonicalTag) {
      canonicalTag = document.createElement('link');
      canonicalTag.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalTag);
    }
    canonicalTag.setAttribute('href', canonicalUrl);
    setMetaByProperty('og:url', canonicalUrl);
  }, [title, description, image, location.pathname]);

  useEffect(() => {
    let script = document.querySelector('script[data-page-schema="true"]');

    if (schema) {
      if (!script) {
        script = document.createElement('script');
        script.type = 'application/ld+json';
        script.setAttribute('data-page-schema', 'true');
        document.head.appendChild(script);
      }
      script.text = JSON.stringify(schema);
    } else if (script) {
      script.remove();
    }
  }, [schema]);
};
