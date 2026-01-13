import { Lead, LeadType } from '@/types/lead'

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
  description: string
  leadTypes: LeadType[]
  recommended?: boolean
}

// Email templates with placeholders
// Placeholders: {{name}}, {{address}}, {{contactPerson}}
export const EMAIL_TEMPLATES: EmailTemplate[] = [
  // Generic templates for all lead types
  {
    id: 'initial-outreach',
    name: 'Initial Outreach',
    description: 'Introduce SAG-Trash services to a new prospect',
    subject: 'Professional Pool & HOA Services for {{name}}',
    body: `Hi {{contactPerson}},

I hope this message finds you well! I'm reaching out on behalf of SAG-Trash, a trusted provider of professional pool and HOA management services.

We specialize in helping property managers and community associations like {{name}} maintain pristine aquatic facilities while reducing operational costs.

Our services include:
• Routine pool maintenance and chemical balancing
• Equipment repairs and upgrades
• Compliance and safety inspections
• Emergency service availability

I'd love to schedule a brief call to discuss how we can support {{name}} in {{address}}. Are you available for a quick conversation next week?

Looking forward to connecting!

Best regards,
[Your Name]
SAG-Trash Services`,
    leadTypes: ['pool', 'hoa', 'neighborhood', 'other'],
  },
  {
    id: 'follow-up',
    name: 'Follow-Up',
    description: 'Check in after initial contact',
    subject: 'Following Up - Pool Services for {{name}}',
    body: `Hi {{contactPerson}},

I hope you had a chance to see my previous message about SAG-Trash services for {{name}}.

I wanted to reach out again as we often have availability in your area at {{address}}. Given the seasonal demand for pool services, now is a great time to discuss partnership opportunities.

If you're interested in learning more about how we can support your property's aquatic facilities, I'd be happy to:
• Provide a complimentary consultation
• Share case studies from similar properties
• Discuss our flexible service packages

Feel free to reply to this email or call at your convenience.

Best regards,
[Your Name]
SAG-Trash Services`,
    leadTypes: ['pool', 'hoa', 'neighborhood', 'other'],
  },
  {
    id: 'seasonal-reminder',
    name: 'Seasonal Reminder',
    description: 'Seasonal maintenance offer',
    subject: 'Prepare {{name}} for the Season - Pool Maintenance Services',
    body: `Hi {{contactPerson}},

As we head into the busy season, {{name}} at {{address}} should ensure its pool facilities are in top condition.

SAG-Trash specializes in seasonal pool preparations including:
• Deep cleaning and inspection
• Equipment testing and maintenance
• Chemical treatment and balancing
• Safety compliance verification

Our team can typically schedule seasonal services within 48 hours of your request.

Would {{name}} be interested in our seasonal maintenance package? I'm happy to provide pricing and availability details.

Thank you,
[Your Name]
SAG-Trash Services`,
    leadTypes: ['pool'],
    recommended: true,
  },

  // Pool-specific templates
  {
    id: 'pool-maintenance-checkin',
    name: 'Pool Maintenance Check-In',
    description: 'Specialized pool maintenance and care',
    subject: 'Expert Pool Maintenance for {{name}} - SAG-Trash',
    body: `Hi {{contactPerson}},

I wanted to reach out to {{name}} at {{address}} regarding comprehensive pool maintenance and care services.

Proper pool maintenance is critical for member safety, equipment longevity, and regulatory compliance. At SAG-Trash, we provide:

• Weekly chemical balancing and water testing
• Equipment inspection and preventative maintenance
• Filter cleaning and system optimization
• Deck and surrounding area maintenance
• Compliance documentation and reporting

Our proactive maintenance approach helps avoid costly repairs and keeps your facility operating at peak efficiency year-round.

Would you be open to discussing a customized maintenance plan for {{name}}? I can provide references from similar facilities we service in the area.

Best regards,
[Your Name]
SAG-Trash Services`,
    leadTypes: ['pool'],
    recommended: true,
  },
  {
    id: 'pool-service-packages',
    name: 'Service Packages for Pools',
    description: 'Sales-focused pool service options',
    subject: 'Flexible Service Packages for {{name}}',
    body: `Hi {{contactPerson}},

Thank you for your interest in SAG-Trash pool services for {{name}}.

We offer flexible service packages tailored to meet the unique needs of each facility:

**Basic Maintenance Package**
• 2x weekly visits
• Chemical balancing and testing
• Equipment inspection

**Premium Care Package**
• 3x weekly visits
• All basic services plus
• Deep cleaning and tile brushing
• Equipment repair coordination

**Elite Management Package**
• Daily service availability
• 24/7 emergency support
• Full facility management and reporting
• Dedicated service technician

All packages include:
• Transparent pricing with no hidden fees
• Flexible contract terms (monthly or annual)
• Performance guarantees

Could we schedule a brief consultation to discuss which package best fits {{name}}'s needs and budget? I'm confident we can deliver exceptional value.

Best regards,
[Your Name]
SAG-Trash Services`,
    leadTypes: ['pool'],
  },
  {
    id: 'pool-emergency-service',
    name: 'Emergency Pool Service',
    description: 'Emergency response and urgent repairs',
    subject: 'Rapid Emergency Pool Service for {{name}}',
    body: `Hi {{contactPerson}},

Are you aware that SAG-Trash offers rapid emergency pool service response for {{name}} at {{address}}?

When equipment failures, chemical imbalances, or other urgent issues occur, every hour counts. Our emergency response team:

• Responds within 2-4 hours in most cases
• Handles equipment repairs and replacements
• Addresses water chemistry emergencies
• Provides 24/7 availability

By establishing a service relationship now, you'll have priority access to our emergency response team should urgent issues arise.

Even if you're currently satisfied with your maintenance provider, having SAG-Trash as a backup resource is valuable peace of mind for {{name}}.

Would you like to discuss adding emergency service coverage?

Best regards,
[Your Name]
SAG-Trash Services`,
    leadTypes: ['pool'],
  },
]

/**
 * Fill in template placeholders with lead data
 */
export function fillTemplate(template: EmailTemplate, lead: Lead): EmailTemplate {
  const placeholders: Record<string, string> = {
    name: lead.name || '',
    address: lead.address || '',
    contactPerson: lead.contactPerson || 'there',
  }

  let filledSubject = template.subject
  let filledBody = template.body

  // Replace all placeholders
  Object.entries(placeholders).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`
    filledSubject = filledSubject.replace(new RegExp(placeholder, 'g'), value)
    filledBody = filledBody.replace(new RegExp(placeholder, 'g'), value)
  })

  return {
    ...template,
    subject: filledSubject,
    body: filledBody,
  }
}

/**
 * Get template by ID
 */
export function getTemplate(id: string): EmailTemplate | undefined {
  return EMAIL_TEMPLATES.find((t) => t.id === id)
}

/**
 * Get templates applicable to a specific lead type
 * Returns recommended templates first, then other applicable templates
 */
export function getTemplatesForLeadType(
  leadType: LeadType
): {
  recommended: EmailTemplate[]
  other: EmailTemplate[]
} {
  const applicableTemplates = EMAIL_TEMPLATES.filter((t) =>
    t.leadTypes.includes(leadType)
  )

  const recommended = applicableTemplates.filter((t) => t.recommended)
  const other = applicableTemplates.filter((t) => !t.recommended)

  return { recommended, other }
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error('Failed to copy to clipboard:', err)
    return false
  }
}
