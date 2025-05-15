import { useState, useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  MessageSquare, 
  Send, 
  Paperclip, 
  Clock, 
  X, 
  FileText, 
  Users,
  BookText,
  ChevronRight,
  ChevronLeft
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatDistanceToNow } from "date-fns";
import PromptLibrarySidebar from "./PromptLibrarySidebar";

// Types for conversations and messages
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  attachments?: {name: string, id: string}[];
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  lastUpdated: string;
  participants?: string[];
}

// Mock function to simulate API call
const sendChatMessage = async (message: string, attachments: any[] = [], conversationId?: string): Promise<Message> => {
  // Simulate API delay
  return new Promise((resolve) => {
    setTimeout(() => {
      // Construct response content carefully to avoid backtick issues
      const attachmentText = attachments.length > 0 
        ? `I've reviewed the ${attachments.length} attached document(s).` 
        : "";
      
      const codeBlock = '```json\n{\n  "confidence": 0.92,\n  "analysis": "complete"\n}\n```';
      
      resolve({
        id: Math.random().toString(36).substring(2, 9),
        role: "assistant",
        content: `Here's my response to your query: "${message}"\n\n${attachmentText}\n\n## Key findings\n- Point 1\n- Point 2\n- Point 3\n\n${codeBlock}`,
        timestamp: new Date().toISOString(),
      });
    }, 1500);
  });
};

// Mock team members for @ mentions
const TEAM_MEMBERS = [
  { id: "1", name: "Sarah Johnson", email: "sarah@aspencapitalmgmt.com" },
  { id: "2", name: "Michael Chen", email: "michael@aspencapitalmgmt.com" },
  { id: "3", name: "Aisha Patel", email: "aisha@aspencapitalmgmt.com" }
];

// ChatPanel Component
const ChatPanel = ({ user, documents }) => {
  const [conversations, setConversations] = useLocalStorage<Conversation[]>(`chat_conversations_${user?.email}`, []);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<any[]>([]);
  const [promptSidebarOpen, setPromptSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Get active conversation
  const activeConversation = conversations.find(c => c.id === activeConversationId);

  // Create a new conversation
  const createNewConversation = () => {
    const newConversation: Conversation = {
      id: Math.random().toString(36).substring(2, 9),
      title: `New Conversation ${conversations.length + 1}`,
      messages: [],
      lastUpdated: new Date().toISOString()
    };
    
    setConversations([newConversation, ...conversations]);
    setActiveConversationId(newConversation.id);
    setMessageInput("");
    setSelectedFiles([]);
  };

  // Send a message
  const handleSendMessage = async () => {
    if (!messageInput.trim() && selectedFiles.length === 0) return;
    
    // Create conversation if none exists
    if (!activeConversationId) {
      createNewConversation();
      return;
    }
    
    // Find active conversation
    const conversationIndex = conversations.findIndex(c => c.id === activeConversationId);
    if (conversationIndex === -1) return;
    
    // Create user message
    const userMessage: Message = {
      id: Math.random().toString(36).substring(2, 9),
      role: "user",
      content: messageInput,
      timestamp: new Date().toISOString(),
      attachments: selectedFiles.length > 0 ? selectedFiles.map(file => ({
        name: file.filename || file.name,
        id: file.id || Math.random().toString(36).substring(2, 12)
      })) : undefined
    };
    
    // Update conversation with user message
    const updatedConversation = { 
      ...conversations[conversationIndex],
      messages: [...conversations[conversationIndex].messages, userMessage],
      lastUpdated: new Date().toISOString()
    };
    
    // Generate title from first message if it's the first one
    if (updatedConversation.messages.length === 1) {
      const title = messageInput.length > 30 ? 
        messageInput.substring(0, 30) + '...' : 
        messageInput;
      updatedConversation.title = title;
    }
    
    const updatedConversations = [...conversations];
    updatedConversations[conversationIndex] = updatedConversation;
    
    // Update state
    setConversations(updatedConversations);
    setMessageInput("");
    setIsTyping(true);
    
    try {
      // Call API (placeholder)
      // TODO: Replace with actual backend API call
      const assistantMessage = await sendChatMessage(
        messageInput, 
        selectedFiles, 
        activeConversationId
      );
      
      // Add assistant response to conversation
      const finalConversationIndex = updatedConversations.findIndex(c => c.id === activeConversationId);
      const finalUpdatedConversation = { 
        ...updatedConversations[finalConversationIndex],
        messages: [...updatedConversations[finalConversationIndex].messages, assistantMessage],
        lastUpdated: new Date().toISOString()
      };
      
      const finalConversations = [...updatedConversations];
      finalConversations[finalConversationIndex] = finalUpdatedConversation;
      setConversations(finalConversations);
      setSelectedFiles([]);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error sending message",
        description: "There was a problem sending your message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsTyping(false);
    }
  };

  // Attach document
  const handleAttachDocument = (doc) => {
    if (selectedFiles.some(file => file.id === doc.id)) {
      toast({
        description: "This document is already attached",
      });
      return;
    }
    
    setSelectedFiles([...selectedFiles, doc]);
  };

  // Remove attached document
  const handleRemoveAttachment = (docId) => {
    setSelectedFiles(selectedFiles.filter(file => file.id !== docId));
  };

  // Handle keyboard enter to send message
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle using a prompt from the library
  const handleUsePrompt = (promptContent: string) => {
    setMessageInput(promptContent);
    setPromptSidebarOpen(false);
  };

  // Automatically scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConversation?.messages]);

  // Initialize with a conversation if none exists
  useEffect(() => {
    if (conversations.length === 0) {
      createNewConversation();
    } else if (!activeConversationId && conversations.length > 0) {
      setActiveConversationId(conversations[0].id);
    }
  }, [conversations]);

  return (
    <div className="grid grid-cols-12 gap-6 h-[calc(100vh-240px)] min-h-[500px]">
      {/* Conversations List (Left Sidebar) */}
      <div className="col-span-3 border rounded-lg overflow-hidden bg-white">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-medium text-sm">Conversations</h3>
          <Button 
            onClick={createNewConversation} 
            variant="outline" 
            size="sm"
            className="text-xs"
          >
            New Chat
          </Button>
        </div>
        
        <ScrollArea className="h-[calc(100%-60px)]">
          <div className="space-y-1 p-2">
            {conversations.length === 0 ? (
              <div className="text-center p-4 text-muted-foreground text-sm">
                No conversations yet
              </div>
            ) : (
              conversations.map((convo) => (
                <button
                  key={convo.id}
                  onClick={() => setActiveConversationId(convo.id)}
                  className={`w-full text-left p-3 rounded-md transition-colors flex items-start gap-3
                    ${activeConversationId === convo.id 
                      ? 'bg-accent' 
                      : 'hover:bg-accent/50'}`}
                >
                  <MessageSquare className="h-4 w-4 mt-1 flex-shrink-0" />
                  <div className="overflow-hidden flex-1">
                    <div className="font-medium text-sm truncate">{convo.title}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(convo.lastUpdated), { addSuffix: true })}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Panel (Middle) */}
      <div className={`${promptSidebarOpen ? 'col-span-6' : 'col-span-9'} border rounded-lg flex flex-col bg-white transition-all duration-200`}>
        {/* Chat Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4 mb-4">
            {activeConversation?.messages.length === 0 ? (
              <div className="text-center p-12 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                <h3 className="font-medium text-lg mb-1">Start a new conversation</h3>
                <p className="text-sm">
                  Ask questions about your documents or start a new analysis
                </p>
              </div>
            ) : (
              activeConversation?.messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div 
                    className={`max-w-[80%] rounded-lg p-4 shadow-sm 
                      ${message.role === 'user' 
                        ? 'bg-primary/10 text-primary-foreground/90' 
                        : 'bg-card text-card-foreground border'}`}
                  >
                    {/* Message attachments */}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mb-3 flex flex-wrap gap-2">
                        {message.attachments.map((attachment) => (
                          <div 
                            key={attachment.id}
                            className="bg-accent px-2 py-1 rounded flex items-center gap-1 text-xs"
                          >
                            <FileText className="h-3 w-3" />
                            {attachment.name}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Message content with markdown support */}
                    <div className={`prose prose-sm max-w-none ${message.role === 'assistant' ? 'prose-headings:text-primary prose-a:text-primary' : ''}`}
                      dangerouslySetInnerHTML={{ 
                        __html: message.content
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
                          .replace(/- (.*?)\n/g, '<li>$1</li>\n')
                      }}
                    />
                    
                    <div className="mt-2 text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              ))
            )}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-card border rounded-lg p-4 shadow-sm max-w-[80%]">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce delay-100" />
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        {/* Message Input Area */}
        <div className="p-4 border-t">
          {/* Attachments area */}
          {selectedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedFiles.map((file) => (
                <div 
                  key={file.id} 
                  className="bg-accent rounded-md px-2 py-1 text-xs flex items-center gap-1"
                >
                  <FileText className="h-3 w-3" />
                  <span className="max-w-[150px] truncate">{file.filename || file.name}</span>
                  <button 
                    onClick={() => handleRemoveAttachment(file.id)}
                    className="ml-1 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {/* Input and buttons */}
          <div className="flex gap-3">
            <div className="flex-1">
              <Textarea
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="min-h-[80px] resize-none"
                disabled={isTyping}
              />
            </div>
            
            <div className="flex flex-col gap-2">
              {/* File attachment button */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" disabled={isTyping}>
                    <Paperclip className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <h3 className="text-lg font-medium mb-4">Attach Documents</h3>
                  <Tabs defaultValue="your-docs">
                    <TabsList className="mb-4">
                      <TabsTrigger value="your-docs">Your Documents</TabsTrigger>
                      <TabsTrigger value="upload">Upload New</TabsTrigger>
                    </TabsList>
                    <TabsContent value="your-docs">
                      <ScrollArea className="h-[400px] border rounded-md p-2">
                        {documents.length === 0 ? (
                          <div className="text-center p-4 text-muted-foreground">
                            No documents available
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {documents.map((doc) => (
                              <Card key={doc.id} className="p-3">
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                      <p className="text-sm font-medium">{doc.filename}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {new Date(doc.uploaded_at).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </div>
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    onClick={() => handleAttachDocument(doc)}
                                  >
                                    Attach
                                  </Button>
                                </div>
                              </Card>
                            ))}
                          </div>
                        )}
                      </ScrollArea>
                    </TabsContent>
                    <TabsContent value="upload">
                      <div className="text-center p-8 border rounded-md">
                        <p className="text-muted-foreground mb-4">
                          Upload files directly to use in this conversation
                        </p>
                        <Button variant="outline" className="w-full" disabled>
                          Upload File (Coming Soon)
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </SheetContent>
              </Sheet>
              
              {/* Prompt Library button */}
              <Button 
                variant="outline" 
                size="icon" 
                disabled={isTyping}
                onClick={() => setPromptSidebarOpen(!promptSidebarOpen)}
                className="relative"
              >
                <BookText className="h-4 w-4" />
              </Button>
              
              {/* Send button */}
              <Button 
                onClick={handleSendMessage} 
                size="icon" 
                disabled={(!messageInput.trim() && selectedFiles.length === 0) || isTyping}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Collaboration footer */}
          <div className="flex justify-between items-center mt-3">
            <div className="text-xs text-muted-foreground">
              {/* Placeholder for additional info/status */}
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>Collaboration features coming soon</span>
            </div>
          </div>
        </div>
      </div>

      {/* Prompt Library Sidebar (Right Side) - Conditionally rendered */}
      {promptSidebarOpen && (
        <div className="col-span-3 transition-all duration-200">
          <div className="h-full flex flex-col overflow-hidden">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setPromptSidebarOpen(false)}
              className="self-end mb-2"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <PromptLibrarySidebar 
              userEmail={user?.email || 'anonymous'} 
              onUsePrompt={handleUsePrompt} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPanel;
