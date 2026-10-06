import json, os, random, sys, time, unicodedata, urllib.parse, urllib.request
plan = json.load(open('/Users/giovannicasagrande/Downloads/Sviluppo/Vetrina/n4s/web/content/local/piano.json'))
kws = json.load(open('keywords.json'))
cities = [c for b in plan['batches'].values() for c in b['comuni']]
out = 'results.jsonl'
done = set()
if os.path.exists(out):
    for line in open(out):
        r = json.loads(line); done.add((r['kw'], r['city']))
norm = lambda s: unicodedata.normalize('NFD', s.lower()).encode('ascii', 'ignore').decode().replace("'", ' ').replace('-', ' ')
def suggest(q):
    url = 'https://suggestqueries.google.com/complete/search?client=firefox&hl=it&gl=it&q=' + urllib.parse.quote(q)
    for i in range(6):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129 Safari/537.36'})
            with urllib.request.urlopen(req, timeout=15) as r:
                return json.loads(r.read().decode('utf-8', 'ignore'))[1]
        except Exception as e:
            time.sleep(20 * (i + 1))
    return None
MAIN = ['Rimini','Riccione','Cattolica','Misano Adriatico','Bellaria-Igea Marina','Santarcangelo di Romagna','Coriano','Verucchio',
        'Morciano di Romagna','San Giovanni in Marignano','Novafeltria','Pesaro','Fano','Urbino','Vallefoglia','Mondolfo','Fossombrone',
        'Gabicce Mare','Cagli','Colli al Metauro','Tavullia','Montelabbate','Pergola','Gradara']
import re
def real_hits(r):
    c = norm(r['city'])
    return [x for x in r['sugg'] if re.search(r'(^|\s)' + re.escape(c) + r'(\s|$)', norm(x))]
results = {}
if os.path.exists(out):
    for line in open(out):
        r = json.loads(line); results[(r['kw'], r['city'])] = len(real_hits(r))
f = open(out, 'a')
total = sum(len(v) for v in kws.values()) * len(cities)
n = len(done)
for slug, words in kws.items():
    for kw in words:
        # prima i centri principali, poi i piccoli comuni solo se la parola ha domanda diffusa
        main_hits = None
        for city in MAIN + [c for c in cities if c not in MAIN]:
            if city not in MAIN:
                if main_hits is None:
                    main_hits = sum(1 for m in MAIN if results.get((kw, m), 0) > 0)
                if main_hits < 6: break
            if (kw, city) in done: continue
            q = f'{kw} {city}'
            s = suggest(q)
            if s is None:
                print('BLOCCATO, interrompo', q, flush=True); sys.exit(2)
            nc = norm(city)
            hits = [x for x in s if nc in norm(x)]
            rec = {'slug': slug, 'kw': kw, 'city': city, 'n': len(hits), 'sugg': hits}
            f.write(json.dumps(rec, ensure_ascii=False) + '\n'); f.flush()
            results[(kw, city)] = len(real_hits(rec))
            n += 1
            if n % 100 == 0: print(f'{n}/{total}', flush=True)
            time.sleep(random.uniform(0.7, 1.4))
print('FATTO', n, flush=True)
