import type { ContractTree, ClauseNode, DefinedTerm } from "./types";

// Namespaces
const W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
const PKG_NS = "http://schemas.microsoft.com/office/2006/xmlPackage";

// ============================================================================
//                                HELPERS
// ============================================================================

function getChildNS(el: Element, ns: string, tag: string): Element | null {
  const list = el.getElementsByTagNameNS(ns, tag);
  return list.length ? list[0] : null;
}

function getParagraphStyle(p: Element): string | null {
  const pPr = getChildNS(p, W_NS, "pPr");
  if (!pPr) return null;
  const pStyle = getChildNS(pPr, W_NS, "pStyle");
  return pStyle?.getAttributeNS(W_NS, "val") ?? null;
}

// Track Changes — skip deleted or moved-from
function isDeleted(element: Element): boolean {
  let curr: Element | null = element;
  while (curr && curr.localName !== "p" && curr.localName !== "body") {
    const tag = curr.localName;
    if (tag === "del" || tag === "moveFrom") return true;
    curr = curr.parentElement;
  }
  return false;
}

// ============================================================================
//                          PARAGRAPH TEXT EXTRACTION
// ============================================================================

function getParagraphText(p: Element): string {
  console.log("\n[getParagraphText] ----------------------------------");

  let text = "";
  const runs = Array.from(p.getElementsByTagNameNS(W_NS, "r"));
  console.log("  total runs:", runs.length);

  const runToText = (run: Element): string => {
    if (isDeleted(run)) {
      console.log("    SKIP run (deleted)");
      return "";
    }

    const rPr = getChildNS(run, W_NS, "rPr");
    if (rPr) {
      if (rPr.getElementsByTagNameNS(W_NS, "strike").length > 0) {
        console.log("    SKIP run (strikethrough)");
        return "";
      }
      if (rPr.getElementsByTagNameNS(W_NS, "vanish").length > 0) {
        console.log("    SKIP run (vanished)");
        return "";
      }

      // NEW: detect DeletedText style
      const rStyle = rPr.getElementsByTagNameNS(W_NS, "rStyle")[0];
      if (rStyle) {
        const styleVal =
          rStyle.getAttributeNS(W_NS, "val") ||
          rStyle.getAttribute("w:val") ||
          rStyle.getAttribute("val");

        if (styleVal && /deletedtext/i.test(styleVal)) {
          console.log("    SKIP run (DeletedText style)");
          return "";
        }
      }
    }

    // Detect deleted runs via <w:rStyle w:val="DeletedText">
    if (rPr) {
      const rStyle = rPr.getElementsByTagNameNS(W_NS, "rStyle")[0];
      if (rStyle) {
        const styleVal =
          rStyle.getAttributeNS(W_NS, "val") ||
          rStyle.getAttribute("w:val") ||
          rStyle.getAttribute("val");

        if (styleVal && /deletedtext/i.test(styleVal)) {
          console.log("    SKIP run (DeletedText style)");
          return "";
        }
      }
    }

    let txt = "";
    for (const node of Array.from(run.childNodes) as Element[]) {
      if (node.localName === "t") txt += node.textContent ?? "";
      else if (node.localName === "br") txt += " ";
      else if (node.localName === "tab") txt += " ";
    }

    console.log("    run text:", JSON.stringify(txt));
    return txt;
  };

  let prevRunText = "";
  for (const run of runs) {
    const rText = runToText(run);
    if (!rText) continue;

    const prevLast = prevRunText.trimEnd().slice(-1) || "";
    const currFirst = rText.trimStart().slice(0, 1) || "";

    const isWhitespace = (ch: string) => /\s/.test(ch);
    const isClosingPunct = (ch: string) => /[.,;:!?')\]\}]/.test(ch);
    const isOpeningPunct = (ch: string) => /[(\[\{"'“”'‘]/.test(ch);

    if (
      prevLast &&
      currFirst &&
      !isWhitespace(prevLast) &&
      !isWhitespace(currFirst) &&
      !isClosingPunct(currFirst) &&
      !isOpeningPunct(prevLast)
    ) {
      text += " ";
    }

    text += rText;
    prevRunText = rText;
  }

  console.log("  combined raw:", JSON.stringify(text));

  text = text.replace(
    /\b((?:[A-Za-z0-9'’\-&]+(?:\s+|$)){2,6})\1\b/gi,
    (m, g1) => g1.trim()
  );

  console.log("  normalized:", JSON.stringify(text.trim()));
  return text.trim();
}

// ============================================================================
//                     NUMBERING + CLAUSE DETECTION HELPERS
// ============================================================================

function getNumberingLevel(p: Element): string | null {
  const pPr = getChildNS(p, W_NS, "pPr");
  if (!pPr) return null;
  const numPr = getChildNS(pPr, W_NS, "numPr");
  if (!numPr) return null;
  const ilvl = getChildNS(numPr, W_NS, "ilvl");
  return ilvl?.getAttributeNS(W_NS, "val") ?? null;
}

// ============================================================================
//                              TERM NORMALIZER
// ============================================================================

function normalizeTerm(raw: string): string | null {
  console.log("[normalizeTerm] raw =", JSON.stringify(raw));

  let term = raw.replace(/^['"“”'‘\s]+|['"“”'‘\s]+$/g, "").trim();
  console.log("  stripped =", term);

  if (/^\[.*\]$/.test(raw.trim())) {
    console.log("  → rejected: placeholder");
    return null;
  }
  if (term.length < 2 || term.length > 100) {
    console.log("  → rejected: bad length");
    return null;
  }

  const lower = term.toLowerCase();
  const stopWords = new Set([
    "the",
    "a",
    "an",
    "this",
    "that",
    "it",
    "any",
    "all",
    "in",
    "and",
    "or",
    "of",
    "for",
    "to",
  ]);
  if (stopWords.has(lower)) {
    console.log("  → rejected: stopword");
    return null;
  }

  const titleCasePattern =
    /^([A-Z][a-zA-Z0-9'’\-\&]+)(?:\s+[A-Z][a-zA-Z0-9'’\-\&]+){0,3}$/;
  const acronymPattern = /^[A-Z]{2,}(?:\s+[A-Z]{2,}){0,3}$/;

  if (!titleCasePattern.test(term) && !acronymPattern.test(term)) {
    console.log("  → rejected: not titlecase or acronym");
    return null;
  }

  console.log("  → ACCEPTED:", term);
  return term;
}

// ============================================================================
//                        DEFINED TERM EXTRACTION
// ============================================================================

function extractDefinedTerms(
  p: Element,
  currentClause: ClauseNode | null,
  definedTerms: Record<string, DefinedTerm>
) {
  console.log("\n[extractDefinedTerms] ================================");

  const fullText = getParagraphText(p);
  console.log("  paragraph =", JSON.stringify(fullText));

  if (!fullText) {
    console.log("  → skip empty paragraph");
    return;
  }

  const style = getParagraphStyle(p);
  console.log("  style =", style);

  const banned = [
    "title",
    "heading",
    "heading1",
    "heading2",
    "listparagraph",
    "listnumber",
  ];
  if (style && banned.includes(style.toLowerCase())) {
    console.log("  → skip banned style");
    return;
  }

  // Parenthetical
  console.log("  -- Parenthetical definitions --");
  const parenRe = /\(\s*(?:the\s+)?["“”]([^"“”]+)["“”]\s*\)/gi;
  let match;
  while ((match = parenRe.exec(fullText)) !== null) {
    console.log("    found parenthetical:", match[0], "→", match[1]);
    const term = normalizeTerm(match[1]);
    if (!term) continue;
    definedTerms[term] = {
      definedAt: currentClause ? currentClause.number : "",
      text: fullText.trim(),
    };
  }

  // Means-based
  console.log("  -- Means-based definitions --");
  const meansRe =
    /["“”]([^"“”]+)["“”]\s+(means|shall mean|is defined as|refers to)\b/gi;
  while ((match = meansRe.exec(fullText)) !== null) {
    console.log("    found means:", match[0], "→", match[1]);
    const term = normalizeTerm(match[1]);
    if (!term) continue;
    definedTerms[term] = {
      definedAt: currentClause ? currentClause.number : "",
      text: fullText.trim(),
    };
  }

  const inDefinitions =
    (currentClause && /defin/i.test(currentClause.text)) ||
    /\bdefinition(s)? of\b/i.test(fullText);

  console.log("  -- Bold-based definitions --");
  console.log("    inDefinitions =", inDefinitions);

  if (!inDefinitions) {
    console.log("    → skip bold-based");
    return;
  }

  const runs = Array.from(p.getElementsByTagNameNS(W_NS, "r"));

  const runText = (r: Element): string => {
    let t = "";
    for (const n of Array.from(r.childNodes) as Element[]) {
      if (n.localName === "t") t += n.textContent ?? "";
    }
    return t.trim();
  };

  const isBold = (r: Element) => {
    const rPr = getChildNS(r, W_NS, "rPr");
    if (!rPr) return false;
    return (
      rPr.getElementsByTagNameNS(W_NS, "b").length > 0 ||
      getChildNS(rPr, W_NS, "bCs") !== null
    );
  };

  for (let i = 0; i < runs.length; i++) {
    if (!isBold(runs[i])) continue;

    console.log("    bold run:", JSON.stringify(runText(runs[i])));

    let j = i;
    let bold = "";
    while (j < runs.length && isBold(runs[j])) {
      const piece = runText(runs[j]);
      bold += (bold ? " " : "") + piece;
      j++;
    }

    console.log("      candidate =", bold);

    const term = normalizeTerm(bold);
    if (!term) {
      i = j - 1;
      continue;
    }

    const ahead = (runText(runs[j]) + " " + runText(runs[j + 1])).toLowerCase();
    console.log("      lookAhead =", JSON.stringify(ahead));

    if (/\b(means|shall mean|is defined as|refers to)\b/.test(ahead)) {
      console.log("      → ACCEPTED:", term);
      definedTerms[term] = {
        definedAt: currentClause ? currentClause.number : "",
        text: fullText.trim(),
      };
    } else {
      console.log("      → rejected: missing definitional verb");
    }

    i = j - 1;
  }
}

function extractParties(paragraphs: Element[]): string[] {
  console.log("\n[PARTY EXTRACTION MODULE] ==================================");

  const parties: string[] = [];
  const fullText = paragraphs.map(getParagraphText).join("\n");
  const introText = paragraphs.slice(0, 12).map(getParagraphText).join("\n");
  const signatureText = fullText.split(/IN WITNESS WHEREOF/i)[1] || "";

  console.log("introText =", JSON.stringify(introText));

  // ============================================================
  // PASS 1 — ROLE-LABELED FORMAT  (most common in NDAs, SaaS, MSAs)
  // ============================================================
  console.log("\n[PASS 1] Labeled roles");

  const roleRegex =
    /^(Disclosing Party|Receiving Party|Client|Customer|Contractor|Consultant|Vendor|Licensor|Licensee|Buyer|Seller|Service Provider|Company|Employer|Employee):\s*(.+)$/gim;

  let match;
  while ((match = roleRegex.exec(fullText)) !== null) {
    const role = match[1].trim();
    const name = match[2].trim();
    if (name.length < 200) {
      console.log(`  FOUND role: ${role} → ${name}`);
      parties.push(name);
    }
  }

  if (parties.length >= 2) {
    console.log(" → PASS 1 SUCCESS");
    return parties.slice(0, 2);
  }

  // ============================================================
  // PASS 2 — MULTILINE “between X and Y”
  // ============================================================
  console.log("\n[PASS 2] Multiline intro between X and Y");

  const betweenRegex =
    /between\s+([\s\S]+?)\s+(?:and|&)\s+([\s\S]+?)(?=[.:;]| who| which| that|$)/i;

  const bMatch = betweenRegex.exec(introText);
  if (bMatch) {
    const p1 = bMatch[1].replace(/[\n\r]+/g, " ").trim();
    const p2 = bMatch[2].replace(/[\n\r]+/g, " ").trim();

    console.log("  BETWEEN match p1 =", p1);
    console.log("  BETWEEN match p2 =", p2);

    if (p1.length < 200) parties.push(p1);
    if (p2.length < 200) parties.push(p2);

    if (parties.length >= 2) {
      console.log(" → PASS 2 SUCCESS");
      return parties.slice(0, 2);
    }
  }

  // ============================================================
  // PASS 3 — SIGNATURE BLOCKS (contracts with long intros)
  // ============================================================
  console.log("\n[PASS 3] Signature block");

  const sigRegex = /^[A-Z][A-Z0-9 .,&()-]{3,}$/gm;

  const sigCandidates = Array.from(signatureText.matchAll(sigRegex))
    .map((m) => m[0].trim())
    .filter(
      (s) => s.length > 3 && !/IN WITNESS WHEREOF|SIGNED|SIGNATURE|BY:/i.test(s)
    );

  sigCandidates.forEach((s) => console.log("  sig candidate:", s));

  if (sigCandidates.length >= 2) {
    console.log(" → PASS 3 SUCCESS");
    return sigCandidates.slice(0, 2);
  }

  // ============================================================
  // PASS 4 — Capitalized Entity Extraction (NER-like fallback)
  // ============================================================
  console.log("\n[PASS 4] Capitalized entity scan");

  const capRegex = /\b([A-Z][A-Za-z0-9&(),.'\- ]{3,})\b/g;

  const candidates = Array.from(introText.matchAll(capRegex))
    .map((m) => m[1].trim())
    .filter(
      (name) =>
        name.length > 3 &&
        !/This Agreement|Non-Disclosure Agreement|Redlined|Draft|Parties|Agreement|Effective Date/i.test(
          name
        )
    );

  candidates.forEach((c) => console.log("  cap candidate:", c));

  // Pick first 2 longest unique names
  const unique = [...new Set(candidates)].sort((a, b) => b.length - a.length);
  if (unique.length >= 2) {
    console.log(" → PASS 4 SUCCESS");
    return unique.slice(0, 2);
  }

  console.log(" → No parties found in any pass");
  return [];
}

// ============================================================================
//                                 MAIN
// ============================================================================

export function extractContract(ooxml: string): ContractTree {
  console.log("\n====================================================");
  console.log("[extractContract] START");
  console.log("====================================================");

  const parser = new DOMParser();
  const doc = parser.parseFromString(ooxml, "application/xml");

  const definedTerms: Record<string, DefinedTerm> = {};
  const clauses: ClauseNode[] = [];
  const references: string[] = [];

  console.log("\n[Step] Locating body…");

  let body = doc.getElementsByTagNameNS(W_NS, "body")[0];

  if (!body) {
    console.log("  Body not found — attempting Flat OPC fallback…");
    const parts = doc.getElementsByTagNameNS(PKG_NS, "part");
    for (const part of Array.from(parts)) {
      if (part.getAttribute("pkg:name") === "/word/document.xml") {
        body = part.getElementsByTagNameNS(W_NS, "body")[0];
        break;
      }
    }
  }

  if (!body) {
    console.log("  ERROR: body still not found");
    return {
      title: "Error",
      sections: [],
      definedTerms: {},
      references: [],
      parties: [],
      bookmarks: new Set(),
    };
  }

  console.log("  → Body found.");

  const paragraphs = Array.from(body.getElementsByTagNameNS(W_NS, "p"));
  console.log("Total paragraphs:", paragraphs.length);

  let currentClause: ClauseNode | null = null;
  let idx = 0;

  for (const p of paragraphs) {
    console.log("\n----------------------------------------------------");
    console.log(`[Paragraph ${idx}] -----------------------------`);

    const text = getParagraphText(p);
    const style = getParagraphStyle(p);
    const numLevel = getNumberingLevel(p);

    console.log("  text    =", JSON.stringify(text));
    console.log("  style   =", style);
    console.log("  numLvl  =", numLevel);

    const manualNumberMatch = text.match(/^(\d+(?:\.\d+)*)\.?\s+/);
    const isHeadingStyle = style && style.toLowerCase().startsWith("heading");

    if (!text.trim()) {
      console.log("  → empty paragraph, skip.");
      idx++;
      continue;
    }

    const startsNewClause =
      numLevel !== null || manualNumberMatch || isHeadingStyle;

    if (startsNewClause) {
      console.log("  → CLAUSE START detected");

      let clauseNumber = "";
      let clauseText = text;

      if (manualNumberMatch) {
        clauseNumber = manualNumberMatch[1];
        clauseText = text.substring(manualNumberMatch[0].length).trim();
      } else if (numLevel !== null) {
        clauseNumber = "Auto";
        clauseText = text.trim();
      } else if (isHeadingStyle) {
        clauseNumber = "";
        clauseText = text.trim();
      }

      if (currentClause) {
        console.log("  [CLAUSE END]", currentClause.number);
        clauses.push(currentClause);
      }

      console.log("  [CLAUSE START]");
      console.log("    number =", clauseNumber);
      console.log("    text   =", clauseText);

      currentClause = {
        number: clauseNumber,
        text: clauseText,
        start: idx,
      };
    } else if (currentClause) {
      console.log("  → extending current clause", currentClause.number);
      currentClause.text += `\n${text}`;
    }

    // Defined terms
    extractDefinedTerms(p, currentClause, definedTerms);

    // References
    const links = p.getElementsByTagNameNS(W_NS, "hyperlink");
    for (const link of Array.from(links)) {
      const anchor = link.getAttributeNS(W_NS, "anchor");
      if (anchor) {
        console.log("[REFERENCE FOUND]", anchor);
        references.push(anchor);
      }
    }

    idx++;
  }

  if (currentClause) {
    console.log("[FINAL CLAUSE END]", currentClause.number);
    clauses.push(currentClause);
  }

  // ========================================================================
  //                         PARTY EXTRACTION
  // ========================================================================

  const parties = extractParties(paragraphs);

  console.log("\n====================================================");
  console.log("                FINAL OUTPUT SUMMARY");
  console.log("====================================================");

  console.log("definedTerms:", definedTerms);
  console.log("clauses:", clauses);
  console.log("references:", references);
  console.log("parties:", parties);

  return {
    title: "Contract Analysis",
    sections: [
      {
        number: "1",
        title: "Main Document",
        clauses,
      },
    ],
    definedTerms,
    references,
    parties,
    bookmarks: new Set(),
  };
}
