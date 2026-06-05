const fs = require('fs')
const path = require('path')

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...walk(full))
    } else if (entry.isFile() && full.endsWith('.jsx')) {
      files.push(full)
    }
  }
  return files
}

const files = walk(path.join(process.cwd(), 'src'))
let changed = 0
for (const file of files) {
  let text = fs.readFileSync(file, 'utf8')
  const original = text

  const reactImportRe = /^import\s+React(?:\s*,\s*\{([^}]*)\})?\s+from\s+['"]react['"];?/m
  const reactNamedImportRe = /^import\s*\{([^}]*)\}\s*from\s*['"]react['"];?/m
  const lucideImportRe = /^import\s*\{([^}]*)\}\s*from\s*['"]lucide-react['"];?/m

  const hasReactUsage = /\bReact\./.test(text)
  const hasFragmentUsage = /\bReact\.Fragment\b/.test(text)
  const hasNowHelper = /\bfunction\s+now\s*\(|\bconst\s+now\s*=/.test(text)

  if (hasFragmentUsage && !hasReactUsage) {
    text = text.replace(/\bReact\.Fragment\b/g, 'Fragment')
  }

  if (reactImportRe.test(text)) {
    text = text.replace(reactImportRe, (match, named) => {
      const names = named ? named.split(',').map(s => s.trim()).filter(Boolean) : []
      if (hasFragmentUsage && !names.includes('Fragment')) {
        names.unshift('Fragment')
      }
      if (names.length === 0 && !hasReactUsage) {
        return ''
      }
      return `import { ${names.join(', ')} } from 'react'`
    })
  }

  if (!reactImportRe.test(text) && hasReactUsage && !/import\s*\{[^}]*\bFragment\b[^}]*\}\s*from\s*['"]react['"]/.test(text)) {
    if (hasFragmentUsage) {
      if (reactNamedImportRe.test(text)) {
        text = text.replace(reactNamedImportRe, (match, names) => {
          const imports = names.split(',').map(s => s.trim()).filter(Boolean)
          if (!imports.includes('Fragment')) imports.unshift('Fragment')
          return `import { ${imports.join(', ')} } from 'react'`
        })
      } else {
        text = `import { Fragment } from 'react'\n` + text
      }
    }
  }

  if (lucideImportRe.test(text)) {
    text = text.replace(lucideImportRe, (match, names) => {
      const imported = names.split(',').map(s => s.trim()).filter(Boolean)
      const used = imported.filter(name => new RegExp('\\b' + name + '\\b').test(text))
      if (used.length === 0) return ''
      return `import { ${used.join(', ')} } from 'lucide-react'`
    })
  }

  if (/\bDate\.now\(\)/.test(text) && !hasNowHelper) {
    const importEnd = text.match(/^(import[\s\S]*?\n)(?!import)/m)
    const helper = 'const now = () => Date.now();\n\n'
    if (importEnd) {
      text = text.replace(importEnd[0], importEnd[0] + helper)
    } else {
      text = helper + text
    }
    text = text.replace(/\bDate\.now\(\)/g, 'now()')
  }

  if (text !== original) {
    fs.writeFileSync(file, text, 'utf8')
    changed++
  }
}
console.log('Processed files:', files.length, 'Changed:', changed)
