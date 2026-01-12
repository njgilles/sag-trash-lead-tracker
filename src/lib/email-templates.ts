import { Lead } from '@/types/lead'

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
  description: string
}

// Email templates with placeholders
// Placeholders: {{name}}, {{address}}, {{contactPerson}}
export const EMAIL_TEMPLATES: EmailTemplate[] = [
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
