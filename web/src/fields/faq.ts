import type { Field } from 'payload'

// Domande frequenti: renderizzate in pagina e come schema FAQPage.
export const faqField: Field = {
  name: 'faq',
  label: 'FAQ',
  type: 'array',
  localized: true,
  admin: {
    description: 'Domande reali dei clienti. 5–8 per pagina servizio. Risposte dirette, 40–80 parole.',
    initCollapsed: true,
  },
  fields: [
    { name: 'question', label: 'Domanda', type: 'text', required: true },
    { name: 'answer', label: 'Risposta', type: 'textarea', required: true },
  ],
}

// Il paragrafo che le AI citano: risposta autonoma alla query principale della pagina.
export const answerField: Field = {
  name: 'answer',
  label: 'Risposta diretta',
  type: 'textarea',
  localized: true,
  admin: {
    description:
      'Paragrafo di 40–60 parole che risponde da solo alla domanda "cos\'è / cosa fate / quanto costa". È il blocco che Google AI Overviews e ChatGPT citano.',
  },
}
