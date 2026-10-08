# Analisi autocomplete Google: parole chiave dei servizi × città italiane. Riprende da dove si è fermata.
import json, os, random, re, sys, time, unicodedata, urllib.parse, urllib.request
cities = [c for l in json.load(open('citta.json')).values() for c in l]
kws = json.load(open('keywords.json'))
out = 'results.jsonl'
norm = lambda s: unicodedata.normalize('NFD', s.lower()).encode('ascii', 'ignore').decode().replace("'", ' ').replace('-', ' ')
done = set()
if os.path.exists(out):
    for line in open(out):
        r = json.loads(line); done.add((r['kw'], r['city']))
def suggest(q):
    url = 'https://suggestqueries.google.com/complete/search?client=firefox&hl=it&gl=it&q=' + urllib.parse.quote(q)
    for i in range(6):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129 Safari/537.36'})
            with urllib.request.urlopen(req, timeout=15) as r:
                return json.loads(r.read().decode('utf-8', 'ignore'))[1]
        except Exception:
            time.sleep(20 * (i + 1))
    return None
f = open(out, 'a')
total = sum(len(v) for v in kws.values()) * len(cities)
n = len(done)
for slug, words in kws.items():
    for kw in words:
        for city in cities:
            if (kw, city) in done: continue
            s = suggest(f'{kw} {city}')
            if s is None:
                print('BLOCCATO', kw, city, flush=True); sys.exit(2)
            c = norm(city)
            hits = [x for x in s if re.search(r'(^|\s)' + re.escape(c) + r'(\s|$)', norm(x))]
            f.write(json.dumps({'slug': slug, 'kw': kw, 'city': city, 'n': len(hits), 'sugg': hits}, ensure_ascii=False) + '\n'); f.flush()
            n += 1
            if n % 100 == 0: print(f'{n}/{total}', flush=True)
            time.sleep(random.uniform(0.7, 1.3))
print('FATTO', n, flush=True)
