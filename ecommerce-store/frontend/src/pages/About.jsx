import Breadcrumbs from '../components/Breadcrumbs';
import { usePageMeta } from '../hooks/usePageMeta';
import { siteConfig } from '../data/siteConfig';

const About = () => {
  usePageMeta({
    title: 'About & Team',
    description:
      'ACE Computers SARL has served Batroun, Lebanon with computer hardware and internet services since 1998. Meet the team behind the store.'
  });

  return (
    <div className="container space-y-10 py-12">
      <Breadcrumbs items={[{ label: 'About', path: '/about' }]} />

      <div className="space-y-3">
        <p className="chip">About us</p>
        <h1 className="text-3xl font-semibold text-ink">
          25+ years serving Batroun&apos;s tech needs
        </h1>
        <p className="max-w-2xl text-sm text-muted">
          {siteConfig.name} is a computer and multimedia store in Batroun, Lebanon, with more
          than 25 years of experience and an internet service provider since 1998. We help
          customers pick the right hardware, build custom PCs, and get reliable support after
          the sale.
        </p>
      </div>

      <div className="panel p-6">
        <h2 className="text-lg font-semibold text-ink">Meet the team</h2>
        <p className="mt-2 text-sm text-muted">
          Photo coming soon &mdash; add a real team photo to replace these placeholders.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {siteConfig.team.map((member) => (
            <div
              key={member.name}
              className="flex items-center gap-4 rounded-xl border border-line bg-panelStrong p-4"
            >
              <div
                aria-hidden="true"
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-line bg-canvas text-sm font-semibold text-accent"
              >
                {member.name
                  .split(' ')
                  .map((part) => part[0])
                  .join('')}
              </div>
              <div>
                <p className="font-semibold text-ink">{member.name}</p>
                <p className="text-xs text-muted">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default About;
