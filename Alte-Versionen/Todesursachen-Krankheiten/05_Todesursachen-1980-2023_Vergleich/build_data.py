#!/usr/bin/env python3
"""Aggregiert die GBD-CSVs (Level 2) zu data.js für index.html.

Eingelesen werden ALLE CSV-Dateien in "Data/Level 2 Fälle":
  * Global.csv und De.csv (Hauptdaten) zuerst,
  * danach weitere Dateien (z. B. die extra heruntergeladene Lücken-Datei).
Gleiche Werte (Region, Ursache, Alter, Geschlecht, Jahr) werden nur einmal gezählt,
die Zusatzdateien füllen also nur Lücken. Weichen Werte voneinander ab, wird das
gemeldet; es gilt der Wert der Hauptdatei.

Todesfälle (Metrik "Anzahl") werden über beide Geschlechter summiert und die
5-Jahres-Altersgruppen zu 10er-Gruppen zusammengefasst (0–9, 10–19, … 80–89, 90+).
Zusätzlich wird je Ursache festgehalten, welche 5-Jahres-Gruppen überhaupt in den
Daten vorkommen ("present"), damit die Seite "keine Daten" von "0 Todesfälle"
unterscheiden kann. Die Bevölkerung (Weltbank WDI: "World" bzw. "Germany") wird je
Jahr übernommen, damit die Seite Todesfälle in % der Bevölkerung zeigen kann.

Aufruf:  python3 build_data.py
"""
import csv
import json
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "Data" / "Level 2 Fälle"
OUT = ROOT / "data.js"

MAIN_FILES = ["Global.csv", "De.csv"]
LOCATIONS = {"Global": "global", "Deutschland": "de"}
POP_ROWS = {"global": "WLD", "de": "DEU"}  # Country Code in der Weltbank-Datei
YEARS = list(range(1980, 2024))
AGE_LABELS = ["0–9", "10–19", "20–29", "30–39", "40–49",
              "50–59", "60–69", "70–79", "80–89", "90+"]
# GBD age_id -> Index der 10er-Gruppe
AGE_GROUP = {1: 0, 6: 0, 7: 1, 8: 1, 9: 2, 10: 2, 11: 3, 12: 3, 13: 4, 14: 4,
             15: 5, 16: 5, 17: 6, 18: 6, 19: 7, 20: 7, 30: 8, 31: 8, 32: 9, 235: 9}
AGE_NAME = {1: "<5", 6: "5–9", 7: "10–14", 8: "15–19", 9: "20–24", 10: "25–29",
            11: "30–34", 12: "35–39", 13: "40–44", 14: "45–49", 15: "50–54",
            16: "55–59", 17: "60–64", 18: "65–69", 19: "70–74", 20: "75–79",
            30: "80–84", 31: "85–89", 32: "90–94", 235: "95+"}


def load_all():
    """Gibt (values, names) zurück; values[(region, cause, age_id, sex_id, year)] = Anzahl."""
    files = sorted(SRC.glob("*.csv"),
                   key=lambda p: (p.name not in MAIN_FILES,
                                  MAIN_FILES.index(p.name) if p.name in MAIN_FILES else 0,
                                  p.name))
    values, names = {}, {}
    for path in files:
        added = dup = conflict = skipped = 0
        with open(path, encoding="utf-8-sig", newline="") as f:
            for row in csv.DictReader(f):
                if row["metric_name"] != "Anzahl" or row["measure_name"] != "Todesfälle":
                    skipped += 1
                    continue
                region = LOCATIONS.get(row["location_name"])
                year = int(row["year"])
                if region is None or year not in YEARS:
                    skipped += 1
                    continue
                cause = int(row["cause_id"])
                names[cause] = row["cause_name"]
                key = (region, cause, int(row["age_id"]), int(row["sex_id"]), year)
                val = float(row["val"])
                if key in values:
                    if abs(values[key] - val) > 1e-6 * max(1.0, abs(val)):
                        conflict += 1
                    else:
                        dup += 1
                    continue
                values[key] = val
                added += 1
        print(f"{path.name}: {added} neue Werte, {dup} schon vorhanden, "
              f"{conflict} abweichend, {skipped} übersprungen (z. B. Prozent)")
    return values, names


def load_population():
    """Gibt {region: [Einwohner je Jahr in YEARS]} aus der Weltbank-Datei zurück."""
    path = next((ROOT / "Data").glob("Weltbe*.csv"))
    with open(path, encoding="utf-8-sig", newline="") as f:
        rows = list(csv.reader(f))
    header_at = next(i for i, r in enumerate(rows) if r and r[0] == "Country Name")
    header = rows[header_at]
    by_code = {r[1]: dict(zip(header, r)) for r in rows[header_at + 1:] if len(r) > 1}
    return {region: [int(by_code[code][str(y)]) for y in YEARS]
            for region, code in POP_ROWS.items()}


def main():
    values, names = load_all()

    data = defaultdict(lambda: defaultdict(lambda: [[0.0] * len(YEARS) for _ in AGE_LABELS]))
    ages_seen = defaultdict(set)   # (region, cause) -> age_ids, die in den Daten vorkommen
    for (region, cause, age_id, _sex, year), val in values.items():
        data[region][cause][AGE_GROUP[age_id]][year - YEARS[0]] += val
        ages_seen[(region, cause)].add(age_id)

    out = {"years": YEARS, "ages": AGE_LABELS, "data": {}, "present": {},
           "population": load_population()}
    for region in LOCATIONS.values():
        out["data"][region] = {
            str(c): [[round(v, 1) for v in ages] for ages in data[region][c]]
            for c in sorted(data[region])
        }
        # je 10er-Gruppe: wie viele der 2 enthaltenen 5-Jahres-Gruppen kommen vor (0, 1, 2)
        out["present"][region] = {}
        for c in sorted(data[region]):
            cnt = [0] * len(AGE_LABELS)
            for age_id in ages_seen[(region, c)]:
                cnt[AGE_GROUP[age_id]] += 1
            out["present"][region][str(c)] = cnt
        total = sum(v for (r, *_), v in values.items() if r == region)
        agg = sum(v for c in data[region].values() for ages in c for v in ages)
        assert abs(agg - total) < 1e-3 * max(1.0, total), region
        print(f"{region}: {len(data[region])} Ursachen, Summe {agg:,.0f}")

    out["causes"] = [{"id": c, "name": names[c]} for c in sorted(names)]

    # Lücken sichtbar machen
    print("\nUrsachen mit unvollständiger Altersabdeckung:")
    all_ids = set(AGE_NAME)
    for c in sorted(names):
        for region in LOCATIONS.values():
            have = ages_seen[(region, c)]
            if have != all_ids and region == "global":
                miss = [AGE_NAME[a] for a in sorted(all_ids - have, key=lambda a: list(AGE_NAME).index(a))]
                print(f"  {c} {names[c]}: keine Werte für {', '.join(miss)}")

    OUT.write_text(
        "// Erzeugt von build_data.py – nicht von Hand ändern.\n"
        "window.TODESURSACHEN = " + json.dumps(out, ensure_ascii=False, separators=(",", ":")) + ";\n",
        encoding="utf-8",
    )
    print(f"\n{OUT.name}: {OUT.stat().st_size / 1024:.0f} KB")


if __name__ == "__main__":
    main()
