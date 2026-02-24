import { useEffect, useState } from 'react';
import BrandDropdown from './BrandDropdown';
import CategoryDropdown from './CategoryDropdown';
import SpecsEditor from './SpecsEditor';

const emptyForm = {
  name: '',
  price: '',
  stock: 0,
  category: '',
  brand: '',
  description: '',
  featured: false
};

const normalizeSpecs = (specs) =>
  Array.isArray(specs)
    ? specs.map((spec) => ({
        label: spec?.label ? String(spec.label) : '',
        value: spec?.value ? String(spec.value) : ''
      }))
    : [];

export default function ProductForm({
  open,
  onClose,
  onSubmit,
  initialProduct,
  saving,
  categories,
  brands,
  onAddCategory,
  onAddBrand
}) {
  const [formValues, setFormValues] = useState(emptyForm);
  const [images, setImages] = useState(['']);
  const [specs, setSpecs] = useState([]);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (initialProduct) {
      setFormValues({
        name: initialProduct.name || '',
        price: initialProduct.price ?? '',
        stock: initialProduct.stock ?? 0,
        category: initialProduct.category || '',
        brand: initialProduct.brand || '',
        description: initialProduct.description || '',
        featured: initialProduct.featured ?? false
      });
      setImages(
        Array.isArray(initialProduct.images) && initialProduct.images.length > 0
          ? initialProduct.images
          : ['']
      );
      setSpecs(normalizeSpecs(initialProduct.specs));
    } else {
      setFormValues(emptyForm);
      setImages(['']);
      setSpecs([]);
    }
  }, [open, initialProduct]);

  if (!open) {
    return null;
  }

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (index, value) => {
    const nextImages = images.map((image, imageIndex) =>
      imageIndex === index ? value : image
    );
    setImages(nextImages);
  };

  const handleAddImage = () => {
    setImages((prev) => [...prev, '']);
  };

  const handleRemoveImage = (index) => {
    setImages(images.filter((_, imageIndex) => imageIndex !== index));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    onSubmit({
      name: formValues.name.trim(),
      price: Number(formValues.price),
      stock: Number(formValues.stock),
      category: formValues.category.trim(),
      brand: formValues.brand.trim(),
      description: formValues.description.trim(),
      featured: Boolean(formValues.featured),
      images: images.map((image) => image.trim()).filter(Boolean),
      specs: specs
        .map((spec) => ({
          label: spec.label.trim(),
          value: spec.value.trim()
        }))
        .filter((spec) => spec.label || spec.value)
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
      <button
        type="button"
        className="absolute inset-0 bg-[rgba(20,30,38,0.35)]"
        onClick={saving ? undefined : onClose}
        aria-label="Close"
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-4xl animate-fade-up rounded-3xl border border-outline bg-panel p-8 shadow-pop"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
              {initialProduct ? 'Edit product' : 'Add product'}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">
              {initialProduct ? 'Update catalog item' : 'New catalog item'}
            </h2>
          </div>
          <button
            type="button"
            onClick={saving ? undefined : onClose}
            className="rounded-full border border-outline px-3 py-1 text-xs font-semibold text-muted"
          >
            Close
          </button>
        </div>

        <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm font-semibold text-ink">
              Name
              <input
                name="name"
                value={formValues.name}
                onChange={handleChange}
                className="w-full rounded-2xl border border-outline bg-transparent px-4 py-2 text-sm text-ink focus:border-accent focus:outline-none"
                placeholder="Product name"
                required
              />
            </label>
            <label className="space-y-2 text-sm font-semibold text-ink">
              Price
              <input
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={formValues.price}
                onChange={handleChange}
                className="w-full rounded-2xl border border-outline bg-transparent px-4 py-2 text-sm text-ink focus:border-accent focus:outline-none"
                placeholder="0.00"
                required
              />
            </label>
            <label className="space-y-2 text-sm font-semibold text-ink">
              Stock
              <input
                name="stock"
                type="number"
                min="0"
                value={formValues.stock}
                onChange={handleChange}
                className="w-full rounded-2xl border border-outline bg-transparent px-4 py-2 text-sm text-ink focus:border-accent focus:outline-none"
                placeholder="0"
                required
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <CategoryDropdown
              value={formValues.category}
              options={categories}
              onChange={(value) => setFormValues((prev) => ({ ...prev, category: value }))}
              onAddNew={onAddCategory}
              disabled={saving}
            />
            <BrandDropdown
              value={formValues.brand}
              options={brands}
              onChange={(value) => setFormValues((prev) => ({ ...prev, brand: value }))}
              onAddNew={onAddBrand}
              disabled={saving}
            />
          </div>

          <label className="space-y-2 text-sm font-semibold text-ink">
            Description
            <textarea
              name="description"
              value={formValues.description}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-2xl border border-outline bg-transparent px-4 py-2 text-sm text-ink focus:border-accent focus:outline-none"
              placeholder="Product description"
            />
          </label>

          <label className="flex items-center gap-3 rounded-2xl border border-outline px-4 py-3 text-sm font-semibold text-ink">
            <input
              name="featured"
              type="checkbox"
              checked={formValues.featured}
              onChange={handleChange}
              className="h-4 w-4 rounded border-outline text-accent focus:ring-accent"
            />
            Featured product
          </label>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-ink">Image URLs</p>
              <button
                type="button"
                onClick={handleAddImage}
                className="rounded-full border border-outline px-3 py-1 text-xs font-semibold text-ink"
              >
                Add URL
              </button>
            </div>
            {images.map((image, index) => (
              <div key={`${image}-${index}`} className="flex items-center gap-3">
                <input
                  value={image}
                  onChange={(event) => handleImageChange(index, event.target.value)}
                  className="w-full rounded-2xl border border-outline bg-transparent px-4 py-2 text-sm text-ink focus:border-accent focus:outline-none"
                  placeholder="https://..."
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="rounded-full border border-danger/40 px-3 py-2 text-xs font-semibold text-danger"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <SpecsEditor specs={specs} onChange={setSpecs} />

          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={saving ? undefined : onClose}
              className="rounded-full border border-outline px-5 py-2 text-sm font-semibold text-ink"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-accent px-6 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
