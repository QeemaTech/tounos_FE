import { useState, useEffect } from 'react';

export default function CrudForm({ fields, initialData, onSubmit, loading }) {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      const defaults = {};
      fields.forEach((f) => { defaults[f.name] = f.defaultValue ?? ''; });
      setFormData(defaults);
    }
  }, [initialData, fields]);

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.map((field) => (
        <div key={field.name}>
          <label className="label">{field.label}</label>
          {field.type === 'textarea' ? (
            <textarea
              value={formData[field.name] || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              className="input"
              rows={3}
              required={field.required}
            />
          ) : field.type === 'select' ? (
            <select
              value={formData[field.name] || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              className="input"
              required={field.required}
            >
              <option value="">Select...</option>
              {field.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          ) : field.type === 'multi-select' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200 max-h-48 overflow-y-auto">
              {field.options?.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-100 p-1.5 rounded-lg transition-colors">
                  <input
                    type="checkbox"
                    checked={(formData[field.name] || []).includes(opt.value)}
                    onChange={(e) => {
                      const current = formData[field.name] || [];
                      const next = e.target.checked 
                        ? [...current, opt.value]
                        : current.filter(v => v !== opt.value);
                      handleChange(field.name, next);
                    }}
                    className="w-4 h-4 rounded border-gray-300 text-[#1ea43e] focus:ring-[#1ea43e]"
                  />
                  <span className="text-gray-700">{opt.label}</span>
                </label>
              ))}
            </div>
          ) : field.type === 'checkbox' ? (
            <input
              type="checkbox"
              checked={!!formData[field.name]}
              onChange={(e) => handleChange(field.name, e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-[#1ea43e] focus:ring-[#1ea43e]"
            />
          ) : (
            <input
              type={field.type || 'text'}
              value={formData[field.name] || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              className="input"
              required={field.required}
              placeholder={field.placeholder}
            />
          )}
        </div>
      ))}
      <div className="flex justify-end gap-3 pt-4">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
}
