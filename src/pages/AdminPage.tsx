import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppLayout } from '../components/AppLayout'
import { supabase } from '../lib/supabase'
import type { Role, SubscriptionStatus } from '../auth/AuthContext'

type AdminUser = {
  id: string
  email: string
  display_name: string | null
  role: Role
  subscription_status: SubscriptionStatus
  plan: string | null
  stripe_customer_id: string | null
  subscription_ends_at: string | null
  ability_level: string
  onboarded_at: string | null
  created_at: string
  last_sign_in_at: string | null
}

const ROLE_OPTIONS: Role[] = ['user', 'admin']
const STATUS_OPTIONS: SubscriptionStatus[] = ['free', 'trialing', 'active', 'past_due', 'canceled', 'expired']
const STATUS_TINT: Record<SubscriptionStatus, { fg: string; bg: string; border: string }> = {
  free:      { fg: '#6E6E73', bg: 'rgba(0,0,0,0.04)',       border: 'rgba(0,0,0,0.10)' },
  trialing:  { fg: '#0066CC', bg: 'rgba(0,102,204,0.08)',   border: 'rgba(0,102,204,0.30)' },
  active:    { fg: '#1D7F3F', bg: 'rgba(29,127,63,0.08)',   border: 'rgba(29,127,63,0.30)' },
  past_due:  { fg: '#B07A1A', bg: 'rgba(176,122,26,0.10)',  border: 'rgba(176,122,26,0.30)' },
  canceled:  { fg: '#A52917', bg: 'rgba(214,57,35,0.08)',   border: 'rgba(214,57,35,0.30)' },
  expired:   { fg: '#6E6E73', bg: 'rgba(0,0,0,0.04)',       border: 'rgba(0,0,0,0.10)' },
}

export function AdminPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase.rpc('admin_list_users')
    if (error) {
      setError(error.message)
    } else {
      setUsers((data as AdminUser[] | null) ?? [])
    }
    setLoading(false)
  }

  useEffect(() => { void load() }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return users
    return users.filter(u =>
      u.email.toLowerCase().includes(q) ||
      (u.display_name?.toLowerCase().includes(q) ?? false) ||
      u.role.includes(q) ||
      u.subscription_status.includes(q)
    )
  }, [users, query])

  const stats = useMemo(() => ({
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    activeSubs: users.filter(u => u.subscription_status === 'active' || u.subscription_status === 'trialing').length,
    onboarded: users.filter(u => !!u.onboarded_at).length,
  }), [users])

  const handleSave = async (user: AdminUser, updates: Partial<Pick<AdminUser, 'role' | 'subscription_status' | 'plan'>>) => {
    setSavingId(user.id)
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
    setSavingId(null)
    if (error) {
      setError(`Failed to update ${user.email}: ${error.message}`)
      return
    }
    setEditingId(null)
    await load()
  }

  return (
    <AppLayout>
      <section className="pt-14 md:pt-20 pb-6">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-6">
          <Link to="/dashboard" className="btn-link text-ember-500 text-[14px]">← Back home</Link>
          <div className="eyebrow-hero mt-4">Admin · Users</div>
          <h1 className="h-display text-4xl md:text-5xl mt-2">User management.</h1>
          <p className="mt-3 text-base text-cream-50/75 max-w-[640px] leading-snug tracking-[-0.012em]">
            Everyone with an account. Adjust role, subscription status, and plan inline. Stripe-driven changes will overwrite manual edits when the webhook is live.
          </p>
        </div>
      </section>

      <div className="max-w-[1200px] mx-auto px-5 sm:px-6 pb-14">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-6">
          <StatTile label="Total users" value={stats.total} />
          <StatTile label="Admins" value={stats.admins} tone="#D63923" />
          <StatTile label="Active / trialing" value={stats.activeSubs} tone="#1D7F3F" />
          <StatTile label="Onboarded" value={stats.onboarded} />
        </div>

        {/* Search */}
        <div className="mb-5">
          <input
            type="search"
            placeholder="Search by email, name, role, or status…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="input"
            style={{ maxWidth: 420 }}
          />
        </div>

        {error && (
          <div
            className="rounded-[12px] p-4 mb-4 text-[14px]"
            style={{ color: '#A52917', background: 'rgba(214,57,35,0.06)', border: '1px solid rgba(214,57,35,0.25)' }}
          >
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-[15px] text-cream-50/65">Loading users…</div>
        ) : filtered.length === 0 ? (
          <div className="text-[15px] text-cream-50/70">{query ? 'No matches.' : 'No users yet.'}</div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="w-full text-[14px]">
              <thead>
                <tr className="text-left" style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                  <Th>User</Th>
                  <Th>Role</Th>
                  <Th>Subscription</Th>
                  <Th>Plan</Th>
                  <Th>Joined</Th>
                  <Th>Last seen</Th>
                  <Th className="text-right pr-5">Actions</Th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => {
                  const isEditing = editingId === u.id
                  return (
                    <UserRow
                      key={u.id}
                      user={u}
                      editing={isEditing}
                      saving={savingId === u.id}
                      onEdit={() => setEditingId(u.id)}
                      onCancel={() => setEditingId(null)}
                      onSave={(updates) => handleSave(u, updates)}
                    />
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  )
}

function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={`text-[11px] font-semibold uppercase tracking-[0.06em] text-gold-100 py-3 px-4 ${className}`}>
      {children}
    </th>
  )
}

function StatTile({ label, value, tone }: { label: string; value: number; tone?: string }) {
  return (
    <div className="card" style={{ padding: '1.1rem 1.25rem' }}>
      <div className="text-[12px] text-gold-100 font-medium mb-1">{label}</div>
      <div
        className="font-display text-3xl tracking-[-0.025em] leading-none"
        style={{ fontVariationSettings: '"opsz" 96', color: tone ?? '#1D1D1F' }}
      >
        {value}
      </div>
    </div>
  )
}

function UserRow({
  user, editing, saving, onEdit, onCancel, onSave,
}: {
  user: AdminUser
  editing: boolean
  saving: boolean
  onEdit: () => void
  onCancel: () => void
  onSave: (updates: Partial<Pick<AdminUser, 'role' | 'subscription_status' | 'plan'>>) => void
}) {
  const [role, setRole] = useState<Role>(user.role)
  const [status, setStatus] = useState<SubscriptionStatus>(user.subscription_status)
  const [plan, setPlan] = useState<string>(user.plan ?? '')

  useEffect(() => {
    if (editing) {
      setRole(user.role)
      setStatus(user.subscription_status)
      setPlan(user.plan ?? '')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing])

  const initial = (user.display_name?.[0] ?? user.email[0] ?? '?').toUpperCase()
  const joinedShort = user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'
  const lastSeenShort = user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : '—'
  const tint = STATUS_TINT[user.subscription_status]

  return (
    <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-3">
          <div
            className="h-9 w-9 rounded-full flex items-center justify-center text-[14px] font-semibold flex-shrink-0"
            style={{ background: 'rgba(0,0,0,0.06)', color: '#1D1D1F' }}
          >
            {initial}
          </div>
          <div className="min-w-0">
            <div className="font-medium text-cream-50 truncate">{user.display_name ?? '—'}</div>
            <div className="text-[12px] text-gold-100 truncate">{user.email}</div>
          </div>
        </div>
      </td>
      <td className="px-4">
        {editing ? (
          <select
            value={role}
            onChange={e => setRole(e.target.value as Role)}
            className="input"
            style={{ padding: '0.4rem 0.6rem', fontSize: 14, minHeight: 0 }}
          >
            {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        ) : (
          <span
            className="inline-flex items-center px-2 py-0.5 rounded-full text-[12px] font-medium"
            style={{
              background: user.role === 'admin' ? 'rgba(214,57,35,0.10)' : 'rgba(0,0,0,0.04)',
              color: user.role === 'admin' ? '#D63923' : '#6E6E73',
              border: `1px solid ${user.role === 'admin' ? 'rgba(214,57,35,0.30)' : 'rgba(0,0,0,0.10)'}`,
            }}
          >
            {user.role}
          </span>
        )}
      </td>
      <td className="px-4">
        {editing ? (
          <select
            value={status}
            onChange={e => setStatus(e.target.value as SubscriptionStatus)}
            className="input"
            style={{ padding: '0.4rem 0.6rem', fontSize: 14, minHeight: 0 }}
          >
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        ) : (
          <span
            className="inline-flex items-center px-2 py-0.5 rounded-full text-[12px] font-medium"
            style={{ background: tint.bg, color: tint.fg, border: `1px solid ${tint.border}` }}
          >
            {user.subscription_status}
          </span>
        )}
      </td>
      <td className="px-4 text-[13px] text-cream-50/85">
        {editing ? (
          <input
            type="text"
            value={plan}
            onChange={e => setPlan(e.target.value)}
            placeholder="e.g. pro_monthly"
            className="input"
            style={{ padding: '0.4rem 0.6rem', fontSize: 14, minHeight: 0 }}
          />
        ) : (
          user.plan ?? '—'
        )}
      </td>
      <td className="px-4 text-[13px] text-cream-50/75">{joinedShort}</td>
      <td className="px-4 text-[13px] text-cream-50/75">{lastSeenShort}</td>
      <td className="px-4 pr-5 text-right">
        {editing ? (
          <div className="flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="text-[13px] text-cream-50/70 hover:text-cream-50 px-2 py-1"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onSave({ role, subscription_status: status, plan: plan.trim() || null })}
              disabled={saving}
              className="btn btn-primary"
              style={{ padding: '0.4rem 1rem', fontSize: 13, minHeight: 30 }}
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onEdit}
            className="text-ember-500 text-[14px] hover:underline"
          >
            Edit
          </button>
        )}
      </td>
    </tr>
  )
}
