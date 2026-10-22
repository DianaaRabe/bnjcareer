import { formatDateRange, initialsOf, type CvRenderData } from './types'

const DARK = '#111827'
const ORANGE = '#f97316'

const sidebarH: React.CSSProperties = {
  margin: '0 0 12px',
  fontSize: 11,
  fontWeight: 800,
  color: ORANGE,
  textTransform: 'uppercase',
  letterSpacing: 2,
}

const mainH: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  margin: '0 0 16px',
  fontSize: 15,
  fontWeight: 800,
  color: DARK,
  textTransform: 'uppercase',
  letterSpacing: 1,
}

const dot: React.CSSProperties = {
  width: 10,
  height: 10,
  borderRadius: '50%',
  background: ORANGE,
  flexShrink: 0,
}

/** Bold creative layout: dark sidebar with gradient avatar + skill bars, timeline-style experience. */
export const CreativeTemplate = ({ data }: { data: CvRenderData }) => (
  <div
    style={{
      maxWidth: 820,
      margin: '0 auto',
      background: '#ffffff',
      fontFamily: '"Segoe UI",system-ui,-apple-system,Arial,sans-serif',
      color: '#1f2937',
      fontSize: 13,
      lineHeight: 1.55,
      display: 'grid',
      gridTemplateColumns: '280px 1fr',
      minHeight: 1000,
    }}
  >
    {/* Sidebar */}
    <aside style={{ background: DARK, color: '#e5e7eb', padding: '40px 28px' }}>
      <div
        style={{
          width: 96,
          height: 96,
          borderRadius: 20,
          background: `linear-gradient(135deg, ${ORANGE}, #fb923c)`,
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 32,
          fontWeight: 800,
          margin: '0 auto 20px',
        }}
      >
        {initialsOf(data.fullName)}
      </div>
      <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800, color: '#fff', textAlign: 'center' }}>
        {data.fullName || 'Prénom Nom'}
      </h1>
      {data.professionalTitle && (
        <p style={{ margin: '0 0 28px', fontSize: 13, color: ORANGE, fontWeight: 600, textAlign: 'center' }}>
          {data.professionalTitle}
        </p>
      )}

      <section style={{ marginBottom: 28 }}>
        <h2 style={sidebarH}>Contact</h2>
        <div style={{ fontSize: 12, color: '#d1d5db', lineHeight: 1.9, wordBreak: 'break-word' }}>
          {data.email && <div>{data.email}</div>}
          {data.phone && <div>{data.phone}</div>}
          {data.location && <div>{data.location}</div>}
          {data.linkedin && <div>{data.linkedin}</div>}
        </div>
      </section>

      {data.skills.length > 0 && (
        <section style={{ marginBottom: 28 }}>
          <h2 style={sidebarH}>Compétences</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {data.skills.map((s, i) => (
              <div key={i}>
                <div style={{ fontSize: 12, color: '#e5e7eb', marginBottom: 4 }}>{s}</div>
                <div style={{ height: 5, borderRadius: 999, background: 'rgba(255,255,255,0.12)' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${70 + ((i * 7) % 30)}%`,
                      borderRadius: 999,
                      background: ORANGE,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {data.languages.length > 0 && (
        <section style={{ marginBottom: 28 }}>
          <h2 style={sidebarH}>Langues</h2>
          <div style={{ fontSize: 12, color: '#d1d5db', lineHeight: 1.9 }}>
            {data.languages.map((l, i) => (
              <div key={i}>{[l.name, l.level].filter(Boolean).join(' — ')}</div>
            ))}
          </div>
        </section>
      )}

      {data.interests.length > 0 && (
        <section>
          <h2 style={sidebarH}>Centres d'intérêt</h2>
          <div style={{ fontSize: 12, color: '#d1d5db', lineHeight: 1.9 }}>{data.interests.join(', ')}</div>
        </section>
      )}
    </aside>

    {/* Main */}
    <main style={{ padding: '44px 36px' }}>
      {data.summary && (
        <section style={{ marginBottom: 30 }}>
          <h2 style={mainH}>
            <span style={dot} /> Profil
          </h2>
          <p style={{ margin: 0, color: '#374151' }}>{data.summary}</p>
        </section>
      )}

      {data.experiences.length > 0 && (
        <section style={{ marginBottom: 30 }}>
          <h2 style={mainH}>
            <span style={dot} /> Expérience
          </h2>
          <div style={{ borderLeft: `2px solid #e5e7eb`, paddingLeft: 20, marginLeft: 4 }}>
            {data.experiences.map((exp, i) => (
              <div key={i} style={{ position: 'relative', marginBottom: 20 }}>
                <span
                  style={{
                    position: 'absolute',
                    left: -27,
                    top: 4,
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: ORANGE,
                    border: '2px solid #fff',
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: DARK }}>{exp.title}</span>
                  <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>
                    {formatDateRange(exp.startDate, exp.endDate)}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: ORANGE, fontWeight: 600, marginBottom: 6 }}>
                  {[exp.company, exp.location].filter(Boolean).join(' · ')}
                </div>
                {exp.bullets.length > 0 && (
                  <ul style={{ margin: 0, paddingLeft: 18, color: '#374151' }}>
                    {exp.bullets.map((b, j) => (
                      <li key={j} style={{ marginBottom: 4 }}>
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {data.education.length > 0 && (
        <section>
          <h2 style={mainH}>
            <span style={dot} /> Formation
          </h2>
          {data.education.map((ed, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: DARK }}>{ed.degree}</span>
                <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>
                  {formatDateRange(ed.startDate, ed.endDate)}
                </span>
              </div>
              <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{ed.school}</div>
            </div>
          ))}
        </section>
      )}
    </main>
  </div>
)
