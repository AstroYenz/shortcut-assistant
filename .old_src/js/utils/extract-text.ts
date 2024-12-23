import { parse } from 'node-html-parser'


/**
 * Gets all the text content from an element and its children.
 * Example:
 * ```html
 * <div>
 *   <p>Some text</p>
 *   <p>More text</p>
 *   <div>
 *     <p>Even more text</p>
 *   </div>
 * </div>
 * ```
 * Would return "Some text More text Even more text"
 * @param html - The HTML element or string representation of an HTML element to extract text from.
 */
function extractText(html: string | HTMLElement): string {
  if (typeof html !== 'string') {
    html = html.outerHTML
  }
  const root = parse(html)
  return root.textContent.replace(/\s+/g, ' ').trim() // Normalize whitespace
}

export default extractText
