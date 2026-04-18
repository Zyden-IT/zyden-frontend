import React from 'react'
import { NavLink } from 'react-router-dom'

const icons = {
  dashboard: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
      <rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/>
    </svg>
  ),
  battle: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
    </svg>
  ),
  history: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>
    </svg>
  ),
}

export default function Sidebar({ people, scores, month, fmtMonth }) {
  const nav = [
    { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { to: '/battle', label: 'Monthly Battle', icon: 'battle' },
    { to: '/history', label: 'History', icon: 'history' },
  ]

  return (
    <aside style={{
      width: 240, background: '#fff', borderRight: '1px solid #E5E7EB',
      position: 'fixed', top: 0, left: 0, height: '100vh',
      display: 'flex', flexDirection: 'column', zIndex: 100
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid #F3F4F6' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>Z</span>
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: 16, color: '#111827' }}>Zyden</p>
            <p style={{ fontSize: 11, color: '#9CA3AF' }}>Performance Tracker</p>
          </div>
        </div>
      </div>

      {/* Month */}
      <div style={{ padding: '14px 20px', background: '#F8FAFC', borderBottom: '1px solid #F3F4F6' }}>
        <p style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 2 }}>Current Month</p>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#2563EB' }}>{fmtMonth(month)}</p>
      </div>

      {/* Nav */}
      <nav style={{ padding: '16px 12px', flex: 1 }}>
        {nav.map(n => (
          <NavLink key={n.to} to={n.to} style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
            borderRadius: 8, marginBottom: 2, textDecoration: 'none', fontSize: 14, fontWeight: 500,
            color: isActive ? '#2563EB' : '#6B7280',
            background: isActive ? '#EFF6FF' : 'transparent',
            transition: 'all 0.15s'
          })}>
            {icons[n.icon]}
            {n.label}
          </NavLink>
        ))}
      </nav>

      {/* People scores */}
      <div style={{ padding: '16px 12px', borderTop: '1px solid #F3F4F6' }}>
        <p style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12, paddingLeft: 4 }}>Scoreboard</p>
        {Object.entries(people).map(([pk, mem]) => {
          const s = scores[pk]
          const pct = s.max > 0 ? Math.min(Math.round(s.base / s.max * 100), 100) : 0
          return (
            <div key={pk} style={{ marginBottom: 12, padding: '8px 10px', borderRadius: 8, background: '#F8FAFC' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%',
                    background: mem.bg, border: `1.5px solid ${mem.color}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, color: mem.color
                  }}>{mem.name[0]}</div>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{mem.name}</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: mem.color }}>{s.total}</span>
              </div>
              <div style={{ height: 4, background: '#E5E7EB', borderRadius: 2 }}>
                <div style={{ height: '100%', width: `${pct}%`, background: mem.color, borderRadius: 2, transition: 'width 0.4s' }} />
              </div>
            </div>
          )
        })}
      </div>
    </aside>
  )
}
