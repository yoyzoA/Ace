import { siteConfig } from '../data/siteConfig';

let initialized = false;

export const initAnalytics = () => {
  const measurementId = siteConfig.gaMeasurementId;
  if (!measurementId || initialized) return;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', measurementId, { send_page_view: false });

  initialized = true;
};

export const trackPageView = (path) => {
  if (!siteConfig.gaMeasurementId || typeof window.gtag !== 'function') return;
  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: document.title,
    page_location: window.location.href
  });
};
