import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './styles'

const ADMIN_EMAIL    = 'admin@habitos.edu'
const ADMIN_PASSWORD = 'admin123'

const AdminLogin = () => {
  const navigate = useNavigate()
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdminAuthenticated')
    if (isAdmin === 'true') navigate('/admin/dashboard')
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    const email    = e.target.email.value.trim()
    const password = e.target.password.value

    if (!email || !password) {
      setError('Completa todos los campos.')
      return
    }

    setLoading(true)
    setError('')

    setTimeout(() => {
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        localStorage.setItem('isAdminAuthenticated', 'true')
        navigate('/admin/dashboard')
      } else {
        setError(`Credenciales incorrectas. Usa ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`)
        setLoading(false)
      }
    }, 700)
  }

  const focusStyle = (e) => {
    e.target.style.borderColor = '#7c3aed'
    e.target.style.boxShadow   = '0 0 0 3px rgba(124,58,237,0.15)'
  }
  const blurStyle = (e) => {
    e.target.style.borderColor = '#e2e8f0'
    e.target.style.boxShadow   = 'none'
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        {/* Logo */}
        <div style={styles.logoWrap}>
          <div style={styles.logo}>🔐</div>
        </div>

        <h1 style={styles.heading}>Panel de Administrador</h1>
        <p style={styles.subheading}>Acceso exclusivo para administradores del sistema</p>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.fieldGroup}>
            <label htmlFor="email" style={styles.label}>Correo de Administrador</label>
            <input
              style={styles.input}
              type="email"
              id="email"
              name="email"
              placeholder="admin@habitos.edu"
              onFocus={focusStyle}
              onBlur={blurStyle}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label htmlFor="password" style={styles.label}>Contraseña</label>
            <input
              style={styles.input}
              type="password"
              id="password"
              name="password"
              placeholder="••••••••"
              onFocus={focusStyle}
              onBlur={blurStyle}
            />
          </div>

          <button
            type="submit"
            style={{ ...styles.btnPrimary, opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
            disabled={loading}
            onMouseEnter={e => { if (!loading) e.target.style.background = '#6d28d9' }}
            onMouseLeave={e => { if (!loading) e.target.style.background = '#7c3aed' }}
          >
            {loading ? 'Verificando...' : 'Acceder como Admin'}
          </button>
        </form>

        <div style={styles.divider} />
        <p style={styles.footer}>
          ¿Eres estudiante?{' '}
          <span style={styles.link} onClick={() => navigate('/login')}>
            Ir al login de estudiantes
          </span>
        </p>

      </div>
    </div>
  )
}

export default AdminLogin