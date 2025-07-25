export interface FetchCallMatch {
  content: string;
  index: number;
  fullMatch: string;
}

export interface JsonStringifyMatch {
  index: number;
  length: number;
}

export const SUPPORTED_LANGUAGES = [
  "javascript",
  "typescript",
  "javascriptreact",
  "typescriptreact",
];

export function isSupportedLanguage(languageId: string): boolean {
  return SUPPORTED_LANGUAGES.includes(languageId);
}

export function findFetchCalls(text: string): FetchCallMatch[] {
  const matches: FetchCallMatch[] = [];
  const fetchPattern = /fetch\s*\(\s*[^,]+\s*,\s*\{/g;
  let match;

  while ((match = fetchPattern.exec(text)) !== null) {
    const startIndex = match.index;
    const openBraceIndex = match.index + match[0].length - 1;
    
    // Find the matching closing brace
    let braceCount = 1;
    let currentIndex = openBraceIndex + 1;
    
    while (currentIndex < text.length && braceCount > 0) {
      const char = text[currentIndex];
      if (char === '{') {
        braceCount++;
      } else if (char === '}') {
        braceCount--;
      }
      currentIndex++;
    }
    
    if (braceCount === 0) {
      const fullMatch = text.substring(startIndex, currentIndex);
      const content = text.substring(openBraceIndex + 1, currentIndex - 1);
      
      matches.push({
        content: content,
        index: startIndex,
        fullMatch: fullMatch,
      });
    }
  }

  return matches;
}

export function hasJsonStringify(fetchCallContent: string): boolean {
  return /JSON\.stringify\s*\(/.test(fetchCallContent);
}

export function hasCorrectContentType(fetchCallContent: string): boolean {
  return /['"`]content-type['"`]\s*:\s*['"`]application\/json['"`]/i.test(
    fetchCallContent
  );
}

export function findJsonStringifyPosition(
  fetchCallContent: string
): JsonStringifyMatch | null {
  const jsonStringifyMatch = /JSON\.stringify\s*\(/.exec(fetchCallContent);
  if (!jsonStringifyMatch) {
    return null;
  }

  return {
    index: jsonStringifyMatch.index,
    length: jsonStringifyMatch[0].length,
  };
}

export function calculateAbsolutePosition(
  fetchMatch: FetchCallMatch,
  jsonStringifyMatch: JsonStringifyMatch
): number {
  return (
    fetchMatch.index +
    fetchMatch.fullMatch.indexOf(fetchMatch.content) +
    jsonStringifyMatch.index
  );
}