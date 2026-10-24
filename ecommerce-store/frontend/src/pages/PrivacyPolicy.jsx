import Breadcrumbs from '../components/Breadcrumbs';
import { usePageMeta } from '../hooks/usePageMeta';
import { siteConfig } from '../data/siteConfig';

const PrivacyPolicy = () => {
  usePageMeta({
    title: 'Privacy Policy',
    description: `Privacy policy for ${siteConfig.name}: what information we collect, how it is used, and how to contact us about it.`
  });

  return (
    <div className="container max-w-3xl space-y-8 pt-8 lg:pt-10">
      <Breadcrumbs items={[{ label: 'Privacy policy', path: '/privacy-policy' }]} />

      <div className="space-y-3">
        <h1 className="page-title">Privacy policy</h1>
        <p className="text-sm text-muted">Last updated: August 10, 2026.</p>
      </div>

      <div className="space-y-8 leading-relaxed text-muted">
        <section className="space-y-2">
          <h2 className="font-display text-xl font-medium text-ink">Information we collect</h2>
          <p>
            When you place an order, we collect the information you provide at checkout: your
            name, phone number, and delivery location. When you browse the site, we may also
            collect standard analytics data such as pages visited and general device/browser
            information.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="font-display text-xl font-medium text-ink">How we use your information</h2>
          <p>
            We use checkout information to confirm and fulfill your order, and to contact you
            about it. Analytics data helps us understand how the site is used so we can improve
            it. We do not sell your personal information.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="font-display text-xl font-medium text-ink">Sharing</h2>
          <p>
            We do not share your personal information with third parties except as needed to
            fulfill your order (for example, delivery) or where required by law.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="font-display text-xl font-medium text-ink">Cookies and analytics</h2>
          <p>
            This site may use cookies or similar technology for basic analytics (such as Google
            Analytics) to understand site usage. You can control cookies through your browser
            settings.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="font-display text-xl font-medium text-ink">Contact us</h2>
          <p>
            {'Questions about this policy or your data can be sent to '}
            <a href={`mailto:${siteConfig.email}`} className="font-medium text-accent hover:text-accentHover">
              {siteConfig.email}
            </a>
            {` or ${siteConfig.phone}.`}
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
