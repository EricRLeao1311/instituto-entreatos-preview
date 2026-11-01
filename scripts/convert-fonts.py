"""Optional maintenance tool: pip install 'fonttools[woff]'. Build needs only Node.

Keep complete fonts (including accents, hinting and layout), never subset them.
Validate every glyph outline and advance before updating the local stylesheets.
"""
from pathlib import Path
from io import BytesIO
import hashlib
import json
import re
from fontTools.ttLib import TTFont
from fontTools.pens.recordingPen import RecordingPen

ROOT = Path(__file__).resolve().parent.parent
records = []
replacements = {}
for source in sorted((ROOT / 'public/assets').glob('*')):
    if source.suffix not in ('.ttf', '.otf'):
        continue
    original = TTFont(source, recalcTimestamp=False)
    original.flavor = 'woff2'
    buffer = BytesIO()
    original.save(buffer)
    data = buffer.getvalue()
    converted = TTFont(BytesIO(data), recalcTimestamp=False)
    assert original.getBestCmap() == converted.getBestCmap(), source.name
    assert original['hmtx'].metrics == converted['hmtx'].metrics, source.name
    first, second = original.getGlyphSet(), converted.getGlyphSet()
    for glyph in first.keys():
        a, b = RecordingPen(), RecordingPen()
        first[glyph].draw(a)
        second[glyph].draw(b)
        assert a.value == b.value, (source.name, glyph)
    for tag in ('GPOS', 'GSUB', 'GDEF', 'fvar', 'gvar', 'HVAR', 'MVAR', 'OS/2', 'hhea', 'cvt ', 'fpgm', 'prep'):
        if tag in original:
            assert original.getTableData(tag) == converted.getTableData(tag), (source.name, tag)
    target = source.with_name(source.stem + '-' + hashlib.sha256(data).hexdigest()[:10] + '.woff2')
    target.write_bytes(data)
    replacements[source.name] = target.name
    records.append({'source': source.name, 'target': target.name, 'before': source.stat().st_size,
                    'after': len(data), 'sha256': hashlib.sha256(data).hexdigest(),
                    'glyphs': len(first), 'outlinesAndMetricsVerified': True})

for css in (ROOT / 'src/styles').glob('*.css'):
    text = css.read_text(encoding='utf-8')
    for old, new in replacements.items():
        text = re.sub(r'url\(([^)]*)' + re.escape(old) + r'([^)]*)\)\s*format\(["\'](?:truetype|opentype)["\']\)',
                      lambda m: 'url(' + m[1] + new + m[2] + ') format("woff2")', text)
    css.write_text(text, encoding='utf-8')
(ROOT / 'docs/reference/font-optimization.json').write_text(json.dumps(records, indent=2), encoding='utf-8')
print(json.dumps({'fonts': len(records), 'before': sum(x['before'] for x in records),
                  'after': sum(x['after'] for x in records)}, indent=2))
