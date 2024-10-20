export function extractTagContents(input: string, tagName: string): string[] {
  const regex = new RegExp(`<${tagName}>(.*?)(${`<\/${tagName}>`}|$)`, "gs");
  const results = [];
  let match: RegExpExecArray | null;

  while ((match = regex.exec(input)) !== null) {
    const content = match[1]; // This captures everything after the opening tag until the closing tag or the end of input.
    if (content) {
      results.push(content?.trimStart());
    }
  }

  return results;
}
