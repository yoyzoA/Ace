const Filters = ({ options, value, onChange, onReset, resultCount }) => (
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
        <select
          className="w-full rounded-xl border border-line bg-panelStrong px-3 py-2 text-sm text-ink"
          value={value.category}
          onChange={(event) => onChange('category', event.target.value)}
        >
          <option value="all">All categories</option>
          {options.categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
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
  </aside>
);

export default Filters;
