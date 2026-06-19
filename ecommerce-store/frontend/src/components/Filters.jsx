import { useState } from 'react';
import CategoryWheel from './CategoryWheel';
import Modal from './Modal';

const Filters = ({ options, value, onChange, onReset, resultCount }) => {
  const [wheelOpen, setWheelOpen] = useState(false);
  const isAll = value.category === 'all';

  const handleCategorySelect = (key, category) => {
    onChange(key, category);
    setWheelOpen(false);
  };

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
          <button
            type="button"
            onClick={() => setWheelOpen(true)}
            className="flex w-full items-center justify-between rounded-xl border border-line bg-panelStrong px-3 py-2 text-sm text-ink transition hover:border-accent/60"
          >
            <span>{isAll ? 'All categories' : value.category}</span>
            <span className="text-xs font-semibold uppercase tracking-wide text-accent">
              Browse
            </span>
          </button>
        </div>

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
          <select
            className="w-full rounded-xl border border-line bg-panelStrong px-3 py-2 text-sm text-ink"
            value={value.priceRange}
            onChange={(event) => onChange('priceRange', event.target.value)}
          >
            {options.priceRanges.map((range) => (
              <option key={range.id} value={range.id}>
                {range.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {wheelOpen && (
        <Modal title="Choose a category" onClose={() => setWheelOpen(false)}>
          <CategoryWheel
            categories={options.categories}
            value={value.category}
            onChange={handleCategorySelect}
            size={320}
          />
        </Modal>
      )}
    </aside>
  );
};

export default Filters;
