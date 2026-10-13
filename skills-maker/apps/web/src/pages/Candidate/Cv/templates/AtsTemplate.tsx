import { contactLine, formatDateRange, type CvRenderData } from './types'

const PURPLE = '#590293'

const H2: React.CSSProperties = {
  margin: '0 0 10px',
  fontSize: 11,
  fontWeight: 700,
  color: PURPLE,
  textTransform: 'uppercase',
  letterSpacing: 2,
}

/** ATS-friendly: single column, black/white, text-first. Maximum robot readability. */
export const AtsTemplate = ({ data }: { data: CvRenderData }) => (
  <div
    style={{
      maxWidth: 820,
      margin: '0 auto',
      padding: '48px 56px',
      background: '#ffffff',
      fontFamily: '"Segoe UI",system-ui,-apple-system,Arial,sans-serif',
      color: '#1e293b',
      fontSize: 13,
      lineHeight: 1.6,
    }}
  >
    <header style={{ borderBottom: `3px solid ${PURPLE}`, paddingBottom: 18, marginBottom: 28 }}>
      <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.5px' }}>
        {data.fullName || 'Prénom Nom'}
      </h1>
      {data.professionalTitle && (
        <p style={{ margin: '6px 0 10px', fontSize: 15, color: PURPLE, fontWeight: 600 }}>{data.professionalTitle}</p>
      )}
      <p style={{ margin: 0, fontSize: 12, color: '#475569' }}>{contactLine(data)}</p>
    </header>

    {data.summary && (
      <section style={{ marginBottom: 28 }}>
        <h2 style={H2}>Profil professionnel</h2>
        <p style={{ margin: 0, color: '#334155' }}>{data.summary}</p>
      </section>
    )}

    {data.experiences.length > 0 && (
      <section style={{ marginBottom: 28 }}>
        <h2 style={{ ...H2, marginBottom: 14 }}>Expérience professionnelle</h2>
        {data.experiences.map((exp, i) => (
          <div key={i} style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 2 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{exp.title}</span>
              <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>
                {formatDateRange(exp.startDate, exp.endDate)}
              </span>
            </div>
            <div style={{ fontSize: 13, color: PURPLE, fontWeight: 600, marginBottom: 8 }}>
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
      <section style={{ marginBottom: 28 }}>
        <h2 style={{ ...H2, marginBottom: 14 }}>Formation</h2>
        {data.education.map((ed, i) => (
          <div key={i} style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{ed.degree}</span>
              <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>
                {formatDateRange(ed.startDate, ed.endDate)}
              </span>
            </div>
            <div style={{ fontSize: 13, color: '#475569', marginTop: 2 }}>{ed.school}</div>
          </div>
        ))}
      </section>
    )}

    {data.skills.length > 0 && (
      <section style={{ marginBottom: 28 }}>
        <h2 style={{ ...H2, marginBottom: 12 }}>Compétences</h2>
        <div>
          {data.skills.map((s, i) => (
            <span
              key={i}
              style={{
                display: 'inline-block',
                background: '#f3e8ff',
                color: PURPLE,
                fontSize: 12,
                fontWeight: 600,
                padding: '5px 12px',
                borderRadius: 999,
                margin: '0 4px 6px 0',
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
        <h2 style={H2}>Langues</h2>
        <p style={{ margin: 0, color: '#334155' }}>
          {data.languages.map((l) => [l.name, l.level].filter(Boolean).join(' — ')).join(' · ')}
        </p>
      </section>
    )}

    {data.interests.length > 0 && (
      <section>
        <h2 style={H2}>Centres d'intérêt</h2>
        <p style={{ margin: 0, color: '#334155' }}>{data.interests.join(' · ')}</p>
      </section>
    )}
  </div>
)
