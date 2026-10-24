import { Link } from 'react-router-dom';
import { Cpu, Headset, Wifi } from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';
import { usePageMeta } from '../hooks/usePageMeta';
import { siteConfig } from '../data/siteConfig';

const whatWeDo = [
  {
    Icon: Cpu,
    title: 'Hardware that fits',
    text: 'Laptops, components, monitors, networking and accessories, chosen with you for what you actually need.'
  },
  {
    Icon: Headset,
    title: 'Custom PC builds',
    text: 'Tell us your budget and what you will use it for. We help you pick parts and put the build together.'
  },
  {
    Icon: Wifi,
    title: 'Internet since 1998',
    text: 'ACE has been an internet service provider in Batroun since 1998.'
  }
];

const About = () => {
  usePageMeta({
    title: 'About & Team',
    description:
      'ACE Computers SARL has served Batroun, Lebanon with computer hardware and internet services since 1998. Meet the team behind the store.'
  });

  return (
    <div className="container space-y-14 pt-8 lg:space-y-20 lg:pt-10">
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: 'About', path: '/about' }]} />
        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-end lg:gap-16">
          <h1 className="font-display text-4xl font-medium leading-[1.08] tracking-[-0.03em] text-ink md:text-5xl">
            25+ years of helping Batroun get the right tech.
          </h1>
          <p className="text-lg leading-relaxed text-muted">
            {`${siteConfig.name} is a computer and multimedia store in Batroun, Lebanon, and an internet service provider since 1998. We help customers pick the right hardware, build custom PCs, and get reliable support after the sale.`}
          </p>
        </div>
      </div>

      <section className="grid gap-px overflow-hidden rounded-3xl border border-line bg-line md:grid-cols-3" aria-label="What we do">
        {whatWeDo.map(({ Icon, title, text }) => (
          <div key={title} className="space-y-3 bg-white p-7">
            <Icon className="h-6 w-6 text-accent" strokeWidth={1.75} aria-hidden="true" />
            <h2 className="font-display text-lg font-medium text-ink">{title}</h2>
            <p className="text-sm leading-relaxed text-muted">{text}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-8 lg:grid-cols-[1fr_2fr] lg:gap-16" aria-labelledby="team-heading">
        <h2 id="team-heading" className="section-title trace h-fit">
          The team
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {siteConfig.team.map((member) => (
            <div key={member.name} className="flex items-center gap-4 rounded-2xl bg-mist p-5">
              <div
                aria-hidden="true"
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand font-display text-lg font-semibold text-charcoal"
              >
                {member.name
                  .split(' ')
                  .map((part) => part[0])
                  .join('')}
              </div>
              <div>
                <p className="font-display text-lg font-medium text-ink">{member.name}</p>
                <p className="text-sm text-muted">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col items-start justify-between gap-6 rounded-4xl bg-charcoal p-8 text-white sm:p-10 md:flex-row md:items-center">
        <div className="space-y-2">
          <h2 className="font-display text-2xl font-semibold">Visit us on Hadadi Street</h2>
          <p className="text-white/70">{siteConfig.hoursNote}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/contact" className="inline-flex items-center rounded-full bg-brand px-6 py-3 text-sm font-semibold text-charcoal transition-colors hover:bg-white">
            Directions & contact
          </Link>
          <Link to="/products" className="inline-flex items-center rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-white">
            Browse products
          </Link>
        </div>
      </section>
    </div>
  );
};

export default About;
