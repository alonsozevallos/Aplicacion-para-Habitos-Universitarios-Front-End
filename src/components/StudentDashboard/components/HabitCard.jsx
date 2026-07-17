import styles from '../styles'

const HabitCard = ({
  habit,
  isReadOnly,
  openHabitMenu,
  toggleHabitMenu,
  handleStartEditHabit,
  handleResetHabitProgress,
  handleRemoveHabit,
  formatDias,
  editingHabitId,
  editingHabitValues,
  setEditingHabitValues,
  daysOfWeek,
  toggleDay,
  handleCancelEditHabit,
  handleSaveHabitEdit,
  computeProgress,
  editingActivity,
  setEditingActivity,
  toggleActivityCompletion,
  openActivityMenu,
  toggleActivityMenu,
  handleStartEditActivity,
  handleRemoveActivity,
  handleCancelEditActivity,
  handleSaveActivityEdit,
  activityText,
  handleActivityChange,
  activityDueDate,
  setActivityDueDate,
  handleAddActivity,
  formatDueDate,
}) => {
  const isEditingHabit = editingHabitId === habit.id
  const progress = computeProgress(habit)
  const diasLabel = formatDias(habit.dias)

  return (
    <div style={styles.habitCard}>
      <div style={styles.habitCardHeader}>
        <div style={styles.habitCardHeaderLeft}>
          <span style={styles.habitIcon}>{habit.icon}</span>
          <div>
            <p style={styles.habitName}>{habit.nombre}</p>
            <p style={styles.habitMeta}>{habit.meta}</p>
          </div>
        </div>

        {!isReadOnly && (
          <div style={styles.habitMenu}>
            <button style={styles.habitMenuButton} onClick={() => toggleHabitMenu(habit.id)}>⋮</button>
            {openHabitMenu === habit.id && (
              <div style={styles.habitMenuDropdown}>
                <button style={styles.habitMenuItem} onClick={() => handleStartEditHabit(habit)}>
                  Editar hábito
                </button>
                <button style={styles.habitMenuItem} onClick={() => handleResetHabitProgress(habit.id)}>
                  Reiniciar progreso
                </button>
                <button style={styles.habitMenuItemDanger} onClick={() => handleRemoveHabit(habit.id)}>
                  Eliminar
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {isEditingHabit ? (
        <div style={styles.editHabitPanel}>
          <div style={styles.editHabitRow}>
            <input
              style={styles.formInput}
              value={editingHabitValues.nombre}
              placeholder="Nombre"
              onChange={e => setEditingHabitValues(prev => ({ ...prev, nombre: e.target.value }))}
            />
            <input
              style={styles.formInput}
              value={editingHabitValues.meta}
              placeholder="Meta"
              onChange={e => setEditingHabitValues(prev => ({ ...prev, meta: e.target.value }))}
            />
          </div>
          <div style={styles.editHabitRow}>
            <input
              style={styles.formInput}
              value={editingHabitValues.icon}
              placeholder="Ícono"
              maxLength={2}
              onChange={e => setEditingHabitValues(prev => ({ ...prev, icon: e.target.value }))}
            />
            <input
              style={styles.formInput}
              value={editingHabitValues.motivo}
              placeholder="Motivo"
              onChange={e => setEditingHabitValues(prev => ({ ...prev, motivo: e.target.value }))}
            />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <div style={styles.daysSelector}>
              {daysOfWeek.map(day => (
                <span
                  key={day.key}
                  style={{
                    ...styles.dayChip,
                    ...(editingHabitValues.dias.includes(day.key) ? styles.dayChipActive : {}),
                  }}
                  onClick={() => toggleDay(day.key, true)}
                >
                  {day.label}
                </span>
              ))}
            </div>
          </div>
          <div style={styles.editHabitActions}>
            <button style={styles.btnSecondary} onClick={handleCancelEditHabit}>Cancelar</button>
            <button style={styles.btnPrimary} onClick={() => handleSaveHabitEdit(habit.id)}>Guardar</button>
          </div>
        </div>
      ) : (
        <>
          {(diasLabel || habit.motivo) && (
            <div style={styles.habitMetaExtra}>
              {diasLabel && <span style={styles.habitDiasTag}>📅 {diasLabel}</span>}
              {habit.motivo && <span style={styles.habitMotivoTag}>💡 {habit.motivo}</span>}
            </div>
          )}
          <div style={styles.progressBar}>
            <div style={{ ...styles.progressFill, width: `${progress}%`, background: '#2563eb' }} />
          </div>
          <p style={styles.progressText}>{progress}% completado</p>
        </>
      )}

      <div style={styles.activitySection}>
        <p style={styles.activityTitle}>Actividades</p>

        {habit.actividades.length === 0 ? (
          <p style={styles.emptyText}>Aún no hay actividades para este hábito.</p>
        ) : (
          <ul style={styles.activityList}>
            {habit.actividades.map(activity => {
              const isEditingActivity =
                editingActivity.habitId === habit.id && editingActivity.activityId === activity.id

              return (
                <li key={activity.id} style={styles.activityItem}>
                  {isEditingActivity ? (
                    <div style={styles.activityFormExtended}>
                      <input
                        style={styles.activityEditInput}
                        value={editingActivity.texto}
                        onChange={e => setEditingActivity(prev => ({ ...prev, texto: e.target.value }))}
                      />
                      <input
                        style={styles.activityEditInput}
                        type="date"
                        value={editingActivity.fechaVence}
                        onChange={e => setEditingActivity(prev => ({ ...prev, fechaVence: e.target.value }))}
                      />
                      <div style={styles.activityEditActions}>
                        <button style={styles.btnSecondary} onClick={handleCancelEditActivity}>Cancelar</button>
                        <button style={styles.btnPrimary} onClick={handleSaveActivityEdit}>Guardar</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={styles.activityItemLeft}>
                        <button
                          style={styles.activityButton}
                          onClick={() => toggleActivityCompletion(habit.id, activity.id)}
                          disabled={isReadOnly}
                        >
                          {activity.completada ? '✓' : ''}
                        </button>
                        <div>
                          <span style={activity.completada ? styles.activityDone : styles.activityText}>
                            {activity.texto}
                          </span>
                          <div style={styles.activityMeta}>
                            <span style={styles.activityDateTag}>🕒 {activity.fecha}</span>
                            {activity.fechaVence && (
                              <span style={styles.activityDaysTag}>⏰ {formatDueDate(activity.fechaVence)}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {!isReadOnly && (
                        <div style={styles.activityItemRight}>
                          <div style={styles.activityMenu}>
                            <button
                              style={styles.activityMenuButton}
                              onClick={() => toggleActivityMenu(habit.id, activity.id)}
                            >
                              ⋮
                            </button>
                            {openActivityMenu === `${habit.id}_${activity.id}` && (
                              <div style={styles.activityMenuDropdown}>
                                <button
                                  style={styles.activityMenuItem}
                                  onClick={() => handleStartEditActivity(habit.id, activity)}
                                >
                                  Editar
                                </button>
                                <button
                                  style={styles.activityMenuItemDanger}
                                  onClick={() => handleRemoveActivity(habit.id, activity.id)}
                                >
                                  Eliminar
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </li>
              )
            })}
          </ul>
        )}

        {!isReadOnly && (
          <div style={styles.activityFormExtended}>
            <input
              style={{ ...styles.formInput, flex: '1 1 160px', width: 'auto' }}
              placeholder="Nueva actividad..."
              value={activityText[habit.id] || ''}
              onChange={e => handleActivityChange(habit.id, e.target.value)}
            />
            <input
              style={{ ...styles.formInput, flex: '0 1 150px', width: 'auto' }}
              type="date"
              value={activityDueDate[habit.id] || ''}
              onChange={e => setActivityDueDate(prev => ({ ...prev, [habit.id]: e.target.value }))}
            />
            <button style={styles.btnPrimary} onClick={() => handleAddActivity(habit.id)}>
              Agregar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default HabitCard
