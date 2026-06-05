from pathlib import Path
import re
root = Path('src')
files = list(root.rglob('*.jsx'))
modified = 0
for path in files:
    text = path.read_text(encoding='utf-8')
    new = text.replace('import React, {', 'import {')
    new = new.replace("import React from 'react'\n", '')
    new = new.replace('import React from "react"\n', '')
    if new != text:
        path.write_text(new, encoding='utf-8')
        modified += 1
print(f'Processed {len(files)} files, modified {modified} files.')
