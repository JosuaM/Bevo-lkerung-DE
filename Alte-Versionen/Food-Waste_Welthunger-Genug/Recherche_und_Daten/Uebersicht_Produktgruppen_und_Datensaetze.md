# Teil 1: Produktgruppen, Welt 2022

Quelle: FAOSTAT Food Balance Sheets (Verluste = Ernte bis Verkauf). Bedarf: WHO und EAT-Lancet (siehe Hinweise).

| Produktgruppe | Produktion (Mio. t) | Verluste (Mio. t) | Verlust (% der Produktion) | Verfügbar (kg pro Kopf und Jahr) | Kalorien (kcal pro Kopf und Tag) | Verlust (kg pro Kopf und Jahr) | Bedarf (kg pro Kopf und Jahr) |
|---|---|---|---|---|---|---|---|
| Obst und Gemüse zusammen | 2.116 | 188 | 8,9 | 234 | 227 | 23,5 | 146 (WHO: mind. 400 g pro Tag) |
| davon Gemüse | 1.306 | 114 | 8,8 | 148 | 109 | 14,3 | 110 (EAT-Lancet: 300 g pro Tag) |
| davon Obst | 810 | 74 | 9,1 | 87 | 119 | 9,2 | |
| Getreide | 3.071 | 136 | 4,4 | 176 | 1.276 | 17,0 | 85 (EAT-Lancet: 232 g Vollkorn pro Tag) |
| Knollen und Wurzeln | 909 | 87 | 9,6 | 69 | 160 | 10,9 | |
| Milch | 956 | 27 | 2,8 | 87 | 169 | 3,3 | 91 (EAT-Lancet: 250 g pro Tag) |
| Fleisch | 364 | 1,7 | 0,5 | 45 | 211 | 0,2 | 16 (EAT-Lancet: 14 g rotes Fleisch + 29 g Geflügel pro Tag, Spanne ab 0) |
| Eier | 95 | 4,8 | 5,0 | 10,5 | 37 | 0,6 | 5 (EAT-Lancet: 13 g pro Tag, Spanne 0–25 g) |
| Hülsenfrüchte | 97 | 5,2 | 5,3 | 7,8 | 69 | 0,6 | |
| Ölsaaten | 1.102 | 56 | 5,1 | 9,7 | 74 | 7,0 | |
| Zuckerpflanzen | 2.180 | 132 | 6,0 | 5,2 | 5 | 16,5 | |

## Hunger 2022 (Welt)
- 688 Mio. Menschen unterernährt (8,6 %)
- ca. 2,2 Mrd. Menschen mit mäßiger oder schwerer Ernährungsunsicherheit
- Durchschnittlicher Kalorienbedarf: 2.371 kcal pro Person und Tag. Angebot: ca. 3.000 kcal pro Person und Tag.

## Hinweise
- Verbrauchsabfall (Haushalte, Gastronomie, Handel) gibt es nur als Gesamtwert pro Land, nicht nach Produktgruppe.
- Bei Fleisch und Eiern ist der EAT-Lancet-Wert ein Zielwert mit Spanne ab 0 g, also kein zwingender Mindestbedarf. Der Bedarf an Eiweiß lässt sich auch anders decken.
- Leere Bedarfs-Felder (Knollen, Hülsenfrüchte, Ölsaaten, Zuckerpflanzen): Dafür habe ich keine geprüfte Empfehlung gefunden.
- Die Bedarfswerte sind Orientierung. WHO: mindestens 400 g Obst und Gemüse pro Tag. EAT-Lancet: Referenzdiät mit 2.503 kcal, Werte für Gemüse 300 g, Vollkorn 232 g, Milch 250 g pro Tag (nur über Suchergebnisse geprüft, nicht im Original).
- "Verfügbar" ist die Menge im Handel, mit nicht essbaren Teilen. Der Vergleich mit dem Bedarf ist daher grob.
- Verlust (%) = Verluste geteilt durch Produktion.

# Teil 2: Alle Daten in deinen Downloads

Relevanz: ★ = Kern für die Frage · ○ = nützlich als Ergänzung · – = für diese Frage nicht relevant

| Thema | Datensätze (FAOSTAT, falls nicht anders genannt) | Relevanz |
|---|---|---|
| Verluste, Angebot, Kalorien | FoodBalanceSheets (2010–2023), FoodBalanceSheetsHistoric (älter), SUA Crops Livestock, Supply Utilization Accounts | ★ |
| Hunger und Ernährungsunsicherheit | Food Security Data, Indikatoren aus Haushaltsumfragen | ★ |
| Bevölkerung | Population (Einwohner pro Land) | ★ |
| Verlustprozente je Lieferkettenstufe | `Data.csv` (FAO Food Loss and Waste Database, 31.465 Zeilen) | ○ |
| Konsumabfall pro Kopf | `Food_Waste_Consumer/` (UNEP, via OWID), `food_waste_index_report_2024.pdf` | ★ |
| Kosten gesunder Ernährung | Cost and Affordability of a Healthy Diet | ○ |
| Ernährung und Ernährungsgewohnheiten | Food and Diet (Individual Dietary Data, Household Surveys, MDD-W) | ○ |
| Produktion | Production Crops Livestock, Production Indices, Value of Production | ○ |
| Preise | Prices, PricesArchive, Consumer Price Indices, Deflators, Exchange rate | ○ |
| Handel | Trade Crops Livestock, Detailed Trade Matrix, Trade Indices, Food Aid Shipments WFP | ○ |
| Umwelt und Klima | Emissions (Totals, Crops, Livestock, Agriculture Energy, Land Use, Pre/Post Production), Environment (Temperature Change, Land Use und Cover, Pesticides, Nutrient Budgets, Bioenergy, Manure, Livestock Patterns), Climate Change Indicators | ○ |
| Abfallentsorgung | Environment Food Waste Disposal (Emissionen durch Abfallentsorgung, nicht Mengen) | – |
| Landwirtschaftliche Betriebsmittel | Fertilizers (Nutrient, Product, Trade), Pesticides (Use, Trade), Land Use, Investment Machinery | – |
| Wirtschaft und Investitionen | Macro-Statistics, Investment (Capital Stock, Credit, FDI, Government), Development Assistance, Employment, Rural Livelihoods | – |
| Forstwirtschaft | Forestry, Forestry Trade Flows, Forestry Pulp and Paper | – |
| Sonstiges | ASTI (Forschung), Gender-Indikatoren, World Census Agriculture, SDG Bulk Downloads, Value Shares Industry | – |
