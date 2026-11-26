// Script for the first-run settings window (setup.html).
const fields = ['MONGODB_URI', 'ADMIN_EMAIL', 'ADMIN_PASSWORD'];
const $ = (id) => document.getElementById(id);
let imported = {};

const banner = (text, tone) => {
  const el = $('banner');
  el.textContent = text;
  el.className = `banner show ${tone}`;
};

const strength = () => {
  const value = $('ADMIN_PASSWORD').value;
  $('strength').textContent =
    value && value.length < 12 ? 'Tip: 12 or more characters, mixing words and numbers, is much harder to guess.' : '';
};

const fill = (values) => {
  fields.forEach((key) => {
    if (values[key]) $(key).value = values[key];
  });
  strength();
};

window.adminSetup.load().then((current) => fill(current || {}));

$('ADMIN_PASSWORD').addEventListener('input', strength);

$('import').addEventListener('click', async () => {
  const result = await window.adminSetup.importEnvFile();
  if (!result) return;
  if (result.error) {
    banner(result.error, 'bad');
    return;
  }
  imported = result.values;
  fill(imported);
  banner('Loaded. Check the details, then save.', 'ok');
});

$('form').addEventListener('submit', async (event) => {
  event.preventDefault();
  fields.forEach((key) => {
    $(`${key}-error`).textContent = '';
  });
  const values = { ...imported };
  fields.forEach((key) => {
    values[key] = $(key).value.trim();
  });
  $('save').disabled = true;
  $('save').textContent = 'Saving…';
  const result = await window.adminSetup.save(values);
  if (result && result.errors) {
    Object.entries(result.errors).forEach(([key, message]) => {
      const el = $(`${key}-error`);
      if (el) el.textContent = message;
    });
    $('save').disabled = false;
    $('save').textContent = 'Save and open the admin app';
  }
});
