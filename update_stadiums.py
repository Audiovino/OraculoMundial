import re, json

with open('C:/Proyectos/OraculoMundial/src/data/StadiumsData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

ids = {
  'Estadio Akron': '91718497a838442a8cd312c448f687e6',
  'Estadio BBVA': 'b3df2dd0520c42a18beb6cd23f8102a5',
  'Arrowhead Stadium': '8aa4ad611c594fc28a2017a50c52f5fd',
  'Mercedes-Benz Stadium': '01ae2f2bc88c4588b532fadf86ba017a',
  'AT&T Stadium': 'c8d40da56c53466e96268597464f6e09',
  'NRG Stadium': '5ca7a08bb23942829a74f3c736b8167f',
  'Hard Rock Stadium': 'f6e36e2007c6446985b545e013b6104c',
  "Levi's Stadium": '82a444fb65764299860149efd323ff0e',
  'SoFi Stadium': '05cbd1ca51f2447db23bbc031c93be2f',
  'Lumen Field': '403a31928a024f4bba49d881f3e60bdf',
  'Empower Field': '1a53cf72490f4556bab966ce15cb6ed9',
  'BMO Field': '015e0f1f2e8146b5a39910324a68b2fb',
  'BC Place': '85a7617895ca446fb2ef360773e3d451',
  'MetLife Stadium': 'd186beca276347e3ab2223fe47d9b25b',
  'Rose Bowl': '9c829976ab26454a8c5c3183baf6f948',
  'Gillette Stadium': 'a63d411b60a0486c88f8c4fc0af04594',
  'Lincoln Financial Field': '29d501110a6d493cae582a0bce56558b'
}

for name, sketchfab_id in ids.items():
    pattern = r"(name:\s*['\"]" + re.escape(name) + r"['\"].*?imageUrl:\s*['\"].*?['\"])(?!\s*,\s*sketchfabId)"
    replacement = r"\1,\n    sketchfabId: '" + sketchfab_id + r"'"
    content = re.sub(pattern, replacement, content, flags=re.DOTALL)

with open('C:/Proyectos/OraculoMundial/src/data/StadiumsData.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print('Done!')
