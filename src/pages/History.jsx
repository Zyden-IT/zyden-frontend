import React, { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export default function History({ allData, people, calcScore, fmtMonth }) {
  const months = useMemo(() => {
    const keys = Object.keys(allData.months || {}).sort().reverse()
    return keys.map(key => {
      const mdata = allData.months[key]
      const scores = {}
      let hasData = false
      Object.keys(people).forEach(pk => {
        const sc = calcScore(mdata[pk] || [], pk)
        scores[pk] = sc
        if (sc.total > 0) hasData = true
      })
      const winner = Object.entries(scores).sort((a, b) => b[1].total - a[1].total)[0]
      return { key, label: fmtMonth(key), scores, winner, hasData, mdata }
    }).filter(m => m.hasData)
  }, [allData])

  const chartData = useMemo(() => {
    const d = new Date()
    const result = []
    for (let i = 11; i >= 0; i--) {
      const dt = new Date(d.getFullYear(), d.getMonth() - i, 1)
      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`
      const mdata = allData.months?.[key] || {}
      const row = { month: dt.toLocaleString('default', { month: 'short' }) }
      Object.keys(people).forEach(pk => {
        row[people[pk].name] = calcScore(mdata[pk] || [], pk).total
      })
      result.push(row)
    }
    return result
  }, [allData])

  if (!months.length) {
    return (
      <div>
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 500 }}>All months</p>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>History</h1>
        </div>
        <div style={{ background: '#fff', borderRadius: 14, padding: '48px', textAlign: 'center', border: '1px solid #F3F4F6' }}>
          <p style={{ fontSize: 40, marginBottom: 12 }}>📅</p>
          <p style={{ fontSize: 16, fontWeight: 600, color: '#111827', marginBottom: 6 }}>No history yet</p>
          <p style={{ fontSize: 13, color: '#9CA3AF' }}>Add targets and log results to start tracking your progress.</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 500 }}>All months</p>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>History</h1>
      </div>

      {/* Chart */}
      <div style={{ background: '#fff', borderRadius: 14, padding: '22px', border: '1px solid #F3F4F6', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', marginBottom: 24 }}>
        <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>12-month comparison</p>
        <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 18 }}>Points per person per month</p>
        <div style={{ display: 'flex', gap: 16, marginBottom: 14 }}>
          {Object.entries(people).map(([pk, m]) => (
            <div key={pk} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: m.color }} />
              <span style={{ fontSize: 12, color: '#6B7280' }}>{m.name}</span>
            </div>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} barSize={18} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12 }} />
            {Object.entries(people).map(([pk, m]) => (
              <Bar key={pk} dataKey={m.name} fill={m.color} radius={[3, 3, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Month cards */}
      {months.map(({ key, label, scores, winner, mdata }) => (
        <div key={key} style={{ background: '#fff', borderRadius: 14, padding: '20px 24px', border: '1px solid #F3F4F6', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <p style={{ fontWeight: 700, fontSize: 16 }}>{label}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, color: '#9CA3AF' }}>Winner:</span>
              <span style={{ fontSize: 12, fontWeight: 700, background: people[winner[0]].bg, color: people[winner[0]].color, padding: '3px 10px', borderRadius: 20 }}>
                👑 {people[winner[0]].name} · {winner[1].total} pts
              </span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {Object.entries(people).map(([pk, mem]) => {
              const s = scores[pk]
              const pct = s.max > 0 ? Math.min(Math.round(s.base / s.max * 100), 100) : 0
              const isWinner = winner[0] === pk
              const targets = mdata[pk] || []
              const done = targets.filter(t => t.type !== 'bonus' && t.status === 'done').length
              const total = targets.filter(t => t.type !== 'bonus').length
              return (
                <div key={pk} style={{ padding: '14px', borderRadius: 10, background: isWinner ? mem.bg : '#F9FAFB', border: `1px solid ${isWinner ? mem.color + '44' : '#F3F4F6'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: mem.bg, border: `1.5px solid ${mem.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: mem.color }}>{mem.name[0]}</div>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{mem.name}</span>
                    </div>
                    <span style={{ fontSize: 20, fontWeight: 800, color: mem.color }}>{s.total}</span>
                  </div>
                  <div style={{ height: 4, background: '#E5E7EB', borderRadius: 2, marginBottom: 6 }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: mem.color, borderRadius: 2 }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9CA3AF' }}>
                    <span>{done}/{total} done</span>
                    <span>{s.bonus > 0 ? `+${s.bonus} bonus` : `${pct}%`}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
