import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar, Legend, BarChart, Bar
} from 'recharts'

function StatCard({ label, value, sub, color, bg, icon }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 14, padding: '20px 22px',
      border: '1px solid #F3F4F6', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      display: 'flex', flexDirection: 'column', gap: 10
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div>
          <p style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 500, marginBottom: 6 }}>{label}</p>
          <p style={{ fontSize: 28, fontWeight: 700, color: '#111827' }}>{value}</p>
          {sub && <p style={{ fontSize: 12, color: '#10B981', marginTop: 4, fontWeight: 500 }}>{sub}</p>}
        </div>
        <div style={{
          width: 44, height: 44, borderRadius: 12, background: bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20
        }}>{icon}</div>
      </div>
    </div>
  )
}

export default function Dashboard({ scores, people, monthData, allData, month, fmtMonth, setMonth, calcScore }) {
  const navigate = useNavigate()

  const allTargets = [
    ...(monthData.fenil || []),
    ...(monthData.dhruvi || []),
    ...(monthData.viren || [])
  ]
  const totalTargets = allTargets.filter(t => t.type !== 'bonus').length
  const doneTargets = allTargets.filter(t => t.type !== 'bonus' && t.status === 'done').length
  const totalBonus = allTargets.filter(t => t.type === 'bonus' && t.status === 'done').length
  const totalPts = Object.values(scores).reduce((s, sc) => s + sc.total, 0)

  const radialData = Object.entries(people).map(([pk, mem]) => {
    const s = scores[pk]
    return { name: mem.name, value: s.max > 0 ? Math.round(s.base / s.max * 100) : 0, fill: mem.color }
  })

  const barData = Object.entries(people).map(([pk, mem]) => {
    const s = scores[pk]
    return {
      name: mem.name,
      Base: s.base,
      Bonus: s.bonus,
      Remaining: Math.max(s.max - s.base, 0),
      color: mem.color
    }
  })

  // Last 6 months history
  const historyData = useMemo(() => {
    const months = []
    const d = new Date()
    for (let i = 5; i >= 0; i--) {
      const dt = new Date(d.getFullYear(), d.getMonth() - i, 1)
      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`
      const mdata = allData.months?.[key] || {}
      const total = ['fenil', 'dhruvi', 'viren'].reduce((s, p) => {
        const sc = calcScore(mdata[p] || [], p)
        return s + sc.total
      }, 0)
      months.push({ month: dt.toLocaleString('default', { month: 'short' }), points: total })
    }
    return months
  }, [allData])

  const leader = Object.entries(scores).sort((a, b) => b[1].total - a[1].total)[0]

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <p style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 500 }}>Overview</p>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827' }}>{fmtMonth(month)}</h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => {
            const [y, m] = month.split('-').map(Number)
            const d = new Date(y, m - 2, 1)
            setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
          }} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff', fontSize: 13, fontWeight: 500, color: '#6B7280' }}>← Prev</button>
          <button onClick={() => {
            const [y, m] = month.split('-').map(Number)
            const d = new Date(y, m, 1)
            setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
          }} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff', fontSize: 13, fontWeight: 500, color: '#6B7280' }}>Next →</button>
          <button onClick={() => navigate('/battle')} style={{
            padding: '8px 18px', borderRadius: 8, background: '#2563EB', color: '#fff',
            border: 'none', fontSize: 13, fontWeight: 600
          }}>+ Add Target ↗</button>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard label="Total Points" value={totalPts} sub="This month" icon="🏆" bg="#FFF7ED" />
        <StatCard label="Targets Set" value={totalTargets} sub={`${doneTargets} completed`} icon="🎯" bg="#EFF6FF" />
        <StatCard label="Bonus Tasks" value={totalBonus} sub="Extra work done" icon="⚡" bg="#F0FDF4" />
        <StatCard label="Leading" value={leader ? people[leader[0]].name : '—'} sub={`${leader?.[1].total || 0} pts`} icon="👑" bg="#FFF5F5" />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Area chart */}
        <div style={{ background: '#fff', borderRadius: 14, padding: '20px 20px 10px', border: '1px solid #F3F4F6', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 4 }}>Team Points · 6 months</p>
          <p style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 16 }}>Combined score trend</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={historyData}>
              <defs>
                <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12 }} />
              <Area type="monotone" dataKey="points" stroke="#2563EB" strokeWidth={2} fill="url(#blueGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Bar chart */}
        <div style={{ background: '#fff', borderRadius: 14, padding: '20px 20px 10px', border: '1px solid #F3F4F6', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 4 }}>Points Breakdown</p>
          <p style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 16 }}>Base vs Bonus this month</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={barData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12 }} />
              <Bar dataKey="Base" fill="#2563EB" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Bonus" fill="#F59E0B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Person cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {Object.entries(people).map(([pk, mem]) => {
          const s = scores[pk]
          const pct = s.max > 0 ? Math.min(Math.round(s.base / s.max * 100), 100) : 0
          const targets = monthData[pk] || []
          const done = targets.filter(t => t.type !== 'bonus' && t.status === 'done').length
          const total = targets.filter(t => t.type !== 'bonus').length
          const isLeading = leader?.[0] === pk && leader?.[1].total > 0
          return (
            <div key={pk} style={{ background: '#fff', borderRadius: 14, padding: '20px', border: isLeading ? `2px solid ${mem.color}` : '1px solid #F3F4F6', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 42, height: 42, borderRadius: '50%', background: mem.bg, border: `2px solid ${mem.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: mem.color }}>{mem.name[0]}</div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 15 }}>{mem.name}</p>
                    <p style={{ fontSize: 11, color: '#9CA3AF' }}>{mem.role}</p>
                  </div>
                </div>
                {isLeading && <span style={{ fontSize: 10, fontWeight: 700, background: mem.color, color: '#fff', padding: '3px 8px', borderRadius: 20 }}>LEADING</span>}
              </div>

              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <p style={{ fontSize: 40, fontWeight: 800, color: mem.color, lineHeight: 1 }}>{s.total}</p>
                <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>{s.base} base + {s.bonus} bonus pts</p>
              </div>

              <div style={{ height: 6, background: '#F3F4F6', borderRadius: 3, marginBottom: 14 }}>
                <div style={{ height: '100%', width: `${pct}%`, background: mem.color, borderRadius: 3, transition: 'width 0.4s' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6B7280' }}>
                <span>{done}/{total} targets done</span>
                <span style={{ fontWeight: 600, color: mem.color }}>{pct}%</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
