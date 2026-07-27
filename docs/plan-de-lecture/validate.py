import json, collections

CANON = {
 "GEN":50,"EXO":40,"LEV":27,"NUM":36,"DEU":34,"JOS":24,"JDG":21,"RUT":4,"1SA":31,"2SA":24,
 "1KI":22,"2KI":25,"1CH":29,"2CH":36,"EZR":10,"NEH":13,"EST":10,"JOB":42,"PSA":150,"PRO":31,
 "ECC":12,"SNG":8,"ISA":66,"JER":52,"LAM":5,"EZK":48,"DAN":12,"HOS":14,"JOL":3,"AMO":9,
 "OBA":1,"JON":4,"MIC":7,"NAM":3,"HAB":3,"ZEP":3,"HAG":2,"ZEC":14,"MAL":4,
 "MAT":28,"MRK":16,"LUK":24,"JHN":21,"ACT":28,"ROM":16,"1CO":16,"2CO":13,"GAL":6,"EPH":6,
 "PHP":4,"COL":4,"1TH":5,"2TH":3,"1TI":6,"2TI":4,"TIT":3,"PHM":1,"HEB":13,"JAS":5,
 "1PE":5,"2PE":3,"1JN":5,"2JN":1,"3JN":1,"JUD":1,"REV":22,
}

plans = json.load(open("plans.json"))
errors = []
ids = set()
cats = collections.Counter()

assert len(plans) == 12, f"12 plans attendus, {len(plans)} trouvés"

for p in plans:
    pid = p["id"]
    if set(p.keys()) != {"id","title","desc","category","days","chapters"}:
        errors.append(f"{pid}: clés inattendues {set(p.keys())}")
    if pid in ids: errors.append(f"id dupliqué: {pid}")
    ids.add(pid)
    if p["category"] not in ("vie","biblique","discipline"):
        errors.append(f"{pid}: catégorie invalide")
    cats[p["category"]] += 1
    d = p["days"]
    if not (5 <= d <= 30): errors.append(f"{pid}: durée {d} hors 5-30")
    n = len(p["chapters"])
    if n < d: errors.append(f"{pid}: {n} chapitres < {d} jours")
    if n > 3*d: errors.append(f"{pid}: {n} chapitres > 3x{d} jours")
    seen = set()
    for c in p["chapters"]:
        b, ch = c["book_id"], c["chapter"]
        if b not in CANON:
            errors.append(f"{pid}: code livre inconnu {b}"); continue
        if not (1 <= ch <= CANON[b]):
            errors.append(f"{pid}: {b} {ch} n'existe pas (max {CANON[b]})")
        if (b,ch) in seen:
            errors.append(f"{pid}: doublon {b} {ch}")
        seen.add((b,ch))
    print(f"{pid:24s} {p['category']:10s} {d:2d} j / {n:2d} ch  (~{n/d:.1f} ch/jour)")

print()
print("Répartition catégories:", dict(cats))
print("ERREURS:", errors if errors else "aucune ✅")
