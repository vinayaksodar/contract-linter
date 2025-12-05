/// <reference types="office-js" />
// ========================================================
// SECTION 1: READING (Context Extraction)
// ========================================================

/**
 * Retrieves the document body as OOXML, cleans it of metadata noise (RSIDs),
 * and extracts just the <w:body> content to save tokens.
 * * Use this string as the context you send to the LLM.
 */
export async function getDocumentBodyOoxml(): Promise<string> {
  return Word.run(async (context) => {
    const body = context.document.body;
    const ooxmlResult = body.getOoxml();
    await context.sync();

    const rawOoxml = ooxmlResult.value;

    // 1. Extract content inside <w:body>...</w:body>
    // We only want the content, not the file-level package definitions.
    const bodyMatch = rawOoxml.match(/<w:body>(.*?)<\/w:body>/s);

    if (!bodyMatch || !bodyMatch[1]) {
      // Fallback: If regex fails, return the whole thing, though it will be verbose.
      console.warn("Could not isolate <w:body>. Returning full package.");
      return rawOoxml;
    }

    let cleanXml = bodyMatch[1];

    // 2. OPTIMIZATION: Remove RSID attributes.
    // Word adds 'w:rsidR', 'w:rsidRPr', etc., to track revision sessions.
    // These are useless to the LLM and waste token space.
    cleanXml = cleanXml.replace(/ w:rsid\w+="[^"]*"/g, "");

    return cleanXml.trim();
  });
}
// ========================================================
// SECTION 2: WRITING (Patch Application & Scrolling)
// ========================================================

/**
 * Wraps a raw XML fragment in the necessary namespaces.
 */
function wrapOoxmlFragment(fragment: string): string {
  if (fragment.trim().startsWith("<?xml")) return fragment;

  return `
    <pkg:package xmlns:pkg="http://schemas.microsoft.com/office/2006/xmlPackage">
      <pkg:part pkg:name="/_xml/word.xml" pkg:contentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml">
        <pkg:xmlData>
          <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" >
            <w:body>
              ${fragment}
            </w:body>
          </w:document>
        </pkg:xmlData>
      </pkg:part>
    </pkg:package>
  `.trim();
}

/**
 * Helper: Scrolls the view to a specific range.
 */
async function scrollAndSelect(
  range: Word.Range,
  context: Word.RequestContext
) {
  // .select() puts the cursor there and scrolls the viewport to it
  range.select();
  await context.sync();
}

/**
 * Interface for the expected LLM response structure.
 */
export interface DocumentPatch {
  anchor_text: string;
  replacement_ooxml: string;
}

/**
 * Applies patches and SCROLLS to them as they happen.
 */
export async function applyPatches(patches: DocumentPatch[]): Promise<void> {
  return Word.run(async (context) => {
    const body = context.document.body;

    for (const patch of patches) {
      const cleanSearch = patch.anchor_text.trim();
      if (!cleanSearch) continue;

      // 1. Search for the text
      const searchResults = body.search(cleanSearch, {
        matchCase: true,
        matchWholeWord: false,
      });

      searchResults.load("items");
      await context.sync();

      if (searchResults.items.length > 0) {
        const targetRange = searchResults.items[0];

        // 2. SCROLL to the section about to be replaced
        // This is useful for the user to see what's changing.
        await scrollAndSelect(targetRange, context);

        // Optional: Add a small delay if you want the user to see "before" state
        // await new Promise(resolve => setTimeout(resolve, 500));

        // 3. Apply the replacement
        const validOoxml = wrapOoxmlFragment(patch.replacement_ooxml);
        targetRange.insertOoxml(validOoxml, Word.InsertLocation.replace);
      } else {
        console.warn(
          `Patch failed: Could not find anchor text "${cleanSearch}"`
        );
      }
    }

    await context.sync();
  });
}

/**
 * Standalone function if you just want to find/scroll to a location
 * (e.g., when the user clicks a "Review Suggestion" button).
 */
export async function scrollToText(anchorText: string): Promise<void> {
  return Word.run(async (context) => {
    const searchResults = context.document.body.search(anchorText.trim(), {
      matchCase: true,
      matchWholeWord: false,
    });
    searchResults.load("items");
    await context.sync();

    if (searchResults.items.length > 0) {
      // Scroll to the first match
      searchResults.items[0].select();
    }
    await context.sync();
  });
}

/**
 * Inserts a comment on a specific range (e.g., "This indemnity is too broad").
 */
export async function addCommentToRange(
  range: Word.Range,
  commentText: string
) {
  // Note: Office.js allows inserting comments directly
  range.insertComment(commentText);
  // You can even simulate a "Reply" if you track thread IDs
  await range.context.sync();
}
