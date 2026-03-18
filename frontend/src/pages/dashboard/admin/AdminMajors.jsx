import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { majorApi } from '@/api';
import { Badge, SearchBar, Select, Table, Pagination, PageHeader, Card, Toast, ActionBtn, DeleteBtn, ConfirmModal } from './AdminShared';

const FIELD_OPTIONS = [
  { value: '', label: 'All Fields' },
  { value: 'Technology', label: 'Technology' },
  { value: 'Business', label: 'Business' },
  { value: 'Medicine', label: 'Medicine' },
  { value: 'Engineering', label: 'Engineering' },
  { value: 'Law', label: 'Law' },
  { value: 'Education', label: 'Education' },
  { value: 'Arts', label: 'Arts' },
  { value: 'Science', label: 'Science' },
  { value: 'Social Science', label: 'Social Science' },
];

const STEM_OPTIONS = [
  { value: '', label: 'All Tracks' },
  { value: 'true', label: 'STEM Only' },
  { value: 'false', label: 'Non-STEM' },
];

const FORM_FIELD_OPTIONS = [
  { value: '', label: 'Select field' },
  ...FIELD_OPTIONS.filter((option) => option.value),
];

const JOB_DEMAND_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'very_high', label: 'Very High' },
];
const JOB_DEMAND_FILTER_OPTIONS = [
  { value: '', label: 'All demand' },
  ...JOB_DEMAND_OPTIONS,
];

const DEMAND_COLORS = {
  low: '#94a3b8',
  medium: '#d97706',
  high: '#15803d',
  very_high: '#1B3A6B',
};

const EMPTY_FORM = {
  name: '',
  name_km: '',
  field_of_study: '',
  icon: '',
  description: '',
  average_salary: '',
  job_demand: 'medium',
  is_stem: false,
  is_featured: false,
};

export default function AdminMajors() {
  const [majors, setMajors] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [field, setField] = useState('');
  const [stem, setStem] = useState('');
  const [demandFilter, setDemandFilter] = useState('');
  const [salaryMin, setSalaryMin] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [confirm, setConfirm] = useState(null);
  const [highlightedId, setHighlightedId] = useState(null);
  const formCardRef = useRef(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  useEffect(() => {
    if (!highlightedId) return undefined;
    const timeout = setTimeout(() => setHighlightedId(null), 2200);
    return () => clearTimeout(timeout);
  }, [highlightedId]);

  const load = useCallback(() => {
    setLoading(true);
    majorApi.list({
      page,
      limit: 12,
      search: search || undefined,
      field_of_study: field || undefined,
      is_stem: stem || undefined,
    })
      .then((r) => {
        setMajors(r.data.data || r.data.majors || []);
        setTotal(r.data.total || 0);
        setPages(r.data.pages || Math.ceil((r.data.total || 0) / 12) || 1);
      })
      .catch(() => {
        setMajors([]);
        setTotal(0);
        setPages(1);
      })
      .finally(() => setLoading(false));
  }, [field, page, search, stem]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [search, field, stem]);

  const filteredMajors = useMemo(() => (
    majors.filter((major) => {
      if (demandFilter && major.job_demand !== demandFilter) return false;
      if (salaryMin && Number(major.average_salary || 0) < Number(salaryMin)) return false;
      return true;
    })
  ), [majors, demandFilter, salaryMin]);

  const formTitle = useMemo(() => (editing ? `Edit ${editing.name}` : 'Create Major'), [editing]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const startEdit = (major) => {
    setEditing(major);
    setForm({
      name: major.name || '',
      name_km: major.name_km || '',
      field_of_study: major.field_of_study || '',
      icon: major.icon || '',
      description: major.description || '',
      average_salary: major.average_salary || '',
      job_demand: major.job_demand || 'medium',
      is_stem: Boolean(major.is_stem),
      is_featured: Boolean(major.is_featured),
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowModal(false);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      showToast('Major name is required');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        name_km: form.name_km.trim() || null,
        field_of_study: form.field_of_study || null,
        icon: form.icon.trim() || null,
        description: form.description.trim() || null,
        average_salary: form.average_salary ? Number(form.average_salary) : null,
        job_demand: form.job_demand || null,
        is_stem: Boolean(form.is_stem),
        is_featured: Boolean(form.is_featured),
      };

      const res = editing?.id
        ? await majorApi.update(editing.id, payload)
        : await majorApi.create(payload);
      const savedMajor = res.data?.major;

      showToast(editing ? 'Major updated' : 'Major created');
      setHighlightedId(savedMajor?.id || editing?.id || null);
      closeModal();
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save major');
    } finally {
      setSaving(false);
    }
  };

  const toggleFlag = async (major, fieldName) => {
    try {
      await majorApi.update(major.id, { [fieldName]: !major[fieldName] });
      showToast('Major updated');
      setHighlightedId(major.id);
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update major');
    }
  };

  const handleDelete = async () => {
    if (!confirm?.id) return;
    try {
      await majorApi.remove(confirm.id);
      showToast('Major deleted');
      if (editing?.id === confirm.id) closeModal();
      setConfirm(null);
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete major');
    }
  };

  const cols = [
    {
      key: 'name',
      label: 'Major',
      filterRender: () => (
        <SearchBar value={search} onChange={setSearch} placeholder="Search majors..." />
      ),
      render: (m) => (
        <div style={{ minWidth: 240 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
              {m.icon || '📚'}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{m.name_km || m.slug}</div>
            </div>
          </div>
        </div>
      ),
      width: 280,
      minWidth: 280,
    },
    {
      key: 'field',
      label: 'Field',
      filterRender: () => (
        <Select value={field} onChange={setField} options={FIELD_OPTIONS} style={{ width: '100%', minWidth: 150 }} />
      ),
      render: (m) => m.field_of_study ? <Badge label={m.field_of_study} color="#4AAEE0" /> : <span style={{ fontSize: 12, color: '#94a3b8' }}>—</span>,
      width: 140,
      minWidth: 140,
    },
    {
      key: 'demand',
      label: 'Demand',
      filterRender: () => (
        <Select value={demandFilter} onChange={setDemandFilter} options={JOB_DEMAND_FILTER_OPTIONS} style={{ width: '100%', minWidth: 130 }} />
      ),
      render: (m) => m.job_demand ? <Badge label={m.job_demand.replace('_', ' ')} color={DEMAND_COLORS[m.job_demand] || '#64748b'} /> : <span style={{ fontSize: 12, color: '#94a3b8' }}>—</span>,
      width: 130,
      minWidth: 130,
    },
    {
      key: 'salary',
      label: 'Avg Salary',
      filterRender: () => (
        <input
          value={salaryMin}
          onChange={(e) => setSalaryMin(e.target.value)}
          placeholder="Min salary"
          type="number"
          style={{ width: '100%', minWidth: 110, padding: '8px 10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, color: '#1e293b', fontSize: 13, outline: 'none', fontFamily: "'DM Sans',sans-serif", boxSizing: 'border-box' }}
        />
      ),
      render: (m) => <span style={{ fontSize: 12, color: '#334155' }}>{m.average_salary ? `$${Number(m.average_salary).toLocaleString()}/yr` : '—'}</span>,
      width: 130,
      minWidth: 130,
    },
    {
      key: 'tags',
      label: 'Tags',
      filterRender: () => (
        <Select value={stem} onChange={setStem} options={STEM_OPTIONS} style={{ width: '100%', minWidth: 140 }} />
      ),
      render: (m) => (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', minWidth: 160 }}>
          {m.is_stem && <Badge label="STEM" color="#15803d" />}
          {m.is_featured && <Badge label="Featured" color="#d97706" />}
          {!m.is_stem && !m.is_featured && <span style={{ fontSize: 12, color: '#94a3b8' }}>—</span>}
        </div>
      ),
      width: 180,
      minWidth: 180,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (m) => (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', minWidth: 120 }}>
          <ActionBtn onClick={() => startEdit(m)} color="#1B3A6B">Edit</ActionBtn>
          <DeleteBtn onClick={() => setConfirm({ id: m.id, name: m.name })} />
        </div>
      ),
      width: 140,
      minWidth: 140,
    },
  ];

  const renderFormFields = (mode) => (
    <form onSubmit={submit} style={{ display: 'grid', gap: 12 }}>
      <div>
        <label style={{ display: 'block', marginBottom: 6, fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Name</label>
        <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Computer Science" style={inputStyle} />
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: 6, fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Khmer Name</label>
        <input value={form.name_km} onChange={(e) => setForm((p) => ({ ...p, name_km: e.target.value }))} placeholder="វិទ្យាសាស្ត្រកុំព្យូទ័រ" style={inputStyle} />
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: 6, fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Field of Study</label>
        <Select
          value={form.field_of_study}
          onChange={(value) => setForm((p) => ({ ...p, field_of_study: value }))}
          options={FORM_FIELD_OPTIONS}
          style={{ width: '100%' }}
        />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '84px minmax(0, 1fr)', gap: 10 }}>
        <div>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Icon</label>
          <input value={form.icon} onChange={(e) => setForm((p) => ({ ...p, icon: e.target.value }))} placeholder="💻" style={inputStyle} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Average Salary</label>
          <input type="number" min="0" value={form.average_salary} onChange={(e) => setForm((p) => ({ ...p, average_salary: e.target.value }))} placeholder="12000" style={inputStyle} />
        </div>
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: 6, fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Job Demand</label>
        <Select
          value={form.job_demand}
          onChange={(value) => setForm((p) => ({ ...p, job_demand: value }))}
          options={JOB_DEMAND_OPTIONS}
          style={{ width: '100%' }}
        />
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: 6, fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Description</label>
        <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Describe the major and where it leads." rows={5} style={{ ...inputStyle, resize: 'vertical' }} />
      </div>
      <label style={checkboxLabelStyle}>
        <input type="checkbox" checked={form.is_stem} onChange={(e) => setForm((p) => ({ ...p, is_stem: e.target.checked }))} />
        <span>STEM major</span>
      </label>
      <label style={checkboxLabelStyle}>
        <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm((p) => ({ ...p, is_featured: e.target.checked }))} />
        <span>Feature on public pages</span>
      </label>

      <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
        <ActionBtn type="submit" color="#1B3A6B" title="Save major">{saving ? 'Saving...' : editing ? 'Update Major' : 'Create Major'}</ActionBtn>
        <ActionBtn onClick={closeModal} color="#64748b" title={mode === 'modal' ? 'Close modal' : 'Close form'}>
          Cancel
        </ActionBtn>
      </div>
    </form>
  );

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif" }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22, gap: 16 }}>
        <PageHeader title="Majors" subtitle="Manage academic majors and featured study tracks" count={total} />
        <button onClick={openCreate}
          style={{ padding: '9px 18px', borderRadius: 10, border: 'none', background: '#1B3A6B', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 2px 8px rgba(27,58,107,0.25)', whiteSpace: 'nowrap', marginTop: 2 }}
          onMouseEnter={e => e.currentTarget.style.background = '#15305a'}
          onMouseLeave={e => e.currentTarget.style.background = '#1B3A6B'}>
          + New Major
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 16, alignItems: 'start' }}>
        <Card>
          <Table
            columns={cols}
            rows={filteredMajors}
            loading={loading}
            emptyMsg="No majors found"
            getRowStyle={(row) => row.id === highlightedId ? { background: '#ecfdf5' } : undefined}
          />
          <div style={{ padding: '8px 16px 14px' }}>
            <Pagination page={page} pages={pages} onChange={setPage} />
          </div>
        </Card>
      </div>

      <Toast message={toast} />
      {confirm && <ConfirmModal message={`Delete major <strong>"${confirm.name}"</strong>? This cannot be undone.`} onConfirm={handleDelete} onCancel={() => setConfirm(null)} />}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, width: '100%', maxWidth: 520, maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0, fontFamily: "'Syne',sans-serif" }}>{formTitle}</h2>
                <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0' }}>
                  {editing ? 'Update this major in the academic catalog.' : 'Add a new major to the academic catalog.'}
                </p>
              </div>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 6, borderRadius: 8, fontSize: 18, lineHeight: 1 }}>
                ×
              </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
              {renderFormFields('modal')}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 10,
  border: '1px solid #e2e8f0',
  background: '#f8fafc',
  color: '#334155',
  fontSize: 13,
  outline: 'none',
  fontFamily: "'DM Sans',sans-serif",
  boxSizing: 'border-box',
};

const checkboxLabelStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  fontSize: 13,
  color: '#475569',
  fontWeight: 500,
};
