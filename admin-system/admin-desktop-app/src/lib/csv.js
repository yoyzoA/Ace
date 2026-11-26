// Builds a CSV that Excel opens correctly (UTF-8 with BOM) and downloads it.
const cell = (value) => {
  const text = value === null || value === undefined ? '' : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export const downloadCsv = (filename, columns, rows) => {
  const lines = [columns.map((c) => cell(c.label)).join(',')];
  rows.forEach((row) => lines.push(columns.map((c) => cell(c.value(row))).join(',')));
  const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export const today = () => new Date().toISOString().slice(0, 10);
