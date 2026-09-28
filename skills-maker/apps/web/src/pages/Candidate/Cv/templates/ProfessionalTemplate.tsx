import { contactLine, formatDateRange, initialsOf, type CvRenderData } from './types'

const INK = '#1e1b4b'
const ACCENT = '#a78bfa'

const sidebarH: React.CSSProperties = {
  margin: '0 0 10px',
  fontSize: 11,
  fontWeight: 700,
  color: ACCENT,
  textTransform: 'uppercase',
  letterSpacing: 1.5,
}

const mainH: React.CSSProperties = {
  margin: '0 0 12px',
  fontSize: 13,
  fontWeight: 700,
  color: INK,
  textTransform: 'uppercase',
  letterSpacing: 1.5,
  borderBottom: `2px solid ${INK}`,
  paddingBottom: 6,
}

/** Two-column professional layout: dark indigo sidebar (contact/skills/langs), white main (profile/xp/edu). */
export const ProfessionalTemplate = ({ data }: { data: CvRenderData }) => (
  <div
    style={{
      maxWidth: 820,
      margin: '0 auto',
      background: '#ffffff',
      fontFamily: '"Segoe UI",system-ui,-apple-system,Arial,sans-serif',
      color: '#1e293b',
      fontSize: 13,
      lineHeight: 1.55,
      display: 'grid',
      gridTemplateColumns: '270px 1fr',
      minHeight: 1000,
    }}
  >
    {/* Sidebar */}
    <aside style={{ background: INK, color: '#e0e7ff', padding: '40px 28px' }}>
      <div
        style={{
          width: 88,
          height: 88,
          borderRadius: '50%',
          background: ACCENT,
          color: INK,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 30,
          fontWeight: 700,
          margin: '0 auto 24px',
        }}
      >
        {initialsOf(data.fullName)}
      </div>

      <section style={{ marginBottom: 28 }}>
        <h2 style={sidebarH}>Contact</h2>
        <div style={{ fontSize: 12, color: '#c7d2fe', lineHeight: 1.9, wordBreak: 'break-word' }}>
          {data.email && <div>{data.email}</div>}
          {data.phone && <div>{data.phone}</div>}
          {data.location && <div>{data.location}</div>}
          {data.linkedin && <div>{data.linkedin}</div>}
        </div>
      </section>

      {data.skills.length > 0 && (
        <section style={{ marginBottom: 28 }}>
          <h2 style={sidebarH}>Compétences</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {data.skills.map((s, i) => (
              <span
                key={i}
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '4px 10px',
                  borderRadius: 6,
                  background: 'rgba(167,139,250,0.18)',
                  color: '#ddd6fe',
                }}
              >
                {s}
              </span>
            ))}
          </div>
        </section>
      )}

      {data.languages.length > 0 && (
        <section style={{ marginBottom: 28 }}>
          <h2 style={sidebarH}>Langues</h2>
          <div style={{ fontSize: 12, color: '#c7d2fe', lineHeight: 1.9 }}>
            {data.languages.map((l, i) => (
              <div key={i}>{[l.name, l.level].filter(Boolean).join(' — ')}</div>
            ))}
          </div>
        </section>
      )}

      {data.interests.length > 0 && (
        <section>
          <h2 style={sidebarH}>Centres d'intérêt</h2>
          <div style={{ fontSize: 12, color: '#c7d2fe', lineHeight: 1.9 }}>{data.interests.join(', ')}</div>
        </section>
      )}
    </aside>

    {/* Main */}
    <main style={{ padding: '40px 36px' }}>
      <header style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 30, fontWeight: 700, color: INK, letterSpacing: '-0.5px' }}>
          {data.fullName || 'Prénom Nom'}
        </h1>
        {data.professionalTitle && (
          <p style={{ margin: '6px 0 0', fontSize: 15, color: ACCENT, fontWeight: 600 }}>{data.professionalTitle}</p>
        )}
      </header>

      {data.summary && (
        <section style={{ marginBottom: 26 }}>
          <h2 style={mainH}>Profil</h2>
          <p style={{ margin: 0, color: '#334155' }}>{data.summary}</p>
        </section>
      )}

      {data.experiences.length > 0 && (
        <section style={{ marginBottom: 26 }}>
          <h2 style={mainH}>Expérience professionnelle</h2>
          {data.experiences.map((exp, i) => (
            <div key={i} style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: INK }}>{exp.title}</span>
                <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>
                  {formatDateRange(exp.startDate, exp.endDate)}
                </span>
              </div>
              <div style={{ fontSize: 13, color: ACCENT, fontWeight: 600, marginBottom: 6 }}>
                {[exp.company, exp.location].filter(Boolean).join(' · ')}
              </div>
              {exp.bullets.length > 0 && (
                <ul style={{ margin: 0, paddingLeft: 18, color: '#334155' }}>
                  {exp.bullets.map((b, j) => (
                    <li key={j} style={{ marginBottom: 4 }}>
                      {b}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      {data.education.length > 0 && (
        <section>
          <h2 style={mainH}>Formation</h2>
          {data.education.map((ed, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: INK }}>{ed.degree}</span>
                <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>
                  {formatDateRange(ed.startDate, ed.endDate)}
                </span>
              </div>
              <div style={{ fontSize: 13, color: '#475569', marginTop: 2 }}>{ed.school}</div>
            </div>
          ))}
        </section>
      )}
    </main>
  </div>
)
