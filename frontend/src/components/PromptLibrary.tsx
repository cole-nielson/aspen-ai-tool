
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, FileText, Tag } from "lucide-react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useToast } from "@/hooks/use-toast";

// Types
interface Prompt {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
}

interface PromptLibraryProps {
  user: any;
  documents?: any[]; // Make documents optional with a default type
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

const PromptLibrary = ({ user, documents }: PromptLibraryProps) => {
  const [prompts, setPrompts] = useLocalStorage<Prompt[]>(`prompts_${user?.email}`, []);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("General");
  const [filterCategory, setFilterCategory] = useState("all"); // Changed to "all" instead of empty string
  const { toast } = useToast();

  // Filter prompts by category
  const filteredPrompts = filterCategory !== "all" 
    ? prompts.filter(prompt => prompt.category === filterCategory)
    : prompts;

  const handleCreatePrompt = () => {
    if (!title || !content) {
      toast({
        title: "Missing information",
        description: "Please provide both a title and content for the prompt.",
        variant: "destructive"
      });
      return;
    }

    const newPrompt: Prompt = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      content,
      category,
      createdAt: new Date().toISOString()
    };

    setPrompts([newPrompt, ...prompts]);
    setTitle("");
    setContent("");
    setCategory("General");
    setIsDialogOpen(false);

    toast({
      title: "Prompt created",
      description: "Your prompt has been added to the library."
    });
  };

  const handleUsePrompt = (promptContent: string) => {
    // This is a placeholder for when we connect to the chat component
    navigator.clipboard.writeText(promptContent);
    toast({
      title: "Prompt copied",
      description: "The prompt has been copied to your clipboard. You can paste it in the chat."
    });
    
    // TODO: Implement direct injection into chat textarea when connected
  };

  return (
    <div className="space-y-6">
      {/* Header and filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Prompt Library</h2>
          <p className="text-sm text-gray-500 mt-1">
            Create and save frequently used prompts for document analysis
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem> {/* Changed value from "" to "all" */}
              {CATEGORIES.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <PlusCircle className="mr-2 h-4 w-4" />
                New Prompt
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Prompt</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input 
                    id="title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="E.g., Financial Statement Analysis"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="content">Prompt Content</Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder="Write your prompt template here..."
                    className="min-h-[120px]"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleCreatePrompt}>Create Prompt</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Prompts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPrompts.length === 0 ? (
          <div className="col-span-full bg-slate-50 rounded-lg p-8 text-center">
            <FileText className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <h3 className="text-lg font-medium text-gray-900">No prompts yet</h3>
            <p className="text-sm text-gray-500 mt-1 mb-4">
              Create your first prompt to get started
            </p>
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(true)}
              className="mx-auto"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Prompt
            </Button>
          </div>
        ) : (
          <>
            {filteredPrompts.map((prompt) => (
              <Card key={prompt.id} className="p-4 flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-base text-gray-900">{prompt.title}</h3>
                    <div className="flex items-center text-xs text-gray-500 bg-slate-100 px-2 py-1 rounded-full">
                      <Tag className="h-3 w-3 mr-1" />
                      {prompt.category}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 line-clamp-3 mb-4">
                    {prompt.content}
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="mt-2 w-full" 
                  onClick={() => handleUsePrompt(prompt.content)}
                >
                  Use in Chat
                </Button>
              </Card>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default PromptLibrary;
