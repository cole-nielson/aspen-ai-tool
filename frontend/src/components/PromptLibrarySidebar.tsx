
import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Tag } from "lucide-react";
import { useLocalStorage } from "@/hooks/use-local-storage";

// Define types for prompts
interface Prompt {
  id: string;
  title: string;
  content: string;
  category: string;
  description?: string;
  createdAt: string;
}

interface PromptLibrarySidebarProps {
  userEmail: string;
  onUsePrompt: (promptContent: string) => void;
}

// Prompt categories
const CATEGORIES = [
  "Document Analysis",
  "Financial Review",
  "Market Research",
  "Client Communications",
  "Risk Assessment",
  "General"
];

// Example pre-loaded prompts as requested
const PRELOADED_PROMPTS: Prompt[] = [
  {
    id: "da1",
    title: "Extract Key Clauses",
    content: "Identify and summarize the top 5 legal or financial clauses (e.g., indemnification, termination, distribution) in the uploaded PDF.",
    category: "Document Analysis",
    description: "Find important legal clauses",
    createdAt: new Date().toISOString()
  },
  {
    id: "da2",
    title: "Generate Executive Summary",
    content: "Write a concise, one-paragraph executive summary of this document's main purpose and findings.",
    category: "Document Analysis",
    description: "Quick document overview",
    createdAt: new Date().toISOString()
  },
  {
    id: "fr1",
    title: "List Balance Sheet Items",
    content: "From the PDF, extract all key balance sheet line items (assets, liabilities, equity) with their values in a table.",
    category: "Financial Review",
    description: "Extract financial data",
    createdAt: new Date().toISOString()
  },
  {
    id: "fr2",
    title: "Calculate Growth",
    content: "Identify year-over-year changes in revenue and net income, and compute growth percentages.",
    category: "Financial Review",
    description: "Calculate financial growth",
    createdAt: new Date().toISOString()
  },
  {
    id: "mr1",
    title: "Competitive Landscape",
    content: "Based on the content, list the main competitors or benchmarks mentioned in the document.",
    category: "Market Research",
    description: "Identify competitors",
    createdAt: new Date().toISOString()
  },
  {
    id: "mr2",
    title: "Industry Trends",
    content: "Highlight any market trends or forecasts described in this PDF.",
    category: "Market Research",
    description: "Find market trends",
    createdAt: new Date().toISOString()
  },
  {
    id: "cc1",
    title: "Draft Client Email",
    content: "Write a brief, professional email to a client summarizing the key actions they need to take based on this document.",
    category: "Client Communications",
    description: "Create client email",
    createdAt: new Date().toISOString()
  },
  {
    id: "cc2",
    title: "Bullet-Point Memo",
    content: "Create a bulleted internal memo that outlines the document's next steps for our team.",
    category: "Client Communications",
    description: "Create action items",
    createdAt: new Date().toISOString()
  },
  {
    id: "ra1",
    title: "Identify Risk Factors",
    content: "Extract and list any risk factors or cautionary statements from the text.",
    category: "Risk Assessment",
    description: "Find risk elements",
    createdAt: new Date().toISOString()
  },
  {
    id: "ra2",
    title: "Regulatory Compliance Check",
    content: "Analyze the document and flag any sections that may conflict with common regulatory standards (e.g., SEC, FINRA).",
    category: "Risk Assessment",
    description: "Check compliance",
    createdAt: new Date().toISOString()
  },
  {
    id: "ge1",
    title: "Translate to Plain English",
    content: "Rewrite the technical language in this document as if explaining to a non-specialist.",
    category: "General",
    description: "Simplify language",
    createdAt: new Date().toISOString()
  },
  {
    id: "ge2",
    title: "Q&A Style Summary",
    content: "Generate a series of three to five Q&A pairs that cover the document's most important points.",
    category: "General",
    description: "Create document Q&A",
    createdAt: new Date().toISOString()
  }
];

const PromptLibrarySidebar = ({ userEmail, onUsePrompt }: PromptLibrarySidebarProps) => {
  // Get prompts from local storage or use preloaded ones
  const [prompts, setPrompts] = useLocalStorage<Prompt[]>(`prompts_${userEmail}`, PRELOADED_PROMPTS);
  const [filterCategory, setFilterCategory] = React.useState("all");
  
  // Filter prompts by category
  const filteredPrompts = filterCategory !== "all" 
    ? prompts.filter(prompt => prompt.category === filterCategory)
    : prompts;

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-lg border shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-sm">Prompt Library</h3>
      </div>
      
      {/* Category Filter */}
      <div className="mb-4">
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Prompts List */}
      <ScrollArea className="flex-1">
        <div className="space-y-3">
          {filteredPrompts.map((prompt) => (
            <Card key={prompt.id} className="p-3">
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <h4 className="font-medium text-sm">{prompt.title}</h4>
                  <div className="flex items-center text-xs text-gray-500 bg-slate-100 px-2 py-1 rounded-full">
                    <Tag className="h-3 w-3 mr-1" />
                    {prompt.category}
                  </div>
                </div>
                {prompt.description && (
                  <p className="text-xs text-gray-500">{prompt.description}</p>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full text-xs" 
                  onClick={() => onUsePrompt(prompt.content)}
                >
                  Use Prompt
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default PromptLibrarySidebar;
