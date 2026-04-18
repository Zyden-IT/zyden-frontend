import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Battle from './pages/Battle'
import History from './pages/History'

const API = 'http://localhost:5000/api'

function fmtMonth(k) {
  const [y, m] = k.split('-')
  return new Date(parseInt(y), parseInt(m) - 1, 1)
    .toLocaleString('default', { month: 'long', year: 'numeric' })
}

function curMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function calcScore(targets, person) {
  const planned = targets.filter(t => t.type !== 'bonus')
  const bonus = targets.filter(t => t.type === 'bonus')
  const base = planned.reduce((s, t) => {
    if (t.status === 'done') return s + t.pts
    if (t.status === 'partial') return s + Math.round(t.pts * 0.5)
    return s
  }, 0)
  const bonusPts = bonus.reduce((s, t) => s + (t.status === 'done' ? t.pts : 0), 0)
  const max = planned.reduce((s, t) => s + t.pts, 0)
  return { base, bonus: bonusPts, total: base + bonusPts, max }
}

export default function App() {
  const [month, setMonth] = useState(curMonth())
  const [monthData, setMonthData] = useState({ fenil: [], dhruvi: [], viren: [] })
  const [allData, setAllData] = useState({ months: {} })
  const [loading, setLoading] = useState(true)

  async function fetchAll() {
    try {
      const r = await fetch(`${API}/data`)
      const d = await r.json()
      setAllData(d)
    } catch (e) { console.error(e) }
  }

  async function fetchMonth(m) {
    try {
      const r = await fetch(`${API}/month/${m}`)
      const d = await r.json()
      setMonthData(d)
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  useEffect(() => { fetchAll(); fetchMonth(month) }, [])
  useEffect(() => { fetchMonth(month) }, [month])

  async function addTarget(person, target) {
    await fetch(`${API}/month/${month}/target`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ person, target })
    })
    fetchMonth(month); fetchAll()
  }

  async function updateStatus(person, id, status) {
    await fetch(`${API}/month/${month}/target/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ person, status })
    })
    fetchMonth(month); fetchAll()
  }

  async function deleteTarget(person, id) {
    await fetch(`${API}/month/${month}/target/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ person })
    })
    fetchMonth(month); fetchAll()
  }

  const people = {
    fenil: { name: 'Fenil', color: '#2563EB', bg: '#EFF6FF', role: 'Sales · Marketing · Finance' },
    dhruvi: { name: 'Dhruvi', color: '#7C3AED', bg: '#F5F3FF', role: 'Product · Service · Operations' },
    viren: { name: 'Viren', color: '#059669', bg: '#ECFDF5', role: 'Creative · Execution' },
  }

  const scores = {
    fenil: calcScore(monthData.fenil || [], 'fenil'),
    dhruvi: calcScore(monthData.dhruvi || [], 'dhruvi'),
    viren: calcScore(monthData.viren || [], 'viren'),
  }

  const ctx = { month, setMonth, monthData, allData, scores, people, addTarget, updateStatus, deleteTarget, loading, fmtMonth, calcScore }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar people={people} scores={scores} month={month} fmtMonth={fmtMonth} />
      <div style={{ flex: 1, marginLeft: 240, padding: '28px 32px', minHeight: '100vh' }}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<Dashboard {...ctx} />} />
          <Route path="/battle" element={<Battle {...ctx} />} />
          <Route path="/history" element={<History {...ctx} />} />
        </Routes>
      </div>
    </div>
  )
}
