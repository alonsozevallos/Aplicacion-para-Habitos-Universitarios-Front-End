import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import calStyles from './styles'
import { deleteStudentNote, getHabits, getStudentNotes, upsertStudentNote } from '../../api/client'

const DAY_KEY_TO_JS = { D: 0, L: 1, M: 2, X: 3, J: 4, V: 5, S: 6 }

const MONTH_NAMES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
]
const DAY_NAMES = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']

function NavLogo() {
  return (
    <div style={calStyles.navLogoBox}>
      <svg width="20" height="20" viewBox="0 0 34 34" fill="none">
        <rect x="3"  y="18" width="6" height="13" rx="2" fill="#facc15" />
        <rect x="14" y="10" width="6" height="21" rx="2" fill="#4ade80" />
        <rect x="25" y="5"  width="6" height="26" rx="2" fill="#f87171" />
      </svg>
    </div>
  )
}

const toISO = (date) => date.toISOString().split('T')[0]

const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate()
const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay()

const habitMatchesDate = (habit, isoDate) => {
  if (!habit.dias || habit.dias.length === 0) return false
  const jsDay = new Date(isoDate + 'T00:00:00').getDay()
  return habit.dias.some(key => DAY_KEY_TO_JS[key] === jsDay)
}

const formatDateFull = (iso) => {
  if (!iso) return ''
  const d = new Date(iso + 'T00:00:00')
  return `${d.getDate()} de ${MONTH_NAMES[d.getMonth()]} de ${d.getFullYear()}`
}

const Calendar = () => {
  const navigate = useNavigate()

  const adminPreviewMode = localStorage.getItem('adminPreviewMode') === 'true'
  const studentEmail = adminPreviewMode
    ? (localStorage.getItem('adminPreviewEmail') || '')
    : (localStorage.getItem('studentEmail') || '')
  const studentName  = adminPreviewMode
    ? (localStorage.getItem('adminPreviewName') || 'Estudiante')
    : (localStorage.getItem('studentName')  || 'Estudiante')

  useEffect(() => {
    const auth = localStorage.getItem('isStudentAuthenticated')
    if (auth !== 'true' && !adminPreviewMode) {
      navigate('/login')
    }
  }, [navigate, adminPreviewMode])

  const today = new Date()
  const [viewYear,  setViewYear]  = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState(toISO(today))

  const [habits, setHabits] = useState([])
  const [notes, setNotes] = useState({})
  const [noteInput, setNoteInput] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!studentEmail) return
    let ignore = false

    getHabits(studentEmail)
      .then(({ data }) => { if (!ignore) setHabits(data || []) })
      .catch((err) => { if (!ignore) setError(err.message || 'No se pudieron cargar los hábitos.') })

    getStudentNotes(studentEmail)
      .then(({ data }) => { if (!ignore) setNotes(data || {}) })
      .catch((err) => { if (!ignore) setError(err.message || 'No se pudieron cargar las notas.') })

    return () => { ignore = true }
  }, [studentEmail])

  useEffect(() => {
    setNoteInput(notes[selectedDate] || '')
  }, [selectedDate, notes])

  const saveNote = async () => {
    const trimmed = noteInput.trim()
    try {
      if (!trimmed) {
        if (notes[selectedDate] !== undefined) {
          await deleteStudentNote(studentEmail, selectedDate)
        }
        setNotes(prev => {
          const next = { ...prev }
          delete next[selectedDate]
          return next
        })
      } else {
        await upsertStudentNote(studentEmail, selectedDate, trimmed)
        setNotes(prev => ({ ...prev, [selectedDate]: trimmed }))
      }
      setError('')
    } catch (err) {
      setError(err.message || 'No se pudo guardar la nota.')
    }
  }

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }
  const goToday = () => {
    setViewYear(today.getFullYear())
    setViewMonth(today.getMonth())
    setSelectedDate(toISO(today))
  }

  const daysInMonth   = getDaysInMonth(viewYear, viewMonth)
  const firstWeekDay  = getFirstDayOfMonth(viewYear, viewMonth)
  const cells = []
  for (let i = 0; i < firstWeekDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const activitiesForDay = []
  habits.forEach(habit => {
    habit.actividades?.forEach(act => {
      if (act.fechaVence === selectedDate) {
        activitiesForDay.push({
          type: 'vence',
          habitIcon: habit.icon,
          habitNombre: habit.nombre,
          texto: act.texto,
          completada: act.completada,
          actId: act.id,
          habitId: habit.id,
        })
      }
    })
    if (habitMatchesDate(habit, selectedDate)) {
      activitiesForDay.push({
        type: 'recurrente',
        habitIcon: habit.icon,
        habitNombre: habit.nombre,
        motivo: habit.motivo,
        dias: habit.dias,
        habitId: habit.id,
      })
    }
  })

  const hasActivities = (dayNum) => {
    if (!dayNum) return false
    const iso = `${viewYear}-${String(viewMonth + 1).padStart(2,'0')}-${String(dayNum).padStart(2,'0')}`
    return habits.some(habit =>
      habit.actividades?.some(act => act.fechaVence === iso) ||
      habitMatchesDate(habit, iso)
    )
  }

  const hasNote = (dayNum) => {
    if (!dayNum) return false
    const iso = `${viewYear}-${String(viewMonth + 1).padStart(2,'0')}-${String(dayNum).padStart(2,'0')}`
    return !!notes[iso]
  }

  const handleDayClick = (dayNum) => {
    if (!dayNum) return
    const iso = `${viewYear}-${String(viewMonth + 1).padStart(2,'0')}-${String(dayNum).padStart(2,'0')}`
    setSelectedDate(iso)
  }

  const isToday = (dayNum) => {
    if (!dayNum) return false
    return (
      dayNum === today.getDate() &&
      viewMonth === today.getMonth() &&
      viewYear === today.getFullYear()
    )
  }

  const isSelected = (dayNum) => {
    if (!dayNum) return false
    const iso = `${viewYear}-${String(viewMonth + 1).padStart(2,'0')}-${String(dayNum).padStart(2,'0')}`
    return iso === selectedDate
  }

  return (
    <div style={calStyles.page}>
      <nav style={calStyles.navbar}>
        <div style={calStyles.navLeft}>
          <NavLogo />
          <span style={calStyles.navTitle}>Calendario</span>
        </div>
        <div style={calStyles.navRight}>
          <span style={calStyles.navUser}>{studentName}</span>
          <button
            style={calStyles.btnBack}
            onClick={() => navigate('/dashboard')}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
          >
            ← Mis Hábitos
          </button>
        </div>
      </nav>

      <main style={calStyles.content}>
        {error && <div style={calStyles.emptyText}>{error}</div>}
        <div style={calStyles.layout}>

          <div style={calStyles.calPanel}>
            <div style={calStyles.calHeader}>
              <button style={calStyles.navArrow} onClick={prevMonth}>‹</button>
              <div style={calStyles.calMonthLabel}>
                <span style={calStyles.calMonthName}>{MONTH_NAMES[viewMonth]}</span>
                <span style={calStyles.calYear}>{viewYear}</span>
              </div>
              <button style={calStyles.navArrow} onClick={nextMonth}>›</button>
            </div>

            <button style={calStyles.todayBtn} onClick={goToday}>Hoy</button>

            <div style={calStyles.weekRow}>
              {DAY_NAMES.map(d => (
                <div key={d} style={calStyles.weekLabel}>{d}</div>
              ))}
            </div>

            <div style={calStyles.daysGrid}>
              {cells.map((day, idx) => (
                <div
                  key={idx}
                  style={{
                    ...calStyles.dayCell,
                    ...(day ? calStyles.dayCellActive : {}),
                    ...(isToday(day) ? calStyles.dayCellToday : {}),
                    ...(isSelected(day) ? calStyles.dayCellSelected : {}),
                  }}
                  onClick={() => handleDayClick(day)}
                >
                  {day && (
                    <>
                      <span style={calStyles.dayNum}>{day}</span>
                      <div style={calStyles.dotRow}>
                        {hasActivities(day) && <span style={calStyles.dotBlue} />}
                        {hasNote(day) && <span style={calStyles.dotGreen} />}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            <div style={calStyles.legend}>
              <span style={calStyles.legendItem}><span style={calStyles.dotBlue} /> Actividad</span>
              <span style={calStyles.legendItem}><span style={calStyles.dotGreen} /> Nota</span>
            </div>
          </div>

          <div style={calStyles.detailPanel}>
            <div style={calStyles.detailHeader}>
              <p style={calStyles.detailDateLabel}>📅 {formatDateFull(selectedDate)}</p>
            </div>

            <div style={calStyles.detailSection}>
              <p style={calStyles.detailSectionTitle}>Actividades del día</p>

              {activitiesForDay.length === 0 ? (
                <p style={calStyles.emptyText}>No hay actividades para este día.</p>
              ) : (
                <div style={calStyles.activityList}>
                  {activitiesForDay.map((item, i) => (
                    <div key={i} style={calStyles.activityCard}>
                      <div style={calStyles.activityCardLeft}>
                        <span style={calStyles.activityCardIcon}>{item.habitIcon}</span>
                        <div>
                          <p style={calStyles.activityCardHabit}>{item.habitNombre}</p>
                          {item.type === 'vence' && (
                            <>
                              <p style={{
                                ...calStyles.activityCardText,
                                textDecoration: item.completada ? 'line-through' : 'none',
                                color: item.completada ? '#94a3b8' : '#0f172a',
                              }}>
                                {item.texto}
                              </p>
                              <span style={calStyles.tagVence}>
                                ⏰ {selectedDate === toISO(today) ? 'Vence hoy' : 'Vence este día'}
                              </span>
                            </>
                          )}
                          {item.type === 'recurrente' && (
                            <>
                              {item.motivo && (
                                <p style={calStyles.activityCardMotivo}>🎯 {item.motivo}</p>
                              )}
                              <span style={calStyles.tagRecurrente}>🔁 Hábito recurrente</span>
                            </>
                          )}
                        </div>
                      </div>
                      {item.type === 'vence' && (
                        <span style={item.completada ? calStyles.statusDone : calStyles.statusPending}>
                          {item.completada ? '✓ Listo' : '● Pendiente'}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={calStyles.detailSection}>
              <p style={calStyles.detailSectionTitle}>Nota del día</p>
              <textarea
                style={calStyles.noteArea}
                placeholder="Escribe una nota para este día..."
                value={noteInput}
                onChange={e => setNoteInput(e.target.value)}
                rows={4}
              />
              <button style={calStyles.btnSaveNote} onClick={saveNote}>
                Guardar nota
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}

export default Calendar
