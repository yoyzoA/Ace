import { LayoutGrid } from 'lucide-react';
import { getCategoryIcon } from '../data/categoryIcons';
import PriceRangeSlider from './PriceRangeSlider';

const pillClass = (active) =>
  `rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
    active
      ? 'border-accent bg-accent text-white'
      : 'border-line bg-white text-ink hover:border-accent/60 hover:text-accent'
  }`;

const categoryRowClass = (active) =>
  `flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors ${
    active ? 'bg-brandSoft font-semibold text-accent' : 'text-ink hover:bg-mist'
  }`;

const Group = ({ title, children }) => (
  <div className="space-y-3 border-t border-line pt-5 first:border-t-0 first:pt-0">
    <h3 className="font-display text-sm font-semibold text-ink">{title}</h3>
    {children}
  </div>
);

const Filters = ({ options, value, onChange, onReset, resultCount, totalCount }) => {
  const isAll = value.category === 'all';

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted">
          <span className="font-semibold text-ink">{resultCount}</span>
          {` of ${totalCount} products`}
        </p>
        <button
          type="button"
          className="text-sm font-semibold text-accent hover:text-accentHover"
          onClick={onReset}
        >
          Reset
        </button>
      </div>

      <Group title="Category">
        <ul className="-mx-3 space-y-0.5">
          <li>
            <button type="button" onClick={() => onChange('category', 'all')} className={categoryRowClass(isAll)}>
              <LayoutGrid className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
              <span className="flex-1">All categories</span>
            </button>
          </li>
          {options.categories.map(({ name, count }) => {
            const Icon = getCategoryIcon(name);
            const active = value.category === name;
            return (
              <li key={name}>
                <button
                  type="button"
                  onClick={() => onChange('category', name)}
                  className={categoryRowClass(active)}
                  aria-pressed={active}
                >
                  <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
                  <span className="flex-1">{name}</span>
                  <span className={`text-xs ${active ? 'text-accent' : 'text-muted'}`}>{count}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </Group>

      {!isAll && options.subcategories.length > 0 && (
        <Group title="Type">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onChange('subcategory', 'all')}
              className={pillClass(value.subcategory === 'all')}
            >
              All
            </button>
            {options.subcategories.map((subcategory) => (
              <button
                key={subcategory}
                type="button"
                onClick={() => onChange('subcategory', subcategory)}
                className={pillClass(value.subcategory === subcategory)}
              >
                {subcategory}
              </button>
            ))}
          </div>
        </Group>
      )}

      <Group title="Brand">
        <label htmlFor="brand-filter" className="sr-only">
          Brand
        </label>
        <select
          id="brand-filter"
          className="field py-2.5"
          value={value.brand}
          onChange={(event) => onChange('brand', event.target.value)}
        >
          <option value="all">All brands</option>
          {options.brands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>
      </Group>

      <Group title="Price">
        <PriceRangeSlider
          bounds={options.priceBounds}
          value={value.priceRange}
          onChange={(range) => onChange('priceRange', range)}
        />
      </Group>

      <Group title="Availability">
        <label className="flex cursor-pointer items-center gap-3 text-sm text-ink">
          <input
            type="checkbox"
            checked={value.inStock}
            onChange={(event) => onChange('inStock', event.target.checked)}
            className="h-4 w-4 rounded border-lineStrong accent-[var(--color-accent)]"
          />
          In stock only
        </label>
        <label className="flex cursor-pointer items-center gap-3 text-sm text-ink">
          <input
            type="checkbox"
            checked={value.featured}
            onChange={(event) => onChange('featured', event.target.checked)}
            className="h-4 w-4 rounded border-lineStrong accent-[var(--color-accent)]"
          />
          Featured only
        </label>
      </Group>
    </div>
  );
};

export default Filters;
