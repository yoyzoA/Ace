import { Link, NavLink } from 'react-router-dom';
import { siteConfig } from '../data/siteConfig';
import { useCart } from '../context/CartContext';

const getLinkClass = ({ isActive }) =>
  `text-sm font-semibold tracking-wide transition ${
    isActive ? 'text-accent' : 'text-ink hover:text-accent'
  }`;

const Navbar = () => {
  const { totalItems } = useCart();

  return (
    <header className="border-b border-line bg-canvas">
      <div className="container py-5">
        <div className="flex flex-wrap items-center gap-4">
          <Link to="/" className="flex items-center gap-3">
            {siteConfig.logo ? (
              <>
                <img
                  src={siteConfig.logo}
                  alt={`${siteConfig.name} logo`}
                  className="h-10 w-auto max-w-[160px] rounded-lg bg-white px-2 py-1 object-contain"
                />
                <span className="sr-only">{siteConfig.name}</span>
              </>
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-panel text-base font-bold text-accent">
                ACE
              </div>
            )}
            {!siteConfig.logo && (
              <div>
                <p className="font-display text-lg font-semibold">
                  {siteConfig.name}
                </p>
                <p className="text-xs text-muted">{siteConfig.tagline}</p>
              </div>
            )}
          </Link>

          <nav className="hidden flex-1 items-center justify-center gap-8 lg:flex">
            {siteConfig.navItems.map((item) => (
              <NavLink key={item.path} to={item.path} className={getLinkClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <Link to="/cart" className="btn-primary">
              Cart
              {totalItems ? (
                <span className="rounded-full bg-canvas/30 px-2 py-0.5 text-xs">
                  {totalItems}
                </span>
              ) : null}
            </Link>
          </div>
        </div>

        <nav className="mt-4 flex flex-wrap items-center gap-6 text-sm lg:hidden">
          {siteConfig.navItems.map((item) => (
            <NavLink key={item.path} to={item.path} className={getLinkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
