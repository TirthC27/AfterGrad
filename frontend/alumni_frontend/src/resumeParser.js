/**
 * Resume Skill Extractor (Browser)
 * Upload PDF/DOCX → Extract text → Match skills from fixed list.
 * No AI, no dummy data — real extraction.
 * Libraries loaded on-demand via dynamic import for code splitting.
 */

// ═══════════════════════════════════════════════
// Skills dictionary — same as backend resume_api.py
// ═══════════════════════════════════════════════
const SKILLS = [
  "python", "java", "c", "c++", "c#", "kotlin", "rust", "go", "swift",
  "javascript", "typescript", "ruby", "php", "scala", "perl", "r",
  "html", "css", "sass", "tailwind",
  "django", "flask", "fastapi", "react", "angular", "vue",
  "node", "express", "next.js", "spring", "laravel", "rails",
  "mysql", "postgresql", "mongodb", "redis", "sqlite", "oracle",
  "docker", "kubernetes", "aws", "azure", "gcp",
  "git", "linux", "bash", "powershell",
  "rest", "graphql", "grpc",
  "tensorflow", "pytorch", "pandas", "numpy", "scikit-learn",
  "figma", "photoshop", "illustrator",
  "jira", "confluence", "slack",
  "agile", "scrum", "ci/cd", "devops",
  "machine learning", "deep learning", "data analysis",
  "excel", "power bi", "tableau",
  "selenium", "jest", "pytest",
]

// ═══════════════════════════════════════════════
// Name extraction — first few lines, 2-4 capitalized words
// ═══════════════════════════════════════════════
const NAME_PATTERNS = /^([A-Z][a-z]+(?:\s[A-Z][a-z]+){1,3})\s*$/

function extractName(text) {
  const lines = text.trim().split('\n')
  for (const raw of lines.slice(0, 8)) {
    const line = raw.trim()
    if (!line || line.length < 3 || line.length > 60) continue
    if (line.includes('@') || line.startsWith('http') || /^\d/.test(line)) continue
    const words = line.split(/\s+/)
    if (words.length >= 2 && words.length <= 4 && words.every(w => w[0] && w[0] === w[0].toUpperCase())) {
      return line
    }
  }
  return null
}

// ═══════════════════════════════════════════════
// Skill matching
// ═══════════════════════════════════════════════
function extractSkills(text) {
  const lower = text.toLowerCase()
  const found = []
  for (const skill of SKILLS) {
    if (lower.includes(skill)) {
      found.push(skill)
    }
  }
  return [...new Set(found)].sort()
}

// ═══════════════════════════════════════════════
// Experience extraction
// ═══════════════════════════════════════════════
const EXP_KEYWORDS = ["experience", "work history", "employment", "professional experience", "work experience", "career history"]

function extractExperience(text) {
  const lines = text.split('\n')
  const parts = []
  let inExp = false

  for (const line of lines) {
    const lower = line.trim().toLowerCase()
    if (EXP_KEYWORDS.some(kw => lower.includes(kw))) {
      inExp = true
      continue
    }
    if (inExp) {
      if (line.trim() && line.trim().length > 10) parts.push(line.trim())
      if (parts.length >= 5) break
      if (line.trim() && line.trim() === line.trim().toUpperCase() && line.trim().length < 40) break
    }
  }
  return parts.slice(0, 5).join(' | ')
}

// ═══════════════════════════════════════════════
// Passout year extraction
// ═══════════════════════════════════════════════
const YEAR_RE = /20\d{2}/g
const PASSOUT_KW = ["graduation", "passout", "batch of", "class of", "graduated"]

function extractPassoutYear(text) {
  const lower = text.toLowerCase()
  for (const kw of PASSOUT_KW) {
    const idx = lower.indexOf(kw)
    if (idx !== -1) {
      const snippet = text.slice(idx, idx + 50)
      const m = snippet.match(/20\d{2}/)
      if (m) {
        const yr = parseInt(m[0])
        if (yr >= 2000 && yr <= 2030) return yr
      }
    }
  }
  const eduIdx = lower.indexOf('education')
  if (eduIdx !== -1) {
    const snippet = text.slice(eduIdx, eduIdx + 300)
    const years = [...snippet.matchAll(YEAR_RE)].map(m => parseInt(m[0])).filter(y => y >= 2000 && y <= 2030)
    if (years.length) return Math.max(...years)
  }
  return null
}

// ═══════════════════════════════════════════════
// PDF text extraction (pdfjs-dist — loaded on demand)
// ═══════════════════════════════════════════════
async function readPdf(file) {
  const pdfjsLib = await import('pdfjs-dist')
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url
  ).toString()

  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  let text = ''
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    text += content.items.map(item => item.str).join(' ') + '\n'
  }
  return text
}

// ═══════════════════════════════════════════════
// DOCX text extraction (mammoth — loaded on demand)
// ═══════════════════════════════════════════════
async function readDocx(file) {
  const mammoth = await import('mammoth')
  const arrayBuffer = await file.arrayBuffer()
  const result = await mammoth.extractRawText({ arrayBuffer })
  return result.value
}

// ═══════════════════════════════════════════════
// Main: parse resume file → return extracted data
// ═══════════════════════════════════════════════
export async function parseResume(file) {
  const name = file.name.toLowerCase()

  let text = ''
  if (name.endsWith('.pdf')) {
    text = await readPdf(file)
  } else if (name.endsWith('.docx')) {
    text = await readDocx(file)
  } else {
    throw new Error('Unsupported file type. Use PDF or DOCX.')
  }

  if (!text || text.trim().length < 20) {
    throw new Error('Could not extract text from resume. File might be image-based.')
  }

  const skills = extractSkills(text)
  const extractedName = extractName(text)
  const experience = extractExperience(text)
  const passoutYear = extractPassoutYear(text)

  return {
    name: extractedName,
    skills,
    skills_count: skills.length,
    experience_summary: experience || '',
    passout_year: passoutYear,
    raw_text_length: text.length,
  }
}
