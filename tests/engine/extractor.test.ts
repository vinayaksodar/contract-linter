import { extractContract } from "../../src/engine/extractor";

describe("extractContract", () => {
  it("should not extract from a minimal document", () => {
    const ooxml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<pkg:package xmlns:pkg="http://schemas.microsoft.com/office/2006/xmlPackage">
  <pkg:part pkg:name="/word/document.xml" pkg:contentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml">
    <pkg:xmlData>
      <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:body>
          <w:p><w:r><w:t>Hello World</w:t></w:r></w:p>
        </w:body>
      </w:document>
    </pkg:xmlData>
  </pkg:part>
</pkg:package>`;
    const tree = extractContract(ooxml);
    expect(tree).toBeDefined();
    expect(tree.sections[0].clauses.length).toBe(0);
    expect(Object.keys(tree.definedTerms).length).toBe(0);
  });

  it("should extract clauses and defined terms from an NDA", () => {
    // This is a handcrafted OOXML snippet representing a simplified version of the user's NDA text.
    // It includes a numbered paragraph for a clause and a paragraph with a bolded defined term.
    const ooxml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<pkg:package xmlns:pkg="http://schemas.microsoft.com/office/2006/xmlPackage">
  <pkg:part pkg:name="/word/document.xml" pkg:contentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml">
    <pkg:xmlData>
      <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:body>
          <w:p>
            <w:pPr>
              <w:numPr>
                <w:ilvl w:val="0"/>
                <w:numId w:val="1"/>
              </w:numPr>
            </w:pPr>
            <w:r><w:t>1. Purpose</w:t></w:r>
          </w:p>
          <w:p>
            <w:r><w:t>The Parties wish to explore a potential business relationship (the "Purpose").</w:t></w:r>
          </w:p>
          <w:p>
            <w:r><w:rPr><w:b/></w:rPr><w:t>"Confidential Information"</w:t></w:r>
            <w:r><w:t> means any and all non-public information.</w:t></w:r>
          </w:p>
        </w:body>
      </w:document>
    </pkg:xmlData>
  </pkg:part>
</pkg:package>`;

    const tree = extractContract(ooxml);

    // Check for the extracted clause
    expect(tree.sections[0].clauses.length).toBe(1);
    expect(tree.sections[0].clauses[0].number).toBe("1");
    expect(tree.sections[0].clauses[0].text.trim()).toBe(`Purpose\nThe Parties wish to explore a potential business relationship (the "Purpose").`);

    // Check for the extracted defined term
    expect(Object.keys(tree.definedTerms).length).toBe(1);
    expect(tree.definedTerms["Confidential Information"]).toBeDefined();
    expect(tree.definedTerms["Confidential Information"].definedAt).toBe("1");
  });
});