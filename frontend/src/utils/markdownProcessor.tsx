import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypeKatex from 'rehype-katex';

export async function processMathMarkdown(markdown: string): Promise<string> {
  if (!markdown) {
    return "";
  }
  try {
    const file = await unified()
      .use(remarkParse) // Parse Markdown
      .use(remarkMath) // Handle math syntax (e.g., $...$, $$...$$)
      .use(remarkRehype) // Convert Markdown AST to HTML AST
      .use(rehypeKatex, { strict: false }) // Render math using KaTeX
      .use(rehypeStringify) // Convert HTML AST to HTML string
      .process(markdown);

    return String(file);
  } catch (error) {
    console.error("Error processing math markdown:", error);
    // Return original markdown or an error message if processing fails
    return `<div>Error rendering content: ${markdown}</div>`;
  }
}