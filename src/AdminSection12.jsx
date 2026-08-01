import { useEffect, useState } from 'react';

const SET_NUMBERS = ['1', '2', '3', '4'];
const EMPTY_SET = { assumption: '', reality: '', quote: '', audioSrc: '' };

function SetEditor({ number, value, onChange }) {
  const update = (field) => (e) => onChange(number, { ...value, [field]: e.target.value });

  return (
    <fieldset style={{ border: '1px solid #ccc', borderRadius: 8, padding: 16, marginBottom: 24 }}>
      <legend style={{ fontWeight: 700, padding: '0 8px' }}>Set {number}</legend>

      <label style={{ display: 'block', marginBottom: 12 }}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>We assumed</div>
        <textarea
          value={value.assumption}
          onChange={update('assumption')}
          rows={3}
          style={{ width: '100%', fontFamily: 'inherit', fontSize: 14, padding: 8 }}
        />
      </label>

      <label style={{ display: 'block', marginBottom: 12 }}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>What really happened</div>
        <textarea
          value={value.reality}
          onChange={update('reality')}
          rows={3}
          style={{ width: '100%', fontFamily: 'inherit', fontSize: 14, padding: 8 }}
        />
      </label>

      <label style={{ display: 'block', marginBottom: 12 }}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>What was said (quote)</div>
        <textarea
          value={value.quote}
          onChange={update('quote')}
          rows={3}
          style={{ width: '100%', fontFamily: 'inherit', fontSize: 14, padding: 8 }}
        />
      </label>

      <label style={{ display: 'block', marginBottom: 8 }}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>Audio file URL</div>
        <input
          type="text"
          value={value.audioSrc}
          onChange={update('audioSrc')}
          placeholder="https://... (leave blank to keep the static placeholder player)"
          style={{ width: '100%', fontFamily: 'inherit', fontSize: 14, padding: 8 }}
        />
      </label>
      {value.audioSrc && (
        // Lets you test a dropped-in URL right here, without needing to
        // jump to the real Section 12 preview.
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <audio controls src={value.audioSrc} style={{ width: '100%' }} />
      )}
    </fieldset>
  );
}

export default function AdminSection12() {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | ready | saving | saved | error

  useEffect(() => {
    fetch('/api/section12-content')
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, []);

  const updateSet = (number, value) => setData((prev) => ({ ...prev, [number]: value }));

  const handleSave = async () => {
    setStatus('saving');
    try {
      const res = await fetch('/api/section12-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('save failed');
      setStatus('saved');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 16px 96px', fontFamily: 'sans-serif', color: '#222' }}>
      <h1 style={{ fontSize: 24, marginBottom: 4 }}>Section 12 content editor</h1>
      <p style={{ color: '#666', marginBottom: 24 }}>
        Dev-only tool (only works while <code>npm run dev</code> is running) that edits{' '}
        <code>src/data/section12-content.json</code> directly. Once you're happy with your edits here, commit and
        push that file like any other change to ship it. <a href="/">&larr; Back to site</a>
      </p>

      {status === 'loading' && <p>Loading current content&hellip;</p>}
      {status === 'error' && !data && <p style={{ color: '#b00' }}>Couldn't load content. Is the dev server running?</p>}

      {data &&
        SET_NUMBERS.map((number) => (
          <SetEditor key={number} number={number} value={data[number] ?? EMPTY_SET} onChange={updateSet} />
        ))}

      {data && (
        <div style={{ position: 'sticky', bottom: 0, background: 'white', padding: '16px 0', borderTop: '1px solid #ddd' }}>
          <button
            type="button"
            onClick={handleSave}
            disabled={status === 'saving'}
            style={{ padding: '10px 24px', fontSize: 16, fontWeight: 700, borderRadius: 8, background: '#ff6e40', color: 'white', border: 'none', cursor: 'pointer' }}
          >
            {status === 'saving' ? 'Saving…' : 'Save'}
          </button>
          {status === 'saved' && <span style={{ marginLeft: 12, color: '#0a0' }} role="status">Saved -- reload the site to see it.</span>}
          {status === 'error' && <span style={{ marginLeft: 12, color: '#b00' }} role="alert">Save failed. Try again.</span>}
        </div>
      )}
    </div>
  );
}
