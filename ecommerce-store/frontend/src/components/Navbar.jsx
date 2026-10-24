import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Phone, MapPin, Search, ShoppingBag, X } from 'lucide-react';
import { siteConfig } from '../data/siteConfig';
import { useCart } from '../context/CartContext';
import Logo from './Logo';

const getLinkClass = ({ isActive }) =>
  `relative py-2 text-sm font-medium transition-colors ${
    isActive ? 'text-accent' : 'text-ink hover:text-accent'
  }`;

const telHref = `tel:${siteConfig.phone.replace(/\s+/g, '')}`;

const HeaderSearch = ({ className = '', onDone }) => {
  const navigate = useNavigate();
  const [term, setTerm] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const query = term.trim();
    navigate(query ? `/products?search=${encodeURIComponent(query)}` : '/products');
    setTerm('');
    onDone?.();
  };

  return (
    <form role="search" onSubmit={handleSubmit} className={`relative ${className}`}>
      <label htmlFor="header-search" className="sr-only">
        Search products
      </label>
      <Search
        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
        aria-hidden="true"
      />
      <input
        id="header-search"
        type="search"
        value={term}
        onChange={(event) => setTerm(event.target.value)}
        placeholder="Search laptops, GPUs, monitors"
        className="w-full rounded-full border border-line bg-mist py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-muted/80 transition focus:border-accent focus:bg-white focus:outline-none focus:ring-4 focus:ring-brandSoft"
      />
    </form>
  );
};

const Navbar = () => {
  const { totalItems } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
      {/* Store info strip */}
      <div className="hidden bg-charcoal text-white/85 md:block">
        <div className="container flex h-9 items-center justify-between text-xs">
          <a
            href={siteConfig.directionsUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 hover:text-white"
          >
            <MapPin className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
            {siteConfig.location}
          </a>
          <div className="flex items-center gap-6">
            <span>Cash on delivery &amp; in-store pickup</span>
            <a href={telHref} className="flex items-center gap-1.5 font-medium text-white hover:text-brand">
              <Phone className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
              {siteConfig.phone}
            </a>
          </div>
        </div>
      </div>

      <div className="border-b border-line">
        <div className="container flex h-16 items-center gap-4 lg:h-[4.5rem] lg:gap-8">
          <button
            type="button"
            className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-mist lg:hidden"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link to="/" className="flex shrink-0 items-center" aria-label={`${siteConfig.name} home`}>
            <Logo className="h-9 lg:h-11" />
          </Link>

          <nav className="hidden items-center gap-7 lg:flex" aria-label="Main">
            {siteConfig.navItems.map((item) => (
              <NavLink key={item.path} to={item.path} end={item.path === '/'} className={getLinkClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <HeaderSearch className="ml-auto hidden w-full max-w-xs md:block xl:max-w-sm" />

          <Link
            to="/cart"
            className="relative ml-auto flex h-11 items-center gap-2 rounded-full bg-charcoal pl-4 pr-4 text-sm font-semibold text-white transition-colors hover:bg-black md:ml-0"
            aria-label={totalItems ? `Cart, ${totalItems} items` : 'Cart'}
          >
            <ShoppingBag className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Cart</span>
            <span
              className={`flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-xs font-bold ${
                totalItems ? 'bg-brand text-charcoal' : 'bg-white/15 text-white/80'
              }`}
            >
              {totalItems || 0}
            </span>
          </Link>
        </div>

        {/* Mobile search */}
        <div className="container pb-3 md:hidden">
          <HeaderSearch />
        </div>
      </div>

      {/* Mobile menu (portaled: the header's backdrop-blur would otherwise trap position:fixed) */}
      {menuOpen &&
        createPortal(
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button
            type="button"
            className="absolute inset-0 bg-charcoal/40"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-[85%] max-w-sm flex-col bg-white shadow-2xl">
            <div className="flex h-16 items-center justify-between border-b border-line px-4">
              <Logo className="h-9" />
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-mist"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-col px-2 py-4" aria-label="Mobile">
              {siteConfig.navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `rounded-xl px-4 py-3 font-display text-lg font-medium ${
                      isActive ? 'bg-brandSoft text-accent' : 'text-ink hover:bg-mist'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <div className="mt-auto space-y-3 border-t border-line p-5 text-sm">
              <a href={telHref} className="flex items-center gap-2 font-semibold text-ink">
                <Phone className="h-4 w-4 text-accent" aria-hidden="true" />
                {siteConfig.phone}
              </a>
              <a
                href={siteConfig.directionsUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-muted"
              >
                <MapPin className="h-4 w-4 text-accent" aria-hidden="true" />
                {siteConfig.location}
              </a>
            </div>
          </div>
        </div>,
          document.body
        )}
    </header>
  );
};

export default Navbar;
