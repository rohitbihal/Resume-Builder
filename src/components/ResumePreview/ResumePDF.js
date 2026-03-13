import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Register fonts for the PDF
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.ttf', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hjp-Ek-_EeA.ttf', fontWeight: 700 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-italic-webfont.ttf', fontWeight: 400, fontStyle: 'italic' }
  ]
});

const styles = StyleSheet.create({
  page: { padding: 30, fontFamily: 'Inter' },
  header: { marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#111', paddingBottom: 10 },
  name: { fontSize: 24, fontWeight: 'bold' },
  contactRow: { flexDirection: 'row', gap: 10, marginTop: 5 },
  contactItem: { fontSize: 10, color: '#444' },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', marginTop: 15, marginBottom: 5, textTransform: 'uppercase' },
  itemContainer: { marginBottom: 10 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  itemTitle: { fontSize: 12, fontWeight: 'bold' },
  itemMeta: { fontSize: 10, color: '#666' },
  itemDesc: { fontSize: 10, marginTop: 4, lineHeight: 1.4 },
  watermark: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    fontSize: 10,
    color: '#aaa',
    fontStyle: 'italic'
  }
});

// A simplified generic PDF template mapped from the builder data
export const ResumePDF = ({ data, hasWatermark = true }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* Header / Personal Info */}
        <View style={styles.header}>
          <Text style={styles.name}>
            {data.personalInfo.firstName} {data.personalInfo.lastName}
          </Text>
          <View style={styles.contactRow}>
            {data.personalInfo.email && <Text style={styles.contactItem}>{data.personalInfo.email}</Text>}
            {data.personalInfo.phone && <Text style={styles.contactItem}>• {data.personalInfo.phone}</Text>}
            {data.personalInfo.location && <Text style={styles.contactItem}>• {data.personalInfo.location}</Text>}
          </View>
        </View>

        {/* Executive Summary */}
        {data.track === 'experienced' && data.executiveSummary?.summary && (
          <View>
            <Text style={styles.sectionTitle}>Executive Summary</Text>
            <Text style={styles.itemDesc}>{data.executiveSummary.summary}</Text>
          </View>
        )}

        {/* Work Experience */}
        {data.track === 'experienced' && data.workExperience?.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Experience</Text>
            {data.workExperience.map((exp, i) => (
              <View key={i} style={styles.itemContainer}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>{exp.jobTitle} at {exp.company}</Text>
                  <Text style={styles.itemMeta}>{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</Text>
                </View>
                <Text style={styles.itemDesc}>{exp.description}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Internships */}
        {data.track === 'fresher' && data.internships?.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Internships & Freelance</Text>
            {data.internships.map((int, i) => (
              <View key={i} style={styles.itemContainer}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>{int.role} at {int.company}</Text>
                  <Text style={styles.itemMeta}>{int.startDate} - {int.endDate}</Text>
                </View>
                <Text style={styles.itemDesc}>{int.description}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Education */}
        {data.education?.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Education</Text>
            {data.education.map((edu, i) => (
              <View key={i} style={styles.itemContainer}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>{edu.degree} {edu.field && `in ${edu.field}`}</Text>
                  <Text style={styles.itemMeta}>{edu.startDate} - {edu.endDate}</Text>
                </View>
                <Text style={styles.itemDesc}>
                  {edu.institution} 
                  {edu.gpa && ` • GPA: ${edu.gpa}`}
                  {edu.cgpa && ` • CGPA: ${edu.cgpa}`}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Skills */}
        {data.skills?.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Skills</Text>
            <Text style={styles.itemDesc}>
              {data.skills.map(s => s.name).join(' • ')}
            </Text>
          </View>
        )}

        {/* Custom Sections */}
        {data.customSections?.map((section, i) => (
          <View key={`custom-${i}`}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item, j) => (
              // Stripping HTML tags simply for the base PDF rendering
              <Text key={j} style={styles.itemDesc}>• {item.replace(/<[^>]+>/g, '')}</Text>
            ))}
          </View>
        ))}

        {hasWatermark && (
          <Text style={styles.watermark}>Created with CreativeResume (Free Plan)</Text>
        )}

      </Page>
    </Document>
  );
};
