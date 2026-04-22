'use client'
import { useState } from 'react'

interface Props {
  onSuccess: () => void
}

const inputStyle = {
  width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border)',
  borderRadius: '10px', padding: '14px 16px', color: 'var(--text)',
  fontSize: '16px', fontFamily: 'var(--font-body)', outline: 'none',
}

const labelStyle = {
  fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px',
  display: 'block', fontFamily: 'var(--font-body)', letterSpacing: '0.3px'
}

const chipStyle = (active: boolean) => ({
  padding: '10px 20px', borderRadius: '100px', cursor: 'pointer',
  border: active ? '1px solid var(--accent)' : '1px solid var(--border)',
  background: active ? 'rgba(212,245,100,0.1)' : 'var(--surface)',
  color: active ? 'var(--accent)' : 'var(--text-muted)',
  fontSize: '14px', fontFamily: 'var(--font-body)', transition: 'all 0.15s',
})

export default function PreferenceForm({ onSuccess }: Props) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    phone: '',
    email: '',
    market: '',
    role: '',
    move_in_start: '',
    move_in_end: '',
    move_out_start: '',
    move_out_end: '',
    max_budget: '',
    room_type: 'any',
    furnished_required: false,
    utilities_required: false,
  })

  const set = (key: string, val: any) => setForm(f => ({ ...f, [key]: val }))

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')
      onSuccess()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const totalSteps = 4

  return (
    <div style={{
      maxWidth: '560px', margin: '0 auto', padding: '60px 24px'
    }}>
      {/* Progress */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '48px' }}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div key={i} style={{
            flex: 1, height: '3px', borderRadius: '2px',
            background: i < step ? 'var(--accent)' : 'var(--border)',
            transition: 'background 0.3s'
          }} />
        ))}
      </div>

      {/* Step 1: Who are you + market */}
      {step === 1 && (
        <div>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: '32px',
            fontWeight: 800, letterSpacing: '-1px', marginBottom: '8px'
          }}>Let's get you set up.</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '40px', fontSize: '15px' }}>
            60 seconds. Then we do the work.
          </p>

          <div style={{ marginBottom: '28px' }}>
            <label style={labelStyle}>I am a...</label>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {[
                { val: 'renter', label: '🏠 Looking for housing' },
                { val: 'lister', label: '📋 Listing my place' },
              ].map(({ val, label }) => (
                <button key={val} onClick={() => set('role', val)} style={chipStyle(form.role === val)}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '28px' }}>
            <label style={labelStyle}>Market</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {[
                { val: 'berkeley', label: '🐻 UC Berkeley' },
                { val: 'seattle', label: '⛰️ Seattle' },
              ].map(({ val, label }) => (
                <button key={val} onClick={() => set('market', val)} style={chipStyle(form.market === val)}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '28px' }}>
            <label style={labelStyle}>Phone number (for SMS alerts)</label>
            <input
              style={inputStyle}
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={form.phone}
              onChange={e => set('phone', e.target.value)}
            />
          </div>

          <div style={{ marginBottom: '40px' }}>
            <label style={labelStyle}>Email (optional backup)</label>
            <input
              style={inputStyle}
              type="email"
              placeholder="you@berkeley.edu"
              value={form.email}
              onChange={e => set('email', e.target.value)}
            />
          </div>

          <button
            disabled={!form.role || !form.market || !form.phone}
            onClick={() => setStep(2)}
            style={{
              width: '100%', background: 'var(--accent)', color: '#000',
              border: 'none', borderRadius: '12px', padding: '16px',
              fontSize: '16px', fontFamily: 'var(--font-display)', fontWeight: 700,
              cursor: form.role && form.market && form.phone ? 'pointer' : 'not-allowed',
              opacity: form.role && form.market && form.phone ? 1 : 0.4,
              letterSpacing: '-0.3px'
            }}
          >
            Continue →
          </button>
        </div>
      )}

      {/* Step 2: Dates */}
      {step === 2 && (
        <div>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: '32px',
            fontWeight: 800, letterSpacing: '-1px', marginBottom: '8px'
          }}>When do you need it?</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '40px', fontSize: '15px' }}>
            Give a range — we'll match listings with any overlap.
          </p>

          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Move-in window</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ ...labelStyle, fontSize: '11px' }}>Earliest</label>
                <input style={inputStyle} type="date" value={form.move_in_start}
                  onChange={e => set('move_in_start', e.target.value)} />
              </div>
              <div>
                <label style={{ ...labelStyle, fontSize: '11px' }}>Latest</label>
                <input style={inputStyle} type="date" value={form.move_in_end}
                  onChange={e => set('move_in_end', e.target.value)} />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '40px' }}>
            <label style={labelStyle}>Move-out window</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ ...labelStyle, fontSize: '11px' }}>Earliest</label>
                <input style={inputStyle} type="date" value={form.move_out_start}
                  onChange={e => set('move_out_start', e.target.value)} />
              </div>
              <div>
                <label style={{ ...labelStyle, fontSize: '11px' }}>Latest</label>
                <input style={inputStyle} type="date" value={form.move_out_end}
                  onChange={e => set('move_out_end', e.target.value)} />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => setStep(1)} style={{
              flex: 1, background: 'transparent', color: 'var(--text-muted)',
              border: '1px solid var(--border)', borderRadius: '12px', padding: '16px',
              fontSize: '15px', fontFamily: 'var(--font-body)', cursor: 'pointer'
            }}>← Back</button>
            <button
              disabled={!form.move_in_start || !form.move_out_end}
              onClick={() => setStep(3)}
              style={{
                flex: 2, background: 'var(--accent)', color: '#000',
                border: 'none', borderRadius: '12px', padding: '16px',
                fontSize: '16px', fontFamily: 'var(--font-display)', fontWeight: 700,
                cursor: form.move_in_start && form.move_out_end ? 'pointer' : 'not-allowed',
                opacity: form.move_in_start && form.move_out_end ? 1 : 0.4,
              }}
            >Continue →</button>
          </div>
        </div>
      )}

      {/* Step 3: Budget + preferences */}
      {step === 3 && (
        <div>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: '32px',
            fontWeight: 800, letterSpacing: '-1px', marginBottom: '8px'
          }}>Budget & preferences</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '40px', fontSize: '15px' }}>
            We'll only alert you on listings that fit.
          </p>

          <div style={{ marginBottom: '28px' }}>
            <label style={labelStyle}>Max monthly rent</label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)',
                color: 'var(--text-muted)', fontSize: '16px'
              }}>$</span>
              <input
                style={{ ...inputStyle, paddingLeft: '28px' }}
                type="number"
                placeholder="1800"
                value={form.max_budget}
                onChange={e => set('max_budget', e.target.value)}
              />
            </div>
          </div>

          <div style={{ marginBottom: '28px' }}>
            <label style={labelStyle}>Room type</label>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {[
                { val: 'any', label: 'Any' },
                { val: 'private', label: 'Private room' },
                { val: 'shared', label: 'Shared room' },
                { val: 'studio', label: 'Studio / 1BR' },
              ].map(({ val, label }) => (
                <button key={val} onClick={() => set('room_type', val)} style={chipStyle(form.room_type === val)}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '40px' }}>
            <label style={labelStyle}>Nice to haves</label>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={() => set('furnished_required', !form.furnished_required)}
                style={chipStyle(form.furnished_required)}
              >
                🛋️ Furnished
              </button>
              <button
                onClick={() => set('utilities_required', !form.utilities_required)}
                style={chipStyle(form.utilities_required)}
              >
                ⚡ Utilities included
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => setStep(2)} style={{
              flex: 1, background: 'transparent', color: 'var(--text-muted)',
              border: '1px solid var(--border)', borderRadius: '12px', padding: '16px',
              fontSize: '15px', fontFamily: 'var(--font-body)', cursor: 'pointer'
            }}>← Back</button>
            <button
              disabled={!form.max_budget}
              onClick={() => setStep(4)}
              style={{
                flex: 2, background: 'var(--accent)', color: '#000',
                border: 'none', borderRadius: '12px', padding: '16px',
                fontSize: '16px', fontFamily: 'var(--font-display)', fontWeight: 700,
                cursor: form.max_budget ? 'pointer' : 'not-allowed',
                opacity: form.max_budget ? 1 : 0.4,
              }}
            >Continue →</button>
          </div>
        </div>
      )}

      {/* Step 4: Confirm */}
      {step === 4 && (
        <div>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: '32px',
            fontWeight: 800, letterSpacing: '-1px', marginBottom: '8px'
          }}>Looks good?</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '40px', fontSize: '15px' }}>
            We'll text you at {form.phone} the moment something matches.
          </p>

          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: '16px', padding: '24px', marginBottom: '32px'
          }}>
            {[
              { label: 'Market', val: form.market === 'berkeley' ? '🐻 UC Berkeley' : '⛰️ Seattle' },
              { label: 'Role', val: form.role === 'renter' ? 'Looking for housing' : 'Listing my place' },
              { label: 'Move-in', val: `${form.move_in_start} → ${form.move_in_end}` },
              { label: 'Move-out', val: `${form.move_out_start} → ${form.move_out_end}` },
              { label: 'Max budget', val: `$${form.max_budget}/mo` },
              { label: 'Room type', val: form.room_type },
              { label: 'Furnished', val: form.furnished_required ? 'Required' : 'Not required' },
              { label: 'Utilities', val: form.utilities_required ? 'Required' : 'Not required' },
            ].map(({ label, val }) => (
              <div key={label} style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '10px 0', borderBottom: '1px solid var(--border)',
              }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{label}</span>
                <span style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 500 }}>{val}</span>
              </div>
            ))}
          </div>

          {error && (
            <div style={{
              background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.3)',
              borderRadius: '10px', padding: '12px 16px', marginBottom: '16px',
              fontSize: '14px', color: '#ff6b6b'
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => setStep(3)} style={{
              flex: 1, background: 'transparent', color: 'var(--text-muted)',
              border: '1px solid var(--border)', borderRadius: '12px', padding: '16px',
              fontSize: '15px', fontFamily: 'var(--font-body)', cursor: 'pointer'
            }}>← Back</button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                flex: 2, background: 'var(--accent)', color: '#000',
                border: 'none', borderRadius: '12px', padding: '16px',
                fontSize: '16px', fontFamily: 'var(--font-display)', fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Saving...' : 'Activate alerts 🚀'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
