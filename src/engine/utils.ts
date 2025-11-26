export function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

export function normalizeTokens(text: string): string {
  return normalizeWhitespace(text).toLowerCase();
}

export const commonRegex = {
  clauseNumber: /^(\d+(\.\d+)*)\s+/,
};

export function parseNumbering(numbering: string): number[] {
  return numbering.split(".").map(Number);
}

export function safeTrim(text: string, maxLength = 100): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength) + "...";
}

export function tokenize(text: string): string[] {
  return text.split(/\s+/);
}
