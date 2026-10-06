// Inserisce i dati strutturati nell'HTML servito (visibili anche ai crawler che non eseguono JS).
export const JsonLd = ({ data }: { data: object }) => (
  <script
    type="application/ld+json"
    // "<" escapato per non chiudere lo script se un testo contiene "</script>"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
  />
)
