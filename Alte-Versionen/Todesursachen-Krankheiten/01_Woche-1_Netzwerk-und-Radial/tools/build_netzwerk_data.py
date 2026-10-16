"""Erzeugt netzwerk-data.js aus den IHME-CSVs (Ansicht "Netzwerk").
Aufruf im Projektordner:  python tools/build_netzwerk_data.py
Die CSVs enthalten keine Hierarchie; die Zuordnung Krankheit -> Level 2 -> Level 1 steht unten
und wird gegen die Level-2-Summen aus dem IHME-Datensatz geprueft (Abweichung muss 0 sein)."""
import csv, json, collections

R = lambda a, b: set(range(a, b + 1))
L1 = {295: [344, 386, 955, 956, 957, 961, 962],
      409: [410, 491, 508, 526, 542, 558, 626, 640, 653, 973, 974],
      687: [688, 696, 717]}
CHILD = {
 955: {300, 741, 394, 395, 396, 399, 948, 949, 950},
 956: {934, 946, 947, 322, 328, 329, 1048},
 957: {302, 319, 320, 321, 959},
 961: {332, 337, 338, 339, 340, 341, 342, 401, 402, 403, 404, 408, 843, 935},
 344: {345, 346, 348, 350, 351, 352, 353, 357, 358, 359, 361, 365},
 962: {367, 368, 369, 370, 374, 375, 376, 381, 382, 383, 384, 385, 995, 1160},
 386: {387, 391},
 410: R(411, 489) | {845, 846, 847, 848, 849, 943, 964, 996, 1005, 1006, 1007, 1009, 1010, 1011, 1012, 1013, 1164},
 491: {492, 493, 495, 496, 497, 498, 500, 501, 502, 503, 507, 938, 942, 944, 968, 969, 970, 1004},
 508: {509, 511, 512, 513, 514, 515, 516, 520},
 526: {522, 523, 524, 525, 971, 527, 528, 529, 530, 531, 533, 534, 535, 1024, 1025, 1161},
 542: {543, 544, 545, 546, 554, 557},
 558: {573},
 973: {560, 562, 563, 564, 566},
 974: {975, 976, 588, 591, 592, 593, 997, 998},
 626: {627, 639},
 640: {595, 596, 602, 604, 607, 608, 612, 614, 615, 616, 618, 625, 642, 643, 644, 645, 648, 649, 650, 651, 652, 686, 1032},
 653: {656, 657, 665, 668},
 688: {690, 691, 692, 693, 694, 695},
 696: {697, 698, 699, 701, 703, 705, 707, 708, 710, 711, 713, 715, 716, 940, 842, 729},
 717: {721, 1163, 725, 726, 727, 945, 854},
}
EXCL = {1026, 1027, 1028, 1029, 1059}  # Summenzeilen (Krebs gesamt, Krankheitslast ...), wuerden doppelt zaehlen
EN_DE = {"Other direct maternal disorders": "Andere direkte maternale Störungen",
         "Other digestive diseases": "Andere Verdauungserkrankungen",
         "Self-harm by other specified means": "Selbstschädigung durch andere Mittel",
         "Other benign and in situ neoplasms": "Andere gutartige und In-situ-Neubildungen"}
parent = {c: l2 for l2, cs in CHILD.items() for c in cs}
l2_l1 = {l2: l1 for l1, l2s in L1.items() for l2 in l2s}

rd = lambda p: list(csv.DictReader(open(p, encoding="utf-8-sig")))
rows = rd("Data/All Krankeheiten.csv")
years = sorted({int(r["year"]) for r in rows})
names, vals = {}, collections.defaultdict(lambda: [0.0] * len(years))
for r in rows:
    c = int(r["cause_id"])
    if c in EXCL: continue
    n = " ".join(r["cause_name"].split())
    names[c] = EN_DE.get(n, n)
    vals[c][years.index(int(r["year"]))] += float(r["val"])
missing = set(names) - set(parent)
assert not missing, missing

l2names = {}
for r in rd("Data/IHME-GBD_2023_DATA-066db725-1/IHME-GBD_2023_DATA-066db725-1.csv"):
    l2names[int(r["cause_id"])] = r["cause_name"]
l1names = {int(r["cause_id"]): r["cause_name"] for r in rd("Data/Level 1 Krankheiten.csv")}

# Pruefung: Summe je Level 1 gegen Level-1-Datei
l1ref = collections.defaultdict(float)
for r in rd("Data/Level 1 Krankheiten.csv"):
    l1ref[(int(r["cause_id"]), int(r["year"]))] += float(r["val"])
worst = 0
for l1, l2s in L1.items():
    for i, y in enumerate(years):
        s = sum(vals[c][i] for c in names if l2_l1[parent[c]] == l1)
        worst = max(worst, abs(s - l1ref[(l1, y)]) / l1ref[(l1, y)])
print("max. relative Abweichung Level 1:", worst)
assert worst < 1e-6

out = {"years": years,
       "l1": [{"id": i, "name": l1names[i]} for i in L1],
       "l2": [{"id": i, "name": l2names[i], "l1": l2_l1[i]} for i in sorted(l2_l1)],
       "det": [{"id": c, "name": names[c], "l2": parent[c], "v": [round(v) for v in vals[c]]} for c in sorted(names)]}
with open("netzwerk-data.js", "w", encoding="utf-8") as f:
    f.write("// erzeugt von tools/build_netzwerk_data.py (Deutschland, GBD 2023, IHME). Nicht von Hand bearbeiten.\n")
    f.write("const NETDATA = " + json.dumps(out, ensure_ascii=False, separators=(",", ":")) + ";\n")
print(len(out["det"]), "Krankheiten,", len(out["l2"]), "Level-2")
