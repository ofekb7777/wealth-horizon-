"""מייצר R.java מהמשאבים האמיתיים, כדי שבדיקת הקומפילציה תתפוס הפניה למשאב חסר."""
import re, pathlib, os

ROOT = pathlib.Path(__file__).resolve().parent.parent
RES = ROOT / 'android/app/src/main/res'
kinds = {'id': set(), 'string': set(), 'color': set(), 'layout': set(), 'drawable': set(), 'xml': set()}

for f in RES.rglob('*.xml'):
    kind = f.parent.name.split('-')[0]
    if kind in ('layout', 'drawable', 'xml'):
        kinds[kind].add(f.stem)
    text = f.read_text(encoding='utf-8')
    for m in re.finditer(r'@\+id/(\w+)', text):
        kinds['id'].add(m.group(1))
    if kind == 'values':
        for m in re.finditer(r'<(string|color)\s+name="(\w+)"', text):
            kinds[m.group(1)].add(m.group(2))

for f in (RES / 'drawable').glob('*'):
    kinds['drawable'].add(f.stem)

lines = ['package com.ofekb.wealthhorizon;', '',
         '/** נוצר אוטומטית מהמשאבים שבפרויקט. לבדיקת קומפילציה בלבד. */',
         'public final class R {']
total = 0
for kind, names in kinds.items():
    lines.append(f'    public static final class {kind} {{')
    for i, name in enumerate(sorted(names)):
        lines.append(f'        public static final int {name} = 0x7f{ord(kind[0]):02x}{i:04x};')
        total += 1
    lines.append('    }')
lines.append('}')

dest = pathlib.Path(os.environ['WORK']) / 'stubs/com/ofekb/wealthhorizon/R.java'
dest.write_text('\n'.join(lines), encoding='utf-8')
print(f'✓ R.java נוצר עם {total} מזהי משאבים')
