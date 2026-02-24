import { useState } from 'react';

export default function CategoryDropdown({ value, options, onChange, onAddNew, disabled }) {
  const [addingNew, setAddingNew] = useState(false);
  const [newValue, setNewValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const normalizedOptions = (options || [])
    .map((item) => (item?.name ? item.name : item))
    .filter(Boolean);

  const handleSelect = (event) => {
    const selected = event.target.value;
    if (selected === '__add_new__') {
      setAddingNew(true);
      setNewValue('');
      setError('');
      return;
    }

    setAddingNew(false);
    setError('');
    onChange(selected);
  };

  const handleAdd = async () => {
    const trimmed = newValue.trim();
    if (!trimmed) {
      setError('Enter a category name.');
      return;
    }

    setSaving(true);
    setError('');
    const created = await onAddNew(trimmed);
    setSaving(false);

    if (created) {
      onChange(created.name || trimmed);
      setAddingNew(false);
      setNewValue('');
    }
  };

  const selectedValue = addingNew ? '__add_new__' : value || '';

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-ink">Category</label>
      <select
        value={selectedValue}
        onChange={handleSelect}
        disabled={disabled}
        className="w-full rounded-2xl border border-outline bg-transparent px-4 py-2 text-sm text-ink focus:border-accent focus:outline-none"
      >
        <option value="">Select a category</option>
        {normalizedOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
        <option value="__add_new__">+ Add new category</option>
      </select>

      {addingNew ? (
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={newValue}
            onChange={(event) => setNewValue(event.target.value)}
            className="flex-1 rounded-2xl border border-outline bg-transparent px-4 py-2 text-sm text-ink focus:border-accent focus:outline-none"
            placeholder="New category name"
            disabled={saving || disabled}
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={saving || disabled}
            className="rounded-full bg-accent px-4 py-2 text-xs font-semibold text-white"
          >
            {saving ? 'Saving...' : 'Add'}
          </button>
          <button
            type="button"
            onClick={() => setAddingNew(false)}
            disabled={saving || disabled}
            className="rounded-full border border-outline px-4 py-2 text-xs font-semibold text-ink"
          >
            Cancel
          </button>
        </div>
      ) : null}

      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  );
}
