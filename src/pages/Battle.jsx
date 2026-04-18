import React, { useState } from 'react'

function StatusBadge({ status }) {
  const cfg = {
    done: { bg: '#ECFDF5', color: '#059669', label: 'Done' },
    partial: { bg: '#FFFBEB', color: '#D97706', label: 'Partial' },
    pending: { bg: '#F9FAFB', color: '#9CA3AF', label: 'Pending' },
  }
  const c = cfg[status] || cfg.pending
  return (
    <span style={{ fontSize: 10, fontWeight: 600, background: c.bg, color: c.color, padding: '2px 8px', borderRadius: 20 }}>
      {c.label}
    </span>
  )
}

function TargetRow({ t, person, onStatus, onDelete, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderTop: '1px solid #F3F4F6' }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{t.name}</p>
          {t.type === 'bonus' && <span style={{ fontSize: 10, fontWeight: 600, background: '#FFFBEB', color: '#D97706', padding: '1px 7px', borderRadius: 20 }}>BONUS</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color }}>{t.pts} pts</span>
          <StatusBadge status={t.status} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {t.status !== 'done' && (
          <button onClick={() => onStatus(person, t.id, 'done')} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #059669', background: '#ECFDF5', color: '#059669', fontSize: 11, fontWeight: 600 }}>Done</button>
        )}
        {t.status === 'pending' && (
          <button onClick={() => onStatus(person, t.id, 'partial')} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #D97706', background: '#FFFBEB', color: '#D97706', fontSize: 11, fontWeight: 600 }}>Partial</button>
        )}
        {t.status !== 'pending' && (
          <button onClick={() => onStatus(person, t.id, 'pending')} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #E5E7EB', background: '#F9FAFB', color: '#6B7280', fontSize: 11 }}>Reset</button>
        )}
        <button onClick={() => onDelete(person, t.id)} style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #FEE2E2', background: '#FEF2F2', color: '#EF4444', fontSize: 13, fontWeight: 600 }}>×</button>
      </div>
    </div>
  )
}

function AddForm({ person, onAdd, onCancel, type, color }) {
  const [name, setName] = useState('')
  const [pts, setPts] = useState('')

  function submit() {
    if (!name.trim() || !pts) return
    onAdd(person, {
      id: Date.now().toString(),
      name: name.trim(),
      pts: parseInt(pts),
      type,
      status: 'pending'
    })
    setName(''); setPts(''); onCancel()
  }

  return (
    <div style={{ background: type === 'bonus' ? '#FFFBEB' : '#F8FAFC', borderRadius: 10, padding: 14, marginBottom: 10, border: `1px solid ${type === 'bonus' ? '#FDE68A' : '#E5E7EB'}` }}>
      <p style={{ fontSize: 11, fontWeight: 600, color: type === 'bonus' ? '#D97706' : '#6B7280', marginBottom: 10 }}>
        {type === 'bonus' ? '⚡ New bonus work' : '🎯 New target'}
      </p>
      <input
        value={name} onChange={e => setName(e.target.value)}
        placeholder={type === 'bonus' ? 'What extra did you do?' : 'What is the target?'}
        style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 13, marginBottom: 8, outline: 'none' }}
        onKeyDown={e => e.key === 'Enter' && submit()}
        autoFocus
      />
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={pts} onChange={e => setPts(e.target.value)} type="number" placeholder="Points (e.g. 20)"
          style={{ width: 150, padding: '8px 12px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 13, outline: 'none' }}
          onKeyDown={e => e.key === 'Enter' && submit()}
        />
        <button onClick={submit} style={{ padding: '8px 18px', borderRadius: 8, background: color, color: '#fff', border: 'none', fontSize: 13, fontWeight: 600 }}>Add</button>
        <button onClick={onCancel} style={{ padding: '8px 14px', borderRadius: 8, background: '#F3F4F6', color: '#6B7280', border: 'none', fontSize: 13 }}>Cancel</button>
      </div>
    </div>
  )
}

export default function Battle({ people, monthData, scores, addTarget, updateStatus, deleteTarget, month, fmtMonth, setMonth }) {
  const [activePerson, setActivePerson] = useState('fenil')
  const [showForm, setShowForm] = useState(null)

  const mem = people[activePerson]
  const targets = monthData[activePerson] || []
  const planned = targets.filter(t => t.type !== 'bonus')
  const bonus = targets.filter(t => t.type === 'bonus')
  const s = scores[activePerson]

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <p style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 500 }}>Monthly Battle</p>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827' }}>{fmtMonth(month)}</h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => {
            const [y, m] = month.split('-').map(Number)
            const d = new Date(y, m - 2, 1)
            setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
          }} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff', fontSize: 13, color: '#6B7280' }}>← Prev</button>
          <button onClick={() => {
            const [y, m] = month.split('-').map(Number)
            const d = new Date(y, m, 1)
            setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
          }} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff', fontSize: 13, color: '#6B7280' }}>Next →</button>
        </div>
      </div>

      {/* Score strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        {Object.entries(people).map(([pk, m]) => {
          const s = scores[pk]
          const isActive = pk === activePerson
          return (
            <button key={pk} onClick={() => { setActivePerson(pk); setShowForm(null) }} style={{
              padding: '16px', borderRadius: 12, border: isActive ? `2px solid ${m.color}` : '1px solid #E5E7EB',
              background: isActive ? m.bg : '#fff', cursor: 'pointer', textAlign: 'left',
              transition: 'all 0.15s'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: m.bg, border: `2px solid ${m.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: m.color }}>{m.name[0]}</div>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{m.name}</span>
                </div>
                <span style={{ fontSize: 20, fontWeight: 800, color: m.color }}>{s.total}</span>
              </div>
              <div style={{ height: 4, background: '#E5E7EB', borderRadius: 2 }}>
                <div style={{ height: '100%', width: `${s.max > 0 ? Math.min(Math.round(s.base / s.max * 100), 100) : 0}%`, background: m.color, borderRadius: 2 }} />
              </div>
              <p style={{ fontSize: 10, color: '#9CA3AF', marginTop: 5 }}>{s.base} base + {s.bonus} bonus pts</p>
            </button>
          )
        })}
      </div>

      {/* Main panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16 }}>
        {/* Targets */}
        <div style={{ background: '#fff', borderRadius: 14, padding: '22px', border: '1px solid #F3F4F6', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <div>
              <p style={{ fontWeight: 700, fontSize: 16, color: '#111827' }}>Planned targets</p>
              <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>Set at start of month</p>
            </div>
            <button onClick={() => setShowForm(showForm === 'planned' ? null : 'planned')} style={{
              padding: '8px 16px', borderRadius: 8, background: mem.color, color: '#fff', border: 'none', fontSize: 13, fontWeight: 600
            }}>+ Add target</button>
          </div>

          {showForm === 'planned' && (
            <div style={{ marginTop: 14 }}>
              <AddForm person={activePerson} onAdd={addTarget} onCancel={() => setShowForm(null)} type="planned" color={mem.color} />
            </div>
          )}

          {!planned.length && <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: 16, padding: '20px 0' }}>No targets set yet. Add your first target for this month.</p>}

          {planned.map(t => (
            <TargetRow key={t.id} t={t} person={activePerson} onStatus={updateStatus} onDelete={deleteTarget} color={mem.color} />
          ))}
        </div>

        {/* Bonus + Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Score summary */}
          <div style={{ background: mem.bg, borderRadius: 14, padding: '20px', border: `1px solid ${mem.color}33` }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: mem.color, marginBottom: 12 }}>{mem.name}'s score</p>
            <p style={{ fontSize: 48, fontWeight: 800, color: mem.color, lineHeight: 1 }}>{s.total}</p>
            <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 6, marginBottom: 14 }}>points this month</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8 }}>
              <span style={{ color: '#6B7280' }}>Base</span>
              <span style={{ fontWeight: 600 }}>{s.base} pts</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8 }}>
              <span style={{ color: '#6B7280' }}>Bonus</span>
              <span style={{ fontWeight: 600, color: '#D97706' }}>+{s.bonus} pts</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 12 }}>
              <span style={{ color: '#6B7280' }}>Max possible</span>
              <span style={{ fontWeight: 600 }}>{s.max} pts</span>
            </div>
            <div style={{ height: 6, background: '#fff', borderRadius: 3 }}>
              <div style={{ height: '100%', width: `${s.max > 0 ? Math.min(Math.round(s.base / s.max * 100), 100) : 0}%`, background: mem.color, borderRadius: 3 }} />
            </div>
          </div>

          {/* Bonus work */}
          <div style={{ background: '#fff', borderRadius: 14, padding: '20px', border: '1px solid #F3F4F6', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: 15 }}>⚡ Bonus work</p>
                <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>Extra things done</p>
              </div>
              <button onClick={() => setShowForm(showForm === 'bonus' ? null : 'bonus')} style={{ padding: '6px 12px', borderRadius: 8, background: '#FFFBEB', color: '#D97706', border: '1px solid #FDE68A', fontSize: 12, fontWeight: 600 }}>+ Bonus</button>
            </div>

            {showForm === 'bonus' && (
              <div style={{ marginTop: 12 }}>
                <AddForm person={activePerson} onAdd={addTarget} onCancel={() => setShowForm(null)} type="bonus" color="#D97706" />
              </div>
            )}

            {!bonus.length && <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 12 }}>No bonus work logged yet.</p>}

            {bonus.map(t => (
              <TargetRow key={t.id} t={t} person={activePerson} onStatus={updateStatus} onDelete={deleteTarget} color="#D97706" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
