export default function SpecsEditor({ specs, onChange }) {
  const handleSpecChange = (index, field, value) => {
    const nextSpecs = specs.map((spec, specIndex) =>
      specIndex === index ? { ...spec, [field]: value } : spec
    );
    onChange(nextSpecs);
  };

  const handleAddSpec = () => {
    onChange([...specs, { label: '', value: '' }]);
  };

  const handleRemoveSpec = (index) => {
    onChange(specs.filter((_, specIndex) => specIndex !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-ink">Specs</p>
        <button
          type="button"
          onClick={handleAddSpec}
          className="rounded-full border border-outline px-3 py-1 text-xs font-semibold text-ink"
        >
          Add spec
        </button>
      </div>
      {specs.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-outline px-4 py-3 text-xs text-muted">
          No specs yet. Add labeled specs like CPU, GPU, or storage.
        </p>
      ) : null}
      {specs.map((spec, index) => (
        <div key={`${spec.label}-${spec.value}-${index}`} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <input
            value={spec.label}
            onChange={(event) => handleSpecChange(index, 'label', event.target.value)}
            placeholder="Label"
            className="rounded-2xl border border-outline bg-transparent px-4 py-2 text-sm text-ink focus:border-accent focus:outline-none"
          />
          <input
            value={spec.value}
            onChange={(event) => handleSpecChange(index, 'value', event.target.value)}
            placeholder="Value"
            className="rounded-2xl border border-outline bg-transparent px-4 py-2 text-sm text-ink focus:border-accent focus:outline-none"
          />
          <button
            type="button"
            onClick={() => handleRemoveSpec(index)}
            className="rounded-full border border-danger/40 px-3 py-2 text-xs font-semibold text-danger"
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}
