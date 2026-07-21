type Language = "en" | "sw"

interface CacheEntry {
  text: string
  timestamp: number
}

const cache = new Map<string, CacheEntry>()
const MAX_CACHE_SIZE = 500

const SWAHILI_WORDS = new Set([
  "na",
  "ya",
  "wa",
  "ni",
  "kwa",
  "kutoka",
  "hii",
  "hiyo",
  "hizo",
  "hao",
  "hawa",
  "sisi",
  "ninyi",
  "wao",
  "yeye",
  "mimi",
  "wewe",
  "yule",
  "huyu",
  "ile",
  "hizi",
  "wale",
  "zile",
])

function getCacheKey(text: string, targetLang: Language): string {
  return `${targetLang}:${text}`
}

function setCache(key: string, value: string): void {
  if (cache.size >= MAX_CACHE_SIZE) {
    const oldest = cache.keys().next().value
    if (oldest) cache.delete(oldest)
  }
  cache.set(key, { text: value, timestamp: Date.now() })
}

function getCache(key: string): string | null {
  const entry = cache.get(key)
  if (!entry) return null
  entry.timestamp = Date.now()
  return entry.text
}

export function detectLanguage(text: string): Language {
  const words = text.toLowerCase().split(/\s+/)
  let swCount = 0
  for (const word of words) {
    if (SWAHILI_WORDS.has(word)) {
      swCount++
    }
  }
  const threshold = Math.min(words.length * 0.2, 3)
  return swCount >= threshold ? "sw" : "en"
}

export async function translateText(
  text: string,
  targetLang: Language
): Promise<string> {
  if (!text.trim()) return text

  const sourceLang = detectLanguage(text)
  if (sourceLang === targetLang) return text

  const cacheKey = getCacheKey(text, targetLang)
  const cached = getCache(cacheKey)
  if (cached) return cached

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Translation failed: ${response.status}`)

    const data = await response.json()
    const translated = data[0]
      .map((item: [string, ...unknown[]]) => item[0])
      .join("")

    if (translated) {
      setCache(cacheKey, translated)
      return translated
    }
    return text
  } catch {
    return text
  }
}

export async function batchTranslate(
  texts: string[],
  targetLang: Language
): Promise<string[]> {
  return Promise.all(texts.map((text) => translateText(text, targetLang)))
}
