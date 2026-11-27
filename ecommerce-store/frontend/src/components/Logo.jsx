import { siteConfig } from '../data/siteConfig';

const Logo = ({ className = 'h-11' }) => (
  <>
    <img
      src={siteConfig.logoMark || siteConfig.logo}
      alt={`${siteConfig.name} logo`}
      className={`${className} w-auto object-contain`}
      width="793"
      height="283"
    />
    <span className="sr-only">{siteConfig.name}</span>
  </>
);

export default Logo;
