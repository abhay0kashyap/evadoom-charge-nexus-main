import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Zap, 
  Battery, 
  Truck, 
  Clock, 
  Star,
  Search,
  Calendar,
  MapPin,
  Shield,
  CheckCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Chatbot from "@/components/Chatbot";

interface GeneratorRentalPageProps {
  onLogout: () => void;
}

interface RentalEquipment {
  id: number;
  name: string;
  type: "Portable" | "Heavy Duty" | "Emergency" | "Commercial";
  power: string;
  batteryCapacity: string;
  chargingSpeed: string;
  dailyRate: number;
  weeklyRate: number;
  monthlyRate: number;
  rating: number;
  reviews: number;
  availability: "Available" | "Limited" | "Unavailable";
  features: string[];
  image: string;
  description: string;
  delivery: boolean;
  setupIncluded: boolean;
}

const GeneratorRentalPage = ({ onLogout }: GeneratorRentalPageProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [rentalPeriod, setRentalPeriod] = useState("daily");
  const { toast } = useToast();

  // Mock rental equipment data
  const rentalEquipment: RentalEquipment[] = [
    {
      id: 1,
      name: "EcoGen Portable Pro",
      type: "Portable",
      power: "3.5kW",
      batteryCapacity: "50kWh",
      chargingSpeed: "Up to 22kW",
      dailyRate: 45,
      weeklyRate: 280,
      monthlyRate: 950,
      rating: 4.8,
      reviews: 127,
      availability: "Available",
      features: ["Weatherproof", "Mobile App Control", "Solar Compatible", "Quiet Operation"],
      image: "🔋",
      description: "Perfect for home emergency backup and overnight EV charging. Lightweight and portable.",
      delivery: true,
      setupIncluded: true
    },
    {
      id: 2,
      name: "PowerMax Heavy Duty",
      type: "Heavy Duty",
      power: "10kW",
      batteryCapacity: "150kWh",
      chargingSpeed: "Up to 50kW",
      dailyRate: 95,
      weeklyRate: 620,
      monthlyRate: 2100,
      rating: 4.9,
      reviews: 89,
      availability: "Limited",
      features: ["Fast Charging", "Multiple Outputs", "Professional Grade", "24/7 Monitoring"],
      image: "⚡",
      description: "High-capacity generator for commercial use or multiple vehicle charging.",
      delivery: true,
      setupIncluded: true
    },
    {
      id: 3,
      name: "QuickCharge Emergency",
      type: "Emergency",
      power: "2kW",
      batteryCapacity: "25kWh",
      chargingSpeed: "Up to 11kW",
      dailyRate: 25,
      weeklyRate: 150,
      monthlyRate: 500,
      rating: 4.6,
      reviews: 203,
      availability: "Available",
      features: ["Compact Design", "Quick Deployment", "Emergency Ready", "USB Ports"],
      image: "🚨",
      description: "Compact emergency charging solution for unexpected situations.",
      delivery: true,
      setupIncluded: false
    },
    {
      id: 4,
      name: "CommercialMax Pro",
      type: "Commercial",
      power: "25kW",
      batteryCapacity: "500kWh",
      chargingSpeed: "Up to 150kW",
      dailyRate: 185,
      weeklyRate: 1200,
      monthlyRate: 4500,
      rating: 5.0,
      reviews: 34,
      availability: "Available",
      features: ["Ultra Fast Charging", "Fleet Ready", "Grid Integration", "Professional Installation"],
      image: "🏭",
      description: "Enterprise-grade solution for commercial fleets and high-demand applications.",
      delivery: true,
      setupIncluded: true
    },
    {
      id: 5,
      name: "SolarSync Hybrid",
      type: "Portable",
      power: "5kW",
      batteryCapacity: "75kWh",
      chargingSpeed: "Up to 32kW",
      dailyRate: 65,
      weeklyRate: 400,
      monthlyRate: 1350,
      rating: 4.7,
      reviews: 156,
      availability: "Available",
      features: ["Solar Integration", "Grid Backup", "Smart Scheduling", "Weather Resistant"],
      image: "☀️",
      description: "Hybrid solar-compatible generator for sustainable charging solutions.",
      delivery: true,
      setupIncluded: true
    }
  ];

  const filteredEquipment = rentalEquipment.filter(equipment => {
    const matchesSearch = equipment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         equipment.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || equipment.type.toLowerCase() === selectedCategory.toLowerCase();
    
    return matchesSearch && matchesCategory;
  });

  const handleRentEquipment = (equipment: RentalEquipment) => {
    if (equipment.availability === "Unavailable") {
      toast({
        title: "Equipment Unavailable",
        description: `${equipment.name} is currently not available for rental.`,
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Rental Request Submitted",
      description: `Your request for ${equipment.name} has been submitted. We'll contact you shortly.`,
    });
  };

  const getRateForPeriod = (equipment: RentalEquipment) => {
    switch (rentalPeriod) {
      case "weekly": return equipment.weeklyRate;
      case "monthly": return equipment.monthlyRate;
      default: return equipment.dailyRate;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar onLogout={onLogout} />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-futuristic text-3xl md:text-4xl font-bold mb-4 text-electric">
            EV Generator Rental
          </h1>
          <p className="text-muted-foreground text-lg">
            Portable charging solutions for any location and situation
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="card-electric mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search generators and equipment..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                <TabsList className="grid grid-cols-5">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="portable">Portable</TabsTrigger>
                  <TabsTrigger value="heavy duty">Heavy Duty</TabsTrigger>
                  <TabsTrigger value="emergency">Emergency</TabsTrigger>
                  <TabsTrigger value="commercial">Commercial</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Rental Period:</span>
              <Tabs value={rentalPeriod} onValueChange={setRentalPeriod}>
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="daily">Daily</TabsTrigger>
                  <TabsTrigger value="weekly">Weekly</TabsTrigger>
                  <TabsTrigger value="monthly">Monthly</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="card-electric text-center">
            <CardContent className="p-4">
              <Battery className="w-8 h-8 mx-auto mb-2 text-evadoom-primary" />
              <div className="text-2xl font-bold">{rentalEquipment.length}</div>
              <div className="text-sm text-muted-foreground">Equipment Types</div>
            </CardContent>
          </Card>
          <Card className="card-electric text-center">
            <CardContent className="p-4">
              <Truck className="w-8 h-8 mx-auto mb-2 text-evadoom-secondary" />
              <div className="text-2xl font-bold">24h</div>
              <div className="text-sm text-muted-foreground">Delivery Time</div>
            </CardContent>
          </Card>
          <Card className="card-electric text-center">
            <CardContent className="p-4">
              <Shield className="w-8 h-8 mx-auto mb-2 text-evadoom-accent" />
              <div className="text-2xl font-bold">100%</div>
              <div className="text-sm text-muted-foreground">Insured</div>
            </CardContent>
          </Card>
          <Card className="card-electric text-center">
            <CardContent className="p-4">
              <Clock className="w-8 h-8 mx-auto mb-2 text-evadoom-glow" />
              <div className="text-2xl font-bold">24/7</div>
              <div className="text-sm text-muted-foreground">Support</div>
            </CardContent>
          </Card>
        </div>

        {/* Equipment Grid */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold font-futuristic">
            Available Equipment ({filteredEquipment.length})
          </h3>
          
          <div className="grid gap-6">
            {filteredEquipment.map((equipment) => (
              <Card key={equipment.id} className="card-electric card-glow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Equipment Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-evadoom-primary to-evadoom-glow flex items-center justify-center text-white text-3xl">
                          {equipment.image}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="text-xl font-semibold">{equipment.name}</h4>
                            <Badge variant="outline">{equipment.type}</Badge>
                            <Badge 
                              variant={
                                equipment.availability === "Available" ? "default" :
                                equipment.availability === "Limited" ? "secondary" : "destructive"
                              }
                            >
                              {equipment.availability}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-4 mb-3">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium">{equipment.rating}</span>
                              <span className="text-muted-foreground">({equipment.reviews} reviews)</span>
                            </div>
                          </div>

                          <p className="text-muted-foreground mb-4">{equipment.description}</p>

                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                            <div className="text-center p-3 bg-muted rounded-lg">
                              <Zap className="w-5 h-5 mx-auto mb-1 text-evadoom-primary" />
                              <div className="text-sm font-semibold">{equipment.power}</div>
                              <div className="text-xs text-muted-foreground">Power Output</div>
                            </div>
                            <div className="text-center p-3 bg-muted rounded-lg">
                              <Battery className="w-5 h-5 mx-auto mb-1 text-evadoom-secondary" />
                              <div className="text-sm font-semibold">{equipment.batteryCapacity}</div>
                              <div className="text-xs text-muted-foreground">Battery</div>
                            </div>
                            <div className="text-center p-3 bg-muted rounded-lg">
                              <CheckCircle className="w-5 h-5 mx-auto mb-1 text-evadoom-accent" />
                              <div className="text-sm font-semibold">{equipment.chargingSpeed}</div>
                              <div className="text-xs text-muted-foreground">Charging Speed</div>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-4">
                            {equipment.features.map((feature, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>

                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            {equipment.delivery && (
                              <div className="flex items-center gap-1">
                                <Truck className="w-4 h-4" />
                                <span>Free Delivery</span>
                              </div>
                            )}
                            {equipment.setupIncluded && (
                              <div className="flex items-center gap-1">
                                <CheckCircle className="w-4 h-4" />
                                <span>Setup Included</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Pricing & Actions */}
                    <div className="lg:w-80 space-y-4">
                      <Card className="border-2 border-primary/20">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-center">
                            <span className="text-2xl font-bold text-evadoom-primary">
                              ${getRateForPeriod(equipment)}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              /{rentalPeriod === "daily" ? "day" : rentalPeriod === "weekly" ? "week" : "month"}
                            </span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="text-center">
                              <div className="font-semibold">${equipment.dailyRate}</div>
                              <div className="text-muted-foreground">Daily</div>
                            </div>
                            <div className="text-center">
                              <div className="font-semibold">${equipment.weeklyRate}</div>
                              <div className="text-muted-foreground">Weekly</div>
                            </div>
                            <div className="text-center">
                              <div className="font-semibold">${equipment.monthlyRate}</div>
                              <div className="text-muted-foreground">Monthly</div>
                            </div>
                          </div>
                          
                          <Button
                            onClick={() => handleRentEquipment(equipment)}
                            className="w-full btn-electric"
                            disabled={equipment.availability === "Unavailable"}
                          >
                            <Calendar className="w-4 h-4 mr-2" />
                            {equipment.availability === "Available" ? "Rent Now" : 
                             equipment.availability === "Limited" ? "Check Availability" : "Unavailable"}
                          </Button>
                          
                          <Button variant="outline" className="w-full">
                            <MapPin className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredEquipment.length === 0 && (
            <Card className="card-electric">
              <CardContent className="p-12 text-center">
                <Battery className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No equipment found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search criteria or contact us for custom solutions.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Chatbot />
    </div>
  );
};

export default GeneratorRentalPage;