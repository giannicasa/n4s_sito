import json, random, re, time, urllib.parse, urllib.request
KW = {'siti-web': ['siti web per', 'sito web per', 'web agency per'], 'gestione-social': ['social media manager per', 'gestione social per'],
      'comune': ['marketing per', 'agenzia marketing per'], 'google-ads': ['google ads per'], 'seo-locale': ['seo per'],
      'meta-ads': ['facebook ads per'], 'logo-identita-visiva': ['logo per']}
SECT = {'hotel': ['hotel', 'alberghi'], 'ristorazione': ['ristoranti'], 'immobiliare': ['agenzie immobiliari', 'immobiliare'],
        'edilizia': ['imprese edili', 'edilizia'], 'manifatturiero': ['aziende manifatturiere', 'aziende metalmeccaniche'],
        'moda': ['abbigliamento', 'negozi di abbigliamento'], 'arredamento': ['mobilifici', 'arredamento'], 'nautica': ['nautica', 'cantieri navali'],
        'agroalimentare': ['cantine', 'aziende agricole', 'agriturismi'], 'stabilimenti-balneari': ['stabilimenti balneari'],
        'studi-professionali': ['avvocati', 'commercialisti', 'studi professionali'], 'sanita-privata': ['dentisti', 'studi medici', 'fisioterapisti'],
        'automotive': ['concessionarie', 'autofficine'], 'wellness': ['palestre', 'centri estetici', 'spa']}
out = []
def suggest(q):
    url = 'https://suggestqueries.google.com/complete/search?client=firefox&hl=it&gl=it&q=' + urllib.parse.quote(q)
    for i in range(5):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'}), timeout=15) as r:
                return json.loads(r.read().decode('utf-8', 'ignore'))[1]
        except Exception:
            time.sleep(15 * (i + 1))
    return []
for slug, kws in KW.items():
    for kw in kws:
        for sec, terms in SECT.items():
            for t in terms:
                q = f'{kw} {t}'
                s = [x for x in suggest(q) if t.split()[0][:5] in x]
                out.append({'slug': slug, 'sector': sec, 'q': q, 'n': len(s), 'sugg': s})
                time.sleep(random.uniform(0.6, 1.2))
json.dump(out, open('sectors.json', 'w'), ensure_ascii=False, indent=1)
print('FATTO', len(out))
