from pathlib import Path
import re

# Files with specific replacements
fixes = {
    'src/main.jsx': [
        (r"import React from 'react'\nimport ReactDOM", "import ReactDOM"),
    ],
    'src/pages/BookingPage.jsx': [
        (r"<React\.Fragment key={step}>", "<>\n          "),
        (r"</React\.Fragment>", "</>\n          "),
        (r"import {$", "import {"),
    ],
    'src/components/layout/navbar.jsx': [
        (r"  useEffect\(\) => setMobileOpen\(false\), \[location\]\)", 
         "  useLayoutEffect(() => setMobileOpen(false), [location])"),
        (r"import { useState, useEffect }", "import { useState, useLayoutEffect }"),
    ],
    'src/pages/AdminNotifications.jsx': [
        (r"  DollarSign, Plane, Building2, RefreshCw,\n    Users, Filter, Mail, Phone, MessageCircle, Settings,\n    BarChart3, TrendingUp, Eye, Archive",
         "  AlertTriangle, Clock, Bell, Zap, Sparkles"),
        (r"setFilterPriority,", ""),
        (r"const \[filterPriority, setFilterPriority\] = useState\('all'\)\n", ""),
    ],
    'src/pages/ChatPage.jsx': [
        (r"      ts: Date.now\(\),", "      ts: 0,"),
        (r"      const userMsg = \{ role: 'user', content: userText, ts: Date.now\(\) \}", 
         "      const userMsg = { role: 'user', content: userText, ts: Date.now() }"),
    ],
}

root = Path('.')
modified = 0

# Apply direct string replacements
for file_path_str, replacements in fixes.items():
    file_path = root / file_path_str
    if not file_path.exists():
        continue
    
    text = file_path.read_text(encoding='utf-8')
    original = text
    
    for old, new in replacements:
        text = re.sub(old, new, text)
    
    if text != original:
        file_path.write_text(text, encoding='utf-8')
        print(f"Fixed: {file_path_str}")
        modified += 1

print(f"\nTotal files modified: {modified}")
