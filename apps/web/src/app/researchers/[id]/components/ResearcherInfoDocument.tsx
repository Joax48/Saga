import {
  Document,
  Page,
  View,
  Text,
  Image,
  Link,
  StyleSheet,
} from '@react-pdf/renderer';
import type { ResearcherProfile } from '@/types/researcher-detail';

const BRAND = '#0D8ABC';
const DARK = '#1f2937';
const MUTED = '#6b7280';
const BORDER = '#e5e7eb';
const TAG_BG = '#f0f9ff';

const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: DARK,
    paddingTop: 28,
    paddingBottom: 36,
    paddingHorizontal: 48,
  },
  // ── Header ───────────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: BRAND,
    borderBottomStyle: 'solid',
  },
  photo: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginRight: 16,
    objectFit: 'cover',
  },
  headerContent: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: DARK,
    marginBottom: 2,
  },
  category: {
    fontSize: 10,
    color: MUTED,
    marginBottom: 4,
  },
  badge: {
    backgroundColor: BRAND,
    color: '#fff',
    fontSize: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginBottom: 5,
  },
  linksRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  linkItem: {
    fontSize: 9,
    color: BRAND,
    marginRight: 12,
  },
  // ── Sections ─────────────────────────────────────────────────────────────────
  section: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: BRAND,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 4,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    borderBottomStyle: 'solid',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  rowGap: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  bullet: {
    width: 12,
    color: MUTED,
  },
  itemMain: {
    flex: 1,
    lineHeight: 1.4,
  },
  bold: {
    fontFamily: 'Helvetica-Bold',
  },
  muted: {
    color: MUTED,
    fontSize: 9,
  },
  // ── Keywords ─────────────────────────────────────────────────────────────────
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: TAG_BG,
    borderWidth: 1,
    borderColor: BRAND,
    borderStyle: 'solid',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 2,
    fontSize: 9,
    color: BRAND,
    marginRight: 4,
    marginBottom: 4,
  },
  // ── Footer ───────────────────────────────────────────────────────────────────
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 48,
    right: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: MUTED,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    borderTopStyle: 'solid',
    paddingTop: 4,
  },
});

function formatDate(value: string | null): string {
  if (!value) return '';
  // Strip time portion — Oracle returns full ISO timestamps
  return value.slice(0, 10);
}

function buildOrcidHref(orcidId: string): string {
  return orcidId.startsWith('http') ? orcidId : `https://orcid.org/${orcidId}`;
}

interface Props {
  profile: ResearcherProfile;
  // Pre-fetched base64 data URL for the profile photo. Passed in from the
  // parent component to avoid CORS issues inside the PDF renderer's Web Worker.
  photoSrc: string;
}

export function ResearcherInfoDocument({ profile, photoSrc }: Props) {
  const fullName = [profile.name, profile.firstSurname, profile.secondSurname]
    .filter(Boolean)
    .join(' ');

  const generatedDate = new Date().toLocaleDateString('es-CR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <Document title={`Researcher Info - ${fullName}`} author="Explorador de Producción Científica, UCR">
      <Page size="A4" style={s.page}>
        {/* ── Header ── */}
        <View style={s.header}>
          <Image style={s.photo} src={photoSrc} />
          <View style={s.headerContent}>
            <Text style={s.name}>{fullName}</Text>
            {profile.ceaCategory && <Text style={s.category}>{profile.ceaCategory}</Text>}
            <Text style={s.badge}>
              {profile.profileType === 'UCR' ? 'Investigador/a UCR' : 'Investigador/a Externo/a'}
            </Text>
            <View style={s.linksRow}>
              {profile.orcidId && (
                <Link src={buildOrcidHref(profile.orcidId)} style={s.linkItem}>
                  ORCID: {profile.orcidId}
                </Link>
              )}
              {profile.linkedin && (
                <Link src={profile.linkedin} style={s.linkItem}>
                  LinkedIn
                </Link>
              )}
              {profile.researchGate && (
                <Link src={profile.researchGate} style={s.linkItem}>
                  ResearchGate
                </Link>
              )}
              {profile.scopus && (
                <Link src={profile.scopus} style={s.linkItem}>
                  Scopus
                </Link>
              )}
            </View>
          </View>
        </View>

        {/* ── Payment units ── */}
        {profile.workUnits.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Unidades de Trabajo</Text>
            {profile.workUnits.map((unit) => (
              <View key={unit.id} style={s.row}>
                <Text style={s.bullet}>• </Text>
                <Text style={s.itemMain}>{unit.name}</Text>
              </View>
            ))}
          </View>
        )}

        {/* ── Collaboration units ── */}
        {profile.linkedUnits.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Unidades de Colaboración</Text>
            {profile.linkedUnits.map((unit) => (
              <View key={unit.id} style={s.row}>
                <Text style={s.bullet}>• </Text>
                <Text style={s.itemMain}>{unit.name}</Text>
              </View>
            ))}
          </View>
        )}

        {/* ── Academic background ── */}
        {profile.education.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Formación Académica</Text>
            {profile.education.map((edu, idx) => (
              <View key={idx} style={s.row}>
                <Text style={s.bullet}>• </Text>
                <View style={s.itemMain}>
                  <Text>
                    <Text style={s.bold}>{edu.degree}</Text>
                    {edu.fieldOfStudy ? <Text> en {edu.fieldOfStudy}</Text> : null}
                    {edu.institution ? <Text> — {edu.institution}</Text> : null}
                    {edu.country ? <Text>, {edu.country}</Text> : null}
                    {edu.graduationYear ? <Text> ({edu.graduationYear})</Text> : null}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ── Work experience ── */}
        {profile.experience.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Experiencia Laboral</Text>
            {profile.experience.map((exp, idx) => (
              <View key={idx} style={s.row}>
                <Text style={s.bullet}>• </Text>
                <View style={s.itemMain}>
                  <Text>
                    <Text style={s.bold}>{exp.position}</Text>
                    {exp.organization ? <Text> — {exp.organization}</Text> : null}
                    {(exp.startDate || exp.endDate) ? (
                      <Text style={s.muted}>
                        {' '}({formatDate(exp.startDate)} → {formatDate(exp.endDate) || 'Actual'})
                      </Text>
                    ) : null}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ── Scientific output — capped at 30 to keep the PDF size reasonable ── */}
        {profile.scientificOutputs.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>
              Producción Científica ({profile.scientificOutputs.length} publicaciones)
            </Text>
            {profile.scientificOutputs.slice(0, 30).map((output, idx) => (
              <View key={idx} style={s.rowGap}>
                <Text style={s.bullet}>• </Text>
                <View style={s.itemMain}>
                  <Text style={s.bold}>{output.title}</Text>
                  <Text style={s.muted}>
                    {output.authors.slice(0, 4).join(', ')}
                    {output.authors.length > 4 ? ' et al.' : ''}
                    {output.journal ? ` — ${output.journal}` : ''}
                    {output.publicationYear ? ` (${output.publicationYear})` : ''}
                    {output.doi ? `. DOI: ${output.doi}` : ''}
                  </Text>
                </View>
              </View>
            ))}
            {profile.scientificOutputs.length > 30 && (
              <Text style={[s.muted, { marginLeft: 12 }]}>
                ... y {profile.scientificOutputs.length - 30} publicaciones más.
              </Text>
            )}
          </View>
        )}

        {/* ── Projects — capped at 20 ── */}
        {profile.projects.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Proyectos ({profile.projects.length})</Text>
            {profile.projects.slice(0, 20).map((project, idx) => (
              <View key={idx} style={s.row}>
                <Text style={s.bullet}>• </Text>
                <View style={s.itemMain}>
                  <Text>
                    <Text style={s.bold}>{project.name}</Text>
                    {(project.status || project.researchType) ? (
                      <Text style={s.muted}>
                        {project.status ? ` [${project.status}]` : ''}
                        {project.researchType ? ` — ${project.researchType}` : ''}
                        {(project.startDate || project.endDate)
                          ? ` (${formatDate(project.startDate)} → ${formatDate(project.endDate) || 'Actual'})`
                          : ''}
                      </Text>
                    ) : null}
                  </Text>
                </View>
              </View>
            ))}
            {profile.projects.length > 20 && (
              <Text style={[s.muted, { marginLeft: 12 }]}>
                ... y {profile.projects.length - 20} proyectos más.
              </Text>
            )}
          </View>
        )}

        {/* ── Keywords ── */}
        {profile.keywords.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Palabras Clave</Text>
            <View style={s.tagsRow}>
              {profile.keywords.map((kw, idx) => (
                <Text key={idx} style={s.tag}>
                  {kw}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* ── Footer — fixed so it repeats on every page ── */}
        <View style={s.footer} fixed>
          <Text>Explorador de Producción Científica, UCR</Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `${pageNumber} / ${totalPages}  |  Generado el ${generatedDate}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
