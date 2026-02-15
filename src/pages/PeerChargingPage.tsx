import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  MapPin, 
  Star, 
  Zap, 
  Clock, 
  Search,
  Filter,
  MessageCircle,
  Shield
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Chatbot from "@/components/Chatbot";

interface PeerChargingPageProps {
  onLogout: () => void;
}

interface PeerCharger {
  id: number;
  name: string;
  rating: number;
  reviews: number;
  distance: string;
  price: string;
  chargerType: "Type2" | "CCS2" | "CHAdeMO";
  available: boolean;
  responseTime: string;
  verified: boolean;
  image: string;
  description: string;
  amenities: string[];
}

const PeerChargingPage = ({ onLogout }: PeerChargingPageProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [activeTab, setActiveTab] = useState("available");
  const { toast } = useToast();
  const navigate = useNavigate();

  // Mock peer chargers data
  const peerChargers: PeerCharger[] = [
    {
      id: 1,
      name: "Sarah M.",
      rating: 4.9,
      reviews: 47,
      distance: "300m",
      price: "$0.20/kWh",
      chargerType: "Type2",
      available: true,
      responseTime: "~5 min",
      verified: true,
      image: "👩‍💼",
      description: "Home garage charging available. Easy access, safe neighborhood.",
      amenities: ["Covered", "WiFi", "Restroom"]
    },
    {
      id: 2,
      name: "Mike R.",
      rating: 4.7,
      reviews: 33,
      distance: "850m",
      price: "$0.18/kWh",
      chargerType: "CCS2",
      available: true,
      responseTime: "~10 min",
      verified: true,
      image: "👨‍💻",
      description: "Fast charging available in my driveway. Usually available weekends.",
      amenities: ["Fast Charging", "Security Cam"]
    },
    {
      id: 3,
      name: "Jennifer L.",
      rating: 5.0,
      reviews: 62,
      distance: "1.2km",
      price: "$0.22/kWh",
      chargerType: "Type2",
      available: false,
      responseTime: "~3 min",
      verified: true,
      image: "👩‍🔬",
      description: "Premium charging setup with monitoring. Very reliable service.",
      amenities: ["Covered", "WiFi", "Snacks", "Monitoring"]
    },
    {
      id: 4,
      name: "Alex K.",
      rating: 4.8,
      reviews: 29,
      distance: "950m",
      price: "$0.19/kWh",
      chargerType: "CHAdeMO",
      available: true,
      responseTime: "~7 min",
      verified: false,
      image: "👨‍🎓",
      description: "Student housing area. Flexible timing, great for overnight charging.",
      amenities: ["24/7 Access", "Student Discount"]
    },
    {
      id: 5,
      name: "Maria S.",
      rating: 4.6,
      reviews: 18,
      distance: "1.8km",
      price: "$0.16/kWh",
      chargerType: "Type2",
      available: true,
      responseTime: "~15 min",
      verified: true,
      image: "👩‍🍳",
      description: "Family home with electric setup. Kid-friendly area, coffee available.",
      amenities: ["Kid-friendly", "Coffee", "Pet-friendly"]
    }
  ];

  const filteredChargers = peerChargers.filter(charger => {
    const matchesSearch = charger.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         charger.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         charger.amenities.some(amenity => amenity.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Enhanced filter logic for charger types
    const matchesFilter = filterType === "all" || 
                         (filterType === "type2" && charger.chargerType === "Type2") ||
                         (filterType === "ccs2" && charger.chargerType === "CCS2") ||
                         (filterType === "chademo" && charger.chargerType === "CHAdeMO");
    
    // Enhanced tab filtering logic
    const matchesTab = activeTab === "all" || 
                      (activeTab === "available" && charger.available) ||
                      (activeTab === "nearby" && parseFloat(charger.distance.replace('km', '').replace('m', '')) < (charger.distance.includes('km') ? 1 : 1000)) ||
                      (activeTab === "fast" && (charger.chargerType === "CCS2" || charger.chargerType === "CHAdeMO"));
    
    return matchesSearch && matchesFilter && matchesTab;
  });

  const handleRequestCharging = (charger: PeerCharger) => {
    if (!charger.available) {
      toast({
        title: "Charger Unavailable",
        description: `${charger.name} is currently busy. Try messaging them to check availability.`,
        variant: "destructive"
      });
      return;
    }

    // Simulate successful request
    toast({
      title: "Request Sent! 🚗⚡",
      description: `${charger.name} will respond in ${charger.responseTime}. You'll receive a notification once confirmed.`,
    });

    // Log the request for simulation purposes
    console.log(`Charging request sent to ${charger.name}:`, {
      hostId: charger.id,
      hostName: charger.name,
      chargerType: charger.chargerType,
      price: charger.price,
      distance: charger.distance,
      timestamp: new Date().toISOString()
    });
  };

  const handleMessageHost = (charger: PeerCharger) => {
    // Navigate to chat with host data
    const hostId = charger.name.replace(/\s+/g, '-').replace('.', '');
    navigate(`/chat/${hostId}`, { 
      state: { 
        hostData: {
          id: charger.id,
          name: charger.name,
          rating: charger.rating,
          available: charger.available,
          chargerType: charger.chargerType,
          price: charger.price,
          distance: charger.distance,
          responseTime: charger.responseTime,
          verified: charger.verified,
          image: charger.image,
          description: charger.description,
          amenities: charger.amenities
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar onLogout={onLogout} />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-futuristic text-3xl md:text-4xl font-bold mb-4 text-electric">
            Peer-to-Peer Charging
          </h1>
          <p className="text-muted-foreground text-lg">
            Connect with nearby EV owners for convenient charging solutions
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="card-electric mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by name or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Tabs value={filterType} onValueChange={setFilterType}>
                <TabsList className="grid grid-cols-4">
                  <TabsTrigger value="all">All Types</TabsTrigger>
                  <TabsTrigger value="type2">Type2</TabsTrigger>
                  <TabsTrigger value="ccs2">CCS2</TabsTrigger>
                  <TabsTrigger value="chademo">CHAdeMO</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="available">Available Now</TabsTrigger>
                <TabsTrigger value="nearby">Nearby</TabsTrigger>
                <TabsTrigger value="fast">Fast Chargers</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="card-electric text-center">
            <CardContent className="p-4">
              <Users className="w-8 h-8 mx-auto mb-2 text-evadoom-primary" />
              <div className="text-2xl font-bold">{peerChargers.length}</div>
              <div className="text-sm text-muted-foreground">Available Hosts</div>
            </CardContent>
          </Card>
          <Card className="card-electric text-center">
            <CardContent className="p-4">
              <MapPin className="w-8 h-8 mx-auto mb-2 text-evadoom-secondary" />
              <div className="text-2xl font-bold">{peerChargers.filter(c => c.available).length}</div>
              <div className="text-sm text-muted-foreground">Currently Available</div>
            </CardContent>
          </Card>
          <Card className="card-electric text-center">
            <CardContent className="p-4">
              <Star className="w-8 h-8 mx-auto mb-2 text-evadoom-accent" />
              <div className="text-2xl font-bold">4.8</div>
              <div className="text-sm text-muted-foreground">Average Rating</div>
            </CardContent>
          </Card>
          <Card className="card-electric text-center">
            <CardContent className="p-4">
              <Clock className="w-8 h-8 mx-auto mb-2 text-evadoom-glow" />
              <div className="text-2xl font-bold">~7 min</div>
              <div className="text-sm text-muted-foreground">Avg Response</div>
            </CardContent>
          </Card>
        </div>

        {/* Chargers Grid */}
        <div className="grid gap-6">
          <h3 className="text-xl font-bold font-futuristic">
            Available Hosts ({filteredChargers.length})
          </h3>
          
          <div className="grid gap-6">
            {filteredChargers.map((charger) => (
              <Card key={charger.id} className="card-electric card-glow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Host Info */}
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-evadoom-primary to-evadoom-glow flex items-center justify-center text-white text-2xl font-bold">
                        {charger.image}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-xl font-semibold">{charger.name}</h4>
                          {charger.verified && (
                            <Badge className="bg-evadoom-accent text-background">
                              <Shield className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                          <Badge variant={charger.available ? "default" : "secondary"}>
                            {charger.available ? "Available" : "Busy"}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{charger.rating}</span>
                            <span className="text-muted-foreground">({charger.reviews} reviews)</span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            <span>{charger.distance}</span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>{charger.responseTime}</span>
                          </div>
                        </div>

                        <p className="text-muted-foreground mb-4">{charger.description}</p>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {charger.amenities.map((amenity, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {amenity}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Charging Details & Actions */}
                    <div className="md:w-80 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <Zap className="w-5 h-5 mx-auto mb-1 text-evadoom-primary" />
                          <div className="text-sm font-semibold">{charger.chargerType}</div>
                          <div className="text-xs text-muted-foreground">Connector</div>
                        </div>
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <span className="text-lg font-bold text-evadoom-primary">{charger.price}</span>
                          <div className="text-xs text-muted-foreground">Per kWh</div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleMessageHost(charger)}
                          className="flex-1 bg-black text-white hover:bg-black/90 hover:scale-105 transition-all duration-200"
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Message
                        </Button>
                        <Button
                          onClick={() => handleRequestCharging(charger)}
                          className="btn-electric flex-1"
                          disabled={!charger.available}
                        >
                          <Zap className="w-4 h-4 mr-2" />
                          Request
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredChargers.length === 0 && (
            <Card className="card-electric">
              <CardContent className="p-12 text-center">
                <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No stations found</h3>
                <p className="text-muted-foreground mb-4">
                  No hosts match your current filters. Try:
                </p>
                <div className="text-left max-w-sm mx-auto space-y-2 text-sm text-muted-foreground">
                  <div>• Expanding your search area</div>
                  <div>• Changing charger type filters</div>
                  <div>• Checking "All" instead of "Available Now"</div>
                  <div>• Searching different keywords</div>
                </div>
                <Button 
                  onClick={() => {
                    setSearchQuery("");
                    setFilterType("all");
                    setActiveTab("all");
                  }}
                  className="mt-4 btn-electric"
                >
                  Clear All Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Chatbot />
    </div>
  );
};

export default PeerChargingPage;