import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Copy, ImagePlus, Loader2, Plus, Star, Trash2, X } from 'lucide-react';
import { Drawer, Switch, Thumb } from './ui';
import { available } from '../lib/format';

const blank = {
  name: '',
  brand: '',
  category: '',
  subcategory: '',
  price: '',
  stock: 0,
  description: '',
  featured: false,
  published: true,
  images: [],
  specs: []
};

const fromProduct = (p) => ({
  name: p.name || '',
  brand: p.brand || '',
  category: p.category || '',
  subcategory: p.subcategory || '',
  price: p.price ?? '',
  stock: p.stock ?? 0,
  description: p.description || '',
  featured: Boolean(p.featured),
  published: p.published !== false,
  images: Array.isArray(p.images) ? p.images.filter(Boolean) : [],
  specs: Array.isArray(p.specs) ? p.specs.map((s) => ({ label: s.label || '', value: s.value || '' })) : []
});

function Field({ id, label, hint, children, className = '' }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="label">
        {label}
      </label>
      {children}
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

/*
  Side panel for adding or editing a product. `product` is null for a new one;
  `template` pre-fills a new product (used by Duplicate).
*/
export default function ProductEditor({
  open,
  product,
  template,
  onClose,
  onSave,
  onDelete,
  onDuplicate,
  saving,
  categories,
  brands,
  allProducts
}) {
  const [form, setForm] = useState(blank);
  const [newImage, setNewImage] = useState('');
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(product ? fromProduct(product) : template ? fromProduct(template) : blank);
    setNewImage('');
    setTouched(false);
  }, [open, product, template]);

  const subcategories = useMemo(() => {
    const set = new Set();
    (allProducts || []).forEach((p) => {
      if (p.subcategory && (!form.category || p.category === form.category)) set.add(p.subcategory);
    });
    return [...set].sort();
  }, [allProducts, form.category]);

  const set = (key) => (event) => setForm((f) => ({ ...f, [key]: event?.target ? event.target.value : event }));

  const priceInvalid = form.price === '' || !Number.isFinite(Number(form.price)) || Number(form.price) < 0;
  const invalid = !form.name.trim() || !form.brand.trim() || !form.category.trim() || priceInvalid;

  const addImage = () => {
    const url = newImage.trim();
    if (!url) return;
    setForm((f) => ({ ...f, images: [...f.images, url] }));
    setNewImage('');
  };

  const moveImage = (index, delta) =>
    setForm((f) => {
      const images = [...f.images];
      const [item] = images.splice(index, 1);
      images.splice(index + delta, 0, item);
      return { ...f, images };
    });

  const submit = (event) => {
    event.preventDefault();
    setTouched(true);
    if (invalid) return;
    onSave({
      ...form,
      price: Number(form.price),
      stock: Math.max(0, Math.floor(Number(form.stock) || 0))
    });
  };

  const reserved = Number(product?.reserved || 0);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      busy={saving}
      eyebrow={product ? 'Edit product' : template ? 'Duplicate product' : 'New product'}
      title={product ? product.name : form.name || 'Untitled product'}
      footer={
        <div className="flex flex-wrap items-center gap-2">
          {product ? (
            <>
              <button type="button" className="btn-ghost text-danger hover:text-danger" onClick={() => onDelete(product)} disabled={saving}>
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
              <button type="button" className="btn-ghost" onClick={() => onDuplicate(product)} disabled={saving}>
                <Copy className="h-4 w-4" />
                Duplicate
              </button>
            </>
          ) : null}
          <div className="ml-auto flex gap-2">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" form="product-form" className="btn-primary" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {saving ? 'Saving…' : product ? 'Save changes' : 'Add product'}
            </button>
          </div>
        </div>
      }
    >
      <form id="product-form" onSubmit={submit} className="space-y-7" noValidate>
        {/* Visibility */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-center justify-between gap-3 rounded-xl border border-line p-3">
            <div>
              <p className="text-sm font-semibold text-ink">Show on website</p>
              <p className="text-xs text-muted">Hidden products stay here.</p>
            </div>
            <Switch checked={form.published} onChange={set('published')} label="Show on website" />
          </div>
          <div className="flex items-center justify-between gap-3 rounded-xl border border-line p-3">
            <div>
              <p className="text-sm font-semibold text-ink">Featured</p>
              <p className="text-xs text-muted">Shown on the home page.</p>
            </div>
            <Switch checked={form.featured} onChange={set('featured')} label="Featured" />
          </div>
        </div>

        {/* Basics */}
        <section className="space-y-4">
          <p className="eyebrow">Details</p>
          <Field id="pf-name" label="Name">
            <input id="pf-name" className="field" value={form.name} onChange={set('name')} placeholder="e.g. JBL Flip 6 Bluetooth Speaker" />
            {touched && !form.name.trim() ? <p className="mt-1 text-xs text-danger">Add a name.</p> : null}
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field id="pf-brand" label="Brand">
              <input id="pf-brand" className="field" list="pf-brands" value={form.brand} onChange={set('brand')} placeholder="Choose or type" />
              <datalist id="pf-brands">
                {brands.map((b) => (
                  <option key={b} value={b} />
                ))}
              </datalist>
              {touched && !form.brand.trim() ? <p className="mt-1 text-xs text-danger">Add a brand.</p> : null}
            </Field>
            <Field id="pf-category" label="Category">
              <input id="pf-category" className="field" list="pf-categories" value={form.category} onChange={set('category')} placeholder="Choose or type" />
              <datalist id="pf-categories">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
              {touched && !form.category.trim() ? <p className="mt-1 text-xs text-danger">Add a category.</p> : null}
            </Field>
            <Field id="pf-sub" label="Subcategory">
              <input id="pf-sub" className="field" list="pf-subs" value={form.subcategory} onChange={set('subcategory')} placeholder="Optional" />
              <datalist id="pf-subs">
                {subcategories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="pf-price" label="Price (USD)">
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted">$</span>
                <input id="pf-price" type="number" min="0" step="0.01" inputMode="decimal" className="field pl-7 tabular" value={form.price} onChange={set('price')} placeholder="0.00" />
              </div>
              {touched && priceInvalid ? <p className="mt-1 text-xs text-danger">Enter a price of 0 or more.</p> : null}
            </Field>
            <Field
              id="pf-stock"
              label="Stock"
              hint={reserved ? `${reserved} held by pending orders, ${available({ stock: form.stock, reserved })} available to sell.` : 'Units you have in the shop.'}
            >
              <input id="pf-stock" type="number" min="0" step="1" inputMode="numeric" className="field tabular" value={form.stock} onChange={set('stock')} />
            </Field>
          </div>
          <Field id="pf-desc" label="Description">
            <textarea id="pf-desc" rows={4} className="field resize-y" value={form.description} onChange={set('description')} placeholder="What it is, who it's for, what's in the box." />
          </Field>
        </section>

        {/* Photos */}
        <section className="space-y-3">
          <div className="flex items-baseline justify-between">
            <p className="eyebrow">Photos</p>
            <p className="text-xs text-muted">The first photo is the main one.</p>
          </div>
          {form.images.length ? (
            <ul className="space-y-2">
              {form.images.map((url, index) => (
                <li key={`${url}-${index}`} className="flex items-center gap-3 rounded-xl border border-line p-2">
                  <Thumb src={url} size="h-14 w-14" />
                  <div className="min-w-0 flex-1">
                    {index === 0 ? (
                      <span className="chip mb-1 bg-accentSoft text-accent">
                        <Star className="h-3 w-3" /> Main photo
                      </span>
                    ) : null}
                    <p className="truncate text-xs text-muted" title={url}>
                      {url}
                    </p>
                  </div>
                  <div className="flex shrink-0">
                    <button type="button" className="icon-btn h-8 w-8" disabled={index === 0} onClick={() => moveImage(index, -1)} aria-label="Move photo up">
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button type="button" className="icon-btn h-8 w-8" disabled={index === form.images.length - 1} onClick={() => moveImage(index, 1)} aria-label="Move photo down">
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button type="button" className="icon-btn h-8 w-8 hover:text-danger" onClick={() => setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== index) }))} aria-label="Remove photo">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex items-center gap-3 rounded-xl border border-dashed border-line p-4 text-sm text-muted">
              <ImagePlus className="h-5 w-5 shrink-0" aria-hidden="true" />
              No photos yet. The website shows “Photo coming soon” until you add one.
            </div>
          )}
          <div className="flex gap-2">
            <label htmlFor="pf-newimage" className="sr-only">
              Photo link
            </label>
            <input
              id="pf-newimage"
              className="field"
              value={newImage}
              onChange={(e) => setNewImage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addImage();
                }
              }}
              placeholder="Paste a photo link (https://…)"
            />
            <button type="button" className="btn-secondary" onClick={addImage} disabled={!newImage.trim()}>
              <Plus className="h-4 w-4" />
              Add
            </button>
          </div>
        </section>

        {/* Specs */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="eyebrow">Specifications</p>
            <button type="button" className="btn-ghost px-2 py-1 text-xs" onClick={() => setForm((f) => ({ ...f, specs: [...f.specs, { label: '', value: '' }] }))}>
              <Plus className="h-3.5 w-3.5" />
              Add row
            </button>
          </div>
          {form.specs.length ? (
            <div className="space-y-2">
              {form.specs.map((spec, index) => (
                <div key={index} className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)_auto] gap-2">
                  <input
                    className="field"
                    value={spec.label}
                    placeholder="e.g. Battery"
                    aria-label={`Spec ${index + 1} name`}
                    onChange={(e) => setForm((f) => ({ ...f, specs: f.specs.map((s, i) => (i === index ? { ...s, label: e.target.value } : s)) }))}
                  />
                  <input
                    className="field"
                    value={spec.value}
                    placeholder="e.g. 12 hours"
                    aria-label={`Spec ${index + 1} value`}
                    onChange={(e) => setForm((f) => ({ ...f, specs: f.specs.map((s, i) => (i === index ? { ...s, value: e.target.value } : s)) }))}
                  />
                  <button type="button" className="icon-btn hover:text-danger" onClick={() => setForm((f) => ({ ...f, specs: f.specs.filter((_, i) => i !== index) }))} aria-label={`Remove spec ${index + 1}`}>
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">No specifications yet.</p>
          )}
        </section>
      </form>
    </Drawer>
  );
}
