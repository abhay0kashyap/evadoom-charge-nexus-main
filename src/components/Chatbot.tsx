import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User 
} from "lucide-react";

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hi! I'm your Evadoom assistant. How can I help you with EV charging today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date()
    };

    const messageToRespond = newMessage;
    setMessages(prev => [...prev, userMessage]);
    setNewMessage("");

    try {
      // Try to fetch from backend API
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: messageToRespond }),
      });

      let botResponseText: string;

      if (response.ok) {
        const data = await response.json();
        botResponseText = data.response || getBotResponse(messageToRespond);
      } else {
        // Fallback to local response if backend is unavailable
        botResponseText = getBotResponse(messageToRespond);
      }

      const botResponse: Message = {
        id: Date.now() + 1,
        text: botResponseText,
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      // Handle network errors gracefully with fallback response
      console.log('Backend unavailable, using local responses');
      
      const botResponse: Message = {
        id: Date.now() + 1,
        text: getBotResponse(messageToRespond),
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botResponse]);
    }
  };

  const getBotResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('charging') || lowerMessage.includes('station') || lowerMessage.includes('find') || lowerMessage.includes('map')) {
      return "🗺️ I can help you find nearby charging stations! Use our interactive map to see real-time availability, or check out peer-to-peer charging for better rates. Would you like me to guide you to the map section?";
    } else if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('rate')) {
      return "💰 Charging prices vary by location and speed:\n• Fast chargers: $0.35-0.45/kWh\n• Normal chargers: $0.20-0.30/kWh\n• Peer-to-peer: $0.18-0.25/kWh\n\nPeer charging often offers the best rates!";
    } else if (lowerMessage.includes('rental') || lowerMessage.includes('generator') || lowerMessage.includes('portable')) {
      return "⚡ Our portable EV generator rental service provides charging anywhere you need it! Perfect for:\n• Remote locations\n• Emergency charging\n• Events and camping\n\nVisit our Generator Rental page to see available options and pricing.";
    } else if (lowerMessage.includes('peer') || lowerMessage.includes('p2p') || lowerMessage.includes('community')) {
      return "👥 Peer-to-peer charging connects you with nearby EV owners who share their home chargers. Benefits:\n• Lower rates than commercial stations\n• More convenient locations\n• Support your local community\n\nCheck out our Peer Charging section to get started!";
    } else if (lowerMessage.includes('evadoom') || lowerMessage.includes('about') || lowerMessage.includes('platform')) {
      return "🚗 Evadoom is the future of EV charging! We offer:\n• Real-time charging station finder\n• Peer-to-peer charging network\n• Portable generator rentals\n• 24/7 support\n\nPowering Tomorrow, Together! How can I help you get started?";
    } else if (lowerMessage.includes('login') || lowerMessage.includes('signup') || lowerMessage.includes('account')) {
      return "🔐 Need help with your account? You can:\n• Sign up with email, Google, or Apple ID\n• Reset your password using 'Forgot Password'\n• Update your profile in the Profile section\n\nIs there a specific issue you're experiencing?";
    } else if (lowerMessage.includes('navigation') || lowerMessage.includes('directions') || lowerMessage.includes('route')) {
      return "🧭 Our integrated Google Maps provides turn-by-turn navigation to charging stations! Simply:\n1. Find a station on the map\n2. Click 'Navigate'\n3. Follow GPS directions\n\nYou can also reserve stations in advance to guarantee availability.";
    } else if (lowerMessage.includes('help') || lowerMessage.includes('support') || lowerMessage.includes('?')) {
      return "🤖 I'm your Evadoom AI assistant! I can help with:\n• Finding charging stations\n• Explaining pricing and features\n• Navigation and reservations\n• Account and login issues\n• Generator rentals\n• Peer-to-peer charging\n\nJust ask me anything about EV charging!";
    } else {
      return "Thanks for your message! I'm here to help with all your EV charging needs. Try asking me about:\n• Nearby charging stations\n• Pricing information\n• How to use our features\n• Account support\n\nWhat would you like to know? 😊";
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full btn-electric shadow-lg hover:scale-105 transition-transform z-50"
        style={{ display: isOpen ? 'none' : 'flex' }}
      >
        <MessageCircle className="w-6 h-6" />
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-80 h-[500px] card-electric shadow-2xl z-50 animate-scale-in flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between p-4 bg-gradient-to-r from-evadoom-primary/10 to-evadoom-glow/10 border-b border-border flex-shrink-0">
            <CardTitle className="text-lg font-futuristic text-evadoom-primary">🤖 Evadoom AI</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-0 flex flex-col flex-1 min-h-0">
            {/* Messages */}
            <ScrollArea className="flex-1 p-4 min-h-0">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start gap-2 ${
                      message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md flex-shrink-0 ${
                       message.sender === 'user' 
                         ? 'bg-gradient-to-r from-evadoom-primary to-evadoom-glow text-white' 
                         : 'bg-gradient-to-r from-evadoom-secondary to-evadoom-accent text-white'
                     }`}>
                      {message.sender === 'user' ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                    </div>
                     <div className={`max-w-[70%] p-3 rounded-lg ${
                       message.sender === 'user'
                         ? 'bg-gradient-to-r from-evadoom-primary to-evadoom-glow text-white shadow-md'
                         : 'bg-background border border-border text-foreground shadow-sm'
                     }`}>
                       <p className="text-sm whitespace-pre-line">{message.text}</p>
                     </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Input Area - Fixed at bottom */}
            <div className="p-4 border-t border-border bg-background flex-shrink-0">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Ask me anything about EV stations..."
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  className="flex-1 bg-background text-foreground border-border focus:border-evadoom-primary"
                  autoFocus
                />
                <Button
                  onClick={handleSendMessage}
                  size="sm"
                  disabled={!newMessage.trim()}
                  className="btn-electric px-3"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default Chatbot;