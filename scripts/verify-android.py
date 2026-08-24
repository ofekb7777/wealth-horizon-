"""
אימות סטטי לפרויקט האנדרואיד.

הרצה:  npm run verify:android

**זו לא בנייה.** בנייה אמיתית דורשת Android SDK. הסקריפט הזה תופס את
קבוצת השגיאות הנפוצה ביותר — XML שבור והפניה למשאב שלא קיים — שאחרת
היו מתגלות רק אחרי כמה דקות של Gradle.

בודק שני דברים שאפשר לבדוק בלי Android SDK:
  1. כל קובץ XML תקין תחבירית
  2. כל הפניה ל-R.xxx.yyy בקוד ה-Java באמת קיימת במשאבים
"""
import re, sys, pathlib, xml.etree.ElementTree as ET

ROOT = pathlib.Path('android/app/src/main')
RES = ROOT / 'res'
ok, bad = 0, []

# --- 1. תקינות XML ---
for f in sorted(list(RES.rglob('*.xml')) + [ROOT / 'AndroidManifest.xml']):
    try:
        ET.parse(f); ok += 1
    except ET.ParseError as e:
        bad.append(f"XML שבור: {f} — {e}")

print(f"✓ {ok} קבצי XML תקינים" if not bad else "")

# --- 2. איסוף המשאבים שקיימים ---
defined = {'id': set(), 'string': set(), 'color': set(), 'layout': set(), 'drawable': set(), 'xml': set()}

for f in RES.rglob('*.xml'):
    kind = f.parent.name.split('-')[0]
    if kind in ('layout', 'drawable', 'xml'):
        defined[kind].add(f.stem)
    # מזהי View מוגדרים עם @+id/
    text = f.read_text(encoding='utf-8')
    for m in re.finditer(r'@\+id/(\w+)', text):
        defined['id'].add(m.group(1))
    if kind == 'values':
        try:
            for el in ET.parse(f).getroot():
                if el.tag in ('string', 'color'):
                    defined[el.tag].add(el.get('name'))
        except ET.ParseError:
            pass

for f in (RES / 'drawable').glob('*'):
    defined['drawable'].add(f.stem)

# --- 3. הפניות מקוד Java ---
used = []
for f in ROOT.rglob('*.java'):
    for m in re.finditer(r'\bR\.(\w+)\.(\w+)', f.read_text(encoding='utf-8')):
        used.append((m.group(1), m.group(2), f.name))

# --- 4. הפניות בין קבצי XML ---
for f in RES.rglob('*.xml'):
    for m in re.finditer(r'@(layout|drawable|string|color|xml)/(\w+)', f.read_text(encoding='utf-8')):
        used.append((m.group(1), m.group(2), f.name))
for m in re.finditer(r'@(layout|drawable|string|color|xml)/(\w+)', (ROOT / 'AndroidManifest.xml').read_text(encoding='utf-8')):
    used.append((m.group(1), m.group(2), 'AndroidManifest.xml'))

missing = []
checked = 0
for kind, name, where in used:
    if kind not in defined:
        continue  # mipmap, android:, וכו'
    checked += 1
    if name not in defined[kind]:
        missing.append(f"חסר: R.{kind}.{name}  (מופנה מ-{where})")

for m in sorted(set(missing)):
    bad.append(m)

print(f"✓ {checked} הפניות למשאבים נבדקו")
for kind in ('layout', 'drawable', 'xml', 'string', 'color', 'id'):
    print(f"   {kind}: {len(defined[kind])} מוגדרים")

# --- 5. בדיקה מבנית בסיסית ל-Java ---
java_checked = 0
for f in ROOT.rglob('*.java'):
    src = f.read_text(encoding='utf-8')
    java_checked += 1
    if src.count('{') != src.count('}'):
        bad.append(f"סוגריים לא מאוזנים: {f.name}")
    if not re.search(rf'\b(class|interface|enum)\s+{re.escape(f.stem)}\b', src):
        bad.append(f"שם המחלקה לא תואם לשם הקובץ: {f.name}")
    if not re.match(r'package\s+[\w.]+;', src.strip()):
        bad.append(f"חסרה הצהרת package: {f.name}")
print(f"\u2713 {java_checked} קבצי Java נבדקו מבנית")

if bad:
    print("\n--- בעיות ---")
    for b in sorted(set(bad)):
        print(" ✗", b)
    sys.exit(1)
print("\n✓ הכל מתאים")
