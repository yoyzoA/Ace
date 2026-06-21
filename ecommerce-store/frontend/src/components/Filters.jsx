import { LayoutGrid } from 'lucide-react';
import { getCategoryIcon } from '../data/categoryIcons';
import PriceRangeSlider from './PriceRangeSlider';

const pillClass = (active) =>
  `flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
    active
      ? 'border-accent bg-accent text-canvas'
      : 'border-line bg-panelStrong text-muted hover:border-accent/60 hover:text-ink'
  }`;

const Filters = ({ options, value, onChange, onReset, resultCount }) => {
  const isAll = value.category === 'all';

  return (
    <aside className="panel space-y-6 p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-ink">Filters</p>
          <p className="text-xs text-muted">{resultCount} results</p>
        </div>
        <button
          type="button"
          className="text-xs font-semibold text-accent"
          onClick={onReset}
        >
          Reset
        </button>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-muted">
            Category
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onChange('category', 'all')}
              className={pillClass(isAll)}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              All
            </button>
            {options.categories.map((category) => {
              const Icon = getCategoryIcon(category);
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => onChange('category', category)}
                  className={pillClass(value.category === category)}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        {!isAll && options.subcategories.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted">
              Subcategory
            </label>
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
          </div>
        )}

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-muted">
            Brand
          </label>
          <select
            className="w-full rounded-xl border border-line bg-panelStrong px-3 py-2 text-sm text-ink"
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
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-muted">
            Price
          </label>
          <PriceRangeSlider
            bounds={options.priceBounds}
            value={value.priceRange}
            onChange={(range) => onChange('priceRange', range)}
          />
        </div>
      </div>
    </aside>
  );
};

export default Filters;
