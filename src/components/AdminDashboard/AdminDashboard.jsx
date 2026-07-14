import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './styles'

const getRegisteredUsers = () => {
  const stored = localStorage.getItem('registeredUsers')
  return stored ? JSON.parse(stored) : []
}

function NavLogo() {
  return (
    <div style={styles.navLogoBox}>
      <svg width="20" height="20" viewBox="0 0 34 34" fill="none">
        <rect x="3"  y="18" width="6" height="13" rx="2" fill="#facc15" />
        <rect x="14" y="10" width="6" height="21" rx="2" fill="#4ade80" />
        <rect x="25" y="5"  width="6" height="26" rx="2" fill="#f87171" />
      </svg>
    </div>
  )
}

function StatusBadge({ estado }) {
  const badgeStyle =
    estado === 'Activo'   ? styles.badgeActivo :
    estado === 'Inactivo' ? styles.badgeInactivo :
                            styles.badgePendiente
  return <span style={badgeStyle}>{estado}</span>
}

function StatCard({ label, value, color }) {
  return (
    <div style={styles.statCard}>
      <p style={styles.statLabel}>{label}</p>
      <p style={{ ...styles.statValue, color }}>{value}</p>
    </div>
  )
}

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [users, setUsers] = useState(getRegisteredUsers())

  useEffect(() => {
    setUsers(getRegisteredUsers())
  }, [])

  const handleViewStudent = (student) => {
    localStorage.setItem('adminPreviewMode', 'true')
    localStorage.setItem('adminPreviewEmail', student.email)
    localStorage.setItem('adminPreviewName', student.nombre)
    navigate('/dashboard')
  }

  const total      = users.length
  const activos    = users.length
  const inactivos  = 0
  const pendientes = 0

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return users
    return users.filter(
      s => s.nombre.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)
    )
  }, [search, users])

  const handleLogout = () => {
    localStorage.removeItem('isAdminAuthenticated')
    navigate('/admin')
  }

  const handleEditStudent = (student) => {
    const savedPhoto = localStorage.getItem(`profilePhoto_${student.email}`)
    localStorage.setItem('isStudentAuthenticated', 'true')
    localStorage.setItem('studentName', student.nombre)
    localStorage.setItem('studentEmail', student.email)
    if (student.photo) {
      localStorage.setItem('studentPhoto', student.photo)
    } else if (savedPhoto) {
      localStorage.setItem('studentPhoto', savedPhoto)
    } else {
      localStorage.removeItem('studentPhoto')
    }
    localStorage.setItem('adminImpersonating', 'true')
    navigate('/dashboard')
  }

  return (
    <div style={styles.page}>

      <nav style={styles.navbar}>
        <div style={styles.navLeft}>
          <NavLogo />
          <span style={styles.navTitle}>Seguimiento de Hábitos - Admin</span>
        </div>
        <div style={styles.navRight}>
          <span style={styles.navUser}>Administrador</span>
          <button
            style={styles.btnLogout}
            onClick={handleLogout}
            onMouseEnter={e => (e.target.style.background = 'rgba(255,255,255,0.25)')}
            onMouseLeave={e => (e.target.style.background = 'rgba(255,255,255,0.15)')}
          >
            Cerrar Sesión
          </button>
        </div>
      </nav>

      <main style={styles.content}>
        <h1 style={styles.pageTitle}>Panel de Control</h1>
        <p style={styles.pageSubtitle}>Gestiona los estudiantes registrados en el sistema</p>

        <div style={styles.statsGrid}>
          <StatCard label="Total Estudiantes" value={total}      color="#0f172a"  />
          <StatCard label="Activos"            value={activos}   color="#16a34a"  />
          <StatCard label="Inactivos"          value={inactivos} color="#c2410c"  />
          <StatCard label="Pendientes"         value={pendientes}color="#1d4ed8"  />
        </div>

        <div style={styles.tableSection}>
          <div style={styles.tableHeaderRow}>
            <span style={styles.tableTitle}>Lista de Estudiantes</span>
            <input
              style={styles.searchInput}
              placeholder="Buscar por nombre o correo..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={e  => (e.target.style.borderColor = '#7c3aed')}
              onBlur={e   => (e.target.style.borderColor = '#e2e8f0')}
            />
          </div>

          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Nombre</th>
                <th style={styles.th}>Correo</th>
                <th style={styles.th}>Estado</th>
                <th style={styles.th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ ...styles.td, textAlign: 'center', color: '#94a3b8', padding: '40px' }}>
                    No se encontraron estudiantes.
                  </td>
                </tr>
              ) : (
                filtered.map((student, index) => (
                  <tr key={student.email || index}>
                    <td style={styles.tdMuted}>{index + 1}</td>
                    <td style={styles.td}>{student.nombre}</td>
                    <td style={styles.tdMuted}>{student.email}</td>
                    <td style={styles.td}><StatusBadge estado="Activo" /></td>
                    <td style={styles.td}>
                      <button
                        style={styles.btnVer}
                        onMouseEnter={e => { e.target.style.borderColor = '#7c3aed'; e.target.style.color = '#7c3aed' }}
                        onMouseLeave={e => { e.target.style.borderColor = '#cbd5e1'; e.target.style.color = '#334155' }}
                        onClick={() => handleViewStudent(student)}
                      >
                        Ver
                      </button>
                      <button
                        style={styles.btnEditar}
                        onMouseEnter={e => { e.target.style.borderColor = '#7c3aed'; e.target.style.color = '#7c3aed' }}
                        onMouseLeave={e => { e.target.style.borderColor = '#cbd5e1'; e.target.style.color = '#334155' }}
                        onClick={() => handleEditStudent(student)}
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}

export default AdminDashboard