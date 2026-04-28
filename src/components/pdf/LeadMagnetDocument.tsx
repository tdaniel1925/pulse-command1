'use client';

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';

interface Section {
  heading: string;
  body: string;
  tips: string[];
}

interface LeadMagnetContent {
  title: string;
  subtitle: string;
  intro: string;
  sections: Section[];
  cta_heading: string;
  cta_body: string;
  cta_action: string;
}

interface LeadMagnetDocumentProps {
  businessName: string;
  website: string;
  primaryColor: string;
  content: LeadMagnetContent;
}

Font.register({
  family: 'Helvetica',
  fonts: [],
});

export function LeadMagnetDocument({
  businessName,
  website,
  primaryColor,
  content,
}: LeadMagnetDocumentProps) {
  const styles = StyleSheet.create({
    page: {
      backgroundColor: '#ffffff',
      fontFamily: 'Helvetica',
      paddingBottom: 60,
    },
    header: {
      backgroundColor: primaryColor,
      padding: 48,
      paddingBottom: 40,
    },
    headerBusiness: {
      fontSize: 11,
      color: 'rgba(255,255,255,0.75)',
      textTransform: 'uppercase',
      letterSpacing: 1.5,
      marginBottom: 12,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#ffffff',
      marginBottom: 10,
      lineHeight: 1.3,
    },
    headerSubtitle: {
      fontSize: 14,
      color: 'rgba(255,255,255,0.85)',
      lineHeight: 1.4,
    },
    body: {
      padding: 48,
      paddingTop: 36,
    },
    intro: {
      fontSize: 13,
      color: '#374151',
      lineHeight: 1.6,
      marginBottom: 32,
      borderLeftWidth: 3,
      borderLeftColor: primaryColor,
      paddingLeft: 16,
    },
    section: {
      marginBottom: 28,
    },
    sectionHeading: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: 8,
    },
    sectionBody: {
      fontSize: 12,
      color: '#374151',
      lineHeight: 1.6,
      marginBottom: 10,
    },
    tipsContainer: {
      backgroundColor: '#f9fafb',
      borderRadius: 6,
      padding: 14,
      marginTop: 6,
    },
    tipsLabel: {
      fontSize: 10,
      fontWeight: 'bold',
      color: primaryColor,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 8,
    },
    tip: {
      fontSize: 11,
      color: '#374151',
      lineHeight: 1.5,
      marginBottom: 4,
    },
    divider: {
      borderTopWidth: 1,
      borderTopColor: '#e5e7eb',
      marginVertical: 24,
    },
    ctaBox: {
      backgroundColor: primaryColor,
      borderRadius: 8,
      padding: 28,
      marginTop: 8,
    },
    ctaHeading: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#ffffff',
      marginBottom: 10,
    },
    ctaBody: {
      fontSize: 12,
      color: 'rgba(255,255,255,0.9)',
      lineHeight: 1.6,
      marginBottom: 14,
    },
    ctaAction: {
      fontSize: 13,
      fontWeight: 'bold',
      color: '#ffffff',
      borderWidth: 2,
      borderColor: 'rgba(255,255,255,0.6)',
      borderRadius: 6,
      padding: 10,
      textAlign: 'center',
    },
    footer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: '#f9fafb',
      borderTopWidth: 1,
      borderTopColor: '#e5e7eb',
      padding: 16,
      paddingHorizontal: 48,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    footerText: {
      fontSize: 10,
      color: '#9ca3af',
    },
    footerBrand: {
      fontSize: 10,
      color: '#9ca3af',
    },
  });

  return (
    <Document
      title={content.title}
      author={businessName}
      creator="BundledContent"
    >
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerBusiness}>{businessName}</Text>
          <Text style={styles.headerTitle}>{content.title}</Text>
          <Text style={styles.headerSubtitle}>{content.subtitle}</Text>
        </View>

        {/* Body */}
        <View style={styles.body}>
          {/* Intro */}
          <Text style={styles.intro}>{content.intro}</Text>

          {/* Sections */}
          {content.sections.map((section, index) => (
            <View key={index} style={styles.section}>
              <Text style={styles.sectionHeading}>
                {index + 1}. {section.heading}
              </Text>
              <Text style={styles.sectionBody}>{section.body}</Text>

              {section.tips && section.tips.length > 0 && (
                <View style={styles.tipsContainer}>
                  <Text style={styles.tipsLabel}>Key Takeaways</Text>
                  {section.tips.map((tip, tipIdx) => (
                    <Text key={tipIdx} style={styles.tip}>
                      • {tip}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          ))}

          <View style={styles.divider} />

          {/* CTA */}
          <View style={styles.ctaBox}>
            <Text style={styles.ctaHeading}>{content.cta_heading}</Text>
            <Text style={styles.ctaBody}>{content.cta_body}</Text>
            <Text style={styles.ctaAction}>{content.cta_action}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            © {new Date().getFullYear()} {businessName}
            {website ? ` · ${website}` : ''}
          </Text>
          <Text style={styles.footerBrand}>Powered by BundledContent</Text>
        </View>
      </Page>
    </Document>
  );
}
