import type { GlobalConfig } from 'payload'
import { anyone, authenticated } from '../access'
import { revalidateGlobal } from '../hooks/revalidate'

// Dati aziendali: footer, pagine legali, schema Organization/LocalBusiness.
export const Company: GlobalConfig = {
  slug: 'company',
  label: 'Dati aziendali',
  access: { read: anyone, update: authenticated },
  hooks: { afterChange: [revalidateGlobal('company')] },
  fields: [
    { name: 'name', label: 'Ragione sociale', type: 'text', required: true, defaultValue: 'NOT4SALE Srl' },
    { name: 'brand', label: 'Brand', type: 'text', defaultValue: 'not4sale' },
    {
      type: 'row',
      fields: [
        { name: 'address', label: 'Indirizzo', type: 'text', defaultValue: 'Via Lungo Tavollo snc' },
        { name: 'cap', label: 'CAP', type: 'text', defaultValue: '47841' },
        { name: 'city', label: 'Città', type: 'text', defaultValue: 'Cattolica' },
        { name: 'province', label: 'Prov.', type: 'text', defaultValue: 'RN' },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'piva', label: 'P.IVA', type: 'text', defaultValue: '04870280403' },
        { name: 'email', label: 'Email', type: 'email', defaultValue: 'hello@not4.sale' },
        { name: 'phone', label: 'Telefono', type: 'text' },
      ],
    },
    {
      name: 'geo',
      type: 'group',
      label: 'Coordinate',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'lat', type: 'number' },
            { name: 'lng', type: 'number' },
          ],
        },
      ],
    },
    {
      name: 'areaServed',
      label: 'Zone servite',
      type: 'text',
      hasMany: true,
      defaultValue: ['Cattolica', 'Rimini', 'Riccione', 'Pesaro', 'Emilia-Romagna', 'Marche', 'Italia'],
    },
    {
      name: 'sameAs',
      label: 'Profili social',
      type: 'array',
      fields: [{ name: 'url', type: 'text', required: true }],
    },
  ],
}
