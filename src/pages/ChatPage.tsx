import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Send, 
  User, 
  Star, 
  MapPin, 
  Zap, 
  Clock, 
  Shield,
  Circle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'host';
  timestamp: Date;
}

interface HostData {
  id: number;
  name: string;
  rating: number;
  available: boolean;
  chargerType: string;
  price: string;
  distance: string;
  responseTime: string;
  verified: boolean;
  image: string;
  description: string;
  amenities: string[];
}

interface ChatPageProps {
  onLogout: () => void;
}

const ChatPage = ({ onLogout }: ChatPageProps) => {
  const { hostId } = useParams<{ hostId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [hostData, setHostData] = useState<HostData | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Get host data from navigation state or fallback to mock data
    const passedHostData = location.state?.hostData;
    
    if (passedHostData) {
      setHostData(passedHostData);
      
      // Initialize with a personalized welcome message
      setMessages([
        {
          id: 1,
          text: `Hi! I'm ${passedHostData.name} Welcome to my charging station! I have a ${passedHostData.chargerType} connector available at ${passedHostData.price}. Feel free to ask me anything about availability or amenities!`,
          sender: 'host',
          timestamp: new Date(Date.now() - 30000) // 30 seconds ago
        }
      ]);
    } else {
      // Fallback mock data based on hostId
      const mockHostsData: Record<string, HostData> = {
        "Sarah-M": {
          id: 1,
          name: "Sarah M.",
          rating: 4.9,
          available: true,
          chargerType: "Type2",
          price: "$0.20/kWh",
          distance: "300m",
          responseTime: "~5 min",
          verified: true,
          image: "👩‍💼",
          description: "Home garage charging available. Easy access, safe neighborhood.",
          amenities: ["Covered", "WiFi", "Restroom"]
        },
        "Mike-R": {
          id: 2,
          name: "Mike R.",
          rating: 4.7,
          available: true,
          chargerType: "CCS2",
          price: "$0.18/kWh",
          distance: "850m",
          responseTime: "~10 min",
          verified: true,
          image: "👨‍💻",
          description: "Fast charging available in my driveway. Usually available weekends.",
          amenities: ["Fast Charging", "Security Cam"]
        }
      };

      const fallbackData = mockHostsData[hostId as keyof typeof mockHostsData];
      
      if (fallbackData) {
        setHostData(fallbackData);
        setMessages([
          {
            id: 1,
            text: `Hi! I'm ${fallbackData.name}. Feel free to ask about my charging station availability!`,
            sender: 'host',
            timestamp: new Date()
          }
        ]);
      } else {
        // Invalid host - show error and redirect
        toast({
          title: "User not found",
          description: "This user is not available to chat.",
          variant: "destructive"
        });
        navigate("/peer-charging");
      }
    }
  }, [hostId, location.state, toast, navigate]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !hostData) return;

    const userMessage: Message = {
      id: Date.now(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage("");
    setIsTyping(true);

    // Simulate host response with contextual replies
    setTimeout(() => {
      const contextualResponses = [
        `Thanks for your message! My ${hostData.chargerType} station is ${hostData.available ? 'available now' : 'currently busy but should be free soon'}.`,
        `Sure thing! I'm usually free ${hostData.responseTime}. My rate is ${hostData.price} - does that work for you?`,
        `Great question! ${hostData.amenities.length > 0 ? `I have ${hostData.amenities.join(', ')} available at my location.` : 'Let me know what you need!'}`,
        `I'm located about ${hostData.distance} from you. The setup is ${hostData.description.toLowerCase()}`,
        `Let me check my availability and get back to you! I usually respond within ${hostData.responseTime}.`
      ];
      
      const randomResponse = contextualResponses[Math.floor(Math.random() * contextualResponses.length)];
      
      const hostMessage: Message = {
        id: Date.now() + 1,
        text: randomResponse,
        sender: 'host',
        timestamp: new Date()
      };

      setIsTyping(false);
      setMessages(prev => [...prev, hostMessage]);
    }, 1500 + Math.random() * 2000); // Random delay between 1.5-3.5 seconds
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!hostData) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar onLogout={onLogout} />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-evadoom-primary/20 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-evadoom-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Loading chat...</h2>
            <p className="text-muted-foreground">Please wait while we connect you.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar onLogout={onLogout} />
      
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header with back button */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/peer-charging")}
            className="flex items-center gap-2 hover-glow"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Charging
          </Button>
        </div>

        {/* Host Profile Header */}
        <Card className="glassmorphism mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-evadoom-primary to-evadoom-glow flex items-center justify-center text-white text-2xl font-bold">
                  {hostData.image}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-2xl font-bold font-futuristic">{hostData.name}</h1>
                    {hostData.verified && (
                      <Badge className="bg-evadoom-accent text-background">
                        <Shield className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                    <div className="flex items-center gap-1">
                      <Circle className={`w-3 h-3 fill-current ${hostData.available ? 'text-green-500' : 'text-red-500'}`} />
                      <span className="text-sm">{hostData.available ? 'Available' : 'Busy'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{hostData.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{hostData.distance}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{hostData.responseTime}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="md:ml-auto flex flex-col md:flex-row gap-4">
                <div className="text-center p-3 glassmorphism rounded-lg">
                  <Zap className="w-5 h-5 mx-auto mb-1 text-evadoom-primary" />
                  <div className="text-sm font-semibold">{hostData.chargerType}</div>
                  <div className="text-xs text-muted-foreground">Connector</div>
                </div>
                <div className="text-center p-3 glassmorphism rounded-lg">
                  <span className="text-lg font-bold text-evadoom-primary">{hostData.price}</span>
                  <div className="text-xs text-muted-foreground">Per kWh</div>
                </div>
              </div>
            </div>
            
            <p className="text-muted-foreground mt-4">{hostData.description}</p>
            
            {hostData.amenities.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {hostData.amenities.map((amenity, index) => (
                  <Badge key={index} variant="outline" className="text-xs glassmorphism">
                    {amenity}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chat Interface */}
        <Card className="glassmorphism">
          <CardContent className="p-0">
            {/* Messages Container */}
            <div className="h-96 overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-evadoom-primary text-white'
                        : 'glassmorphism'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className={`text-xs mt-1 opacity-70`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              
              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="glassmorphism p-3 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-evadoom-primary rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-evadoom-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-evadoom-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="border-t border-border p-4">
              <div className="flex gap-3">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`Message ${hostData.name}...`}
                  className="flex-1 glassmorphism border-none"
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="btn-electric hover-glow"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Press Enter to send • Shift + Enter for new line
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChatPage;