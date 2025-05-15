
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper function to sanitize and convert markdown to HTML
export function markdownToHtml(markdown: string): string {
  if (!markdown) return "";
  
  return markdown
    .replace(/\n/g, '<br />')
    // Basic markdown for code blocks
    .replace(/```(.*?)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Headings (## Heading 2)
    .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
    .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
    // Lists
    .replace(/- (.*?)\n/g, '<li>$1</li>\n');
}

