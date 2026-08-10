import Breadcrumbs from '../components/Breadcrumbs';
import { usePageMeta } from '../hooks/usePageMeta';

const caseStudies = [
  {
    title: 'Retail point-of-sale rollout',
    summary:
      'Set up a full point-of-sale station for a local shop, including hardware selection, receipt printer, and network configuration, so the owner could start ringing up sales the same week.'
  },
  {
    title: 'Home office network upgrade',
    summary:
      'Replaced outdated routers and cabling for a home office to fix constant Wi-Fi drops, resulting in a stable connection across every room.'
  },
  {
    title: 'Custom gaming PC build',
    summary:
      'Worked with a customer to spec a gaming PC within budget, sourced the parts, and assembled and stress-tested the build before handoff.'
  }
];

const CaseStudies = () => {
  usePageMeta({
    title: 'Case Studies',
    description:
      'Examples of the kind of computer hardware, networking, and build projects ACE Computers SARL handles in Batroun, Lebanon.'
  });

  return (
    <div className="container space-y-10 py-12">
      <Breadcrumbs items={[{ label: 'Case studies', path: '/case-studies' }]} />

      <div className="space-y-3">
        <p className="chip">Case studies</p>
        <h1 className="text-3xl font-semibold text-ink">Example projects</h1>
        <p className="max-w-2xl text-sm text-muted">
          A look at the type of work we do beyond selling hardware off the shelf. Ask us about
          your own project &mdash; details below are illustrative examples of common requests.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {caseStudies.map((item) => (
          <div key={item.title} className="panel space-y-3 p-6">
            <h2 className="text-lg font-semibold text-ink">{item.title}</h2>
            <p className="text-sm text-muted">{item.summary}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CaseStudies;
