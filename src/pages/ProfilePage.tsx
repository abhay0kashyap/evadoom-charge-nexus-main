import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Car, 
  Zap, 
  Star, 
  Clock, 
  MapPin,
  Settings,
  CreditCard,
  History,
  Edit3,
  Save
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Chatbot from "@/components/Chatbot";

interface ProfilePageProps {
  onLogout: () => void;
}

const ProfilePage = ({ onLogout }: ProfilePageProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    name: "Alex Johnson",
    email: "alex.johnson@email.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA"
  });
  const { toast } = useToast();

  // Mock data
  const userStats = {
    totalCharges: 47,
    totalKwh: 1234,
    carbonSaved: 156,
    rating: 4.9,
    moneySpent: 245.67,
    moneyEarned: 89.34
  };

  const chargingHistory = [
    {
      id: 1,
      date: "2024-01-15",
      location: "Evadoom Station Alpha",
      duration: "2h 15m",
      kwh: 45.5,
      cost: 15.93,
      type: "Fast Charging"
    },
    {
      id: 2,
      date: "2024-01-12",
      location: "Sarah M. (Peer)",
      duration: "4h 30m",
      kwh: 32.2,
      cost: 6.44,
      type: "Peer-to-Peer"
    },
    {
      id: 3,
      date: "2024-01-10",
      location: "PowerHub Central",
      duration: "1h 45m",
      kwh: 28.8,
      cost: 7.20,
      type: "Normal Charging"
    }
  ];

  const vehicles = [
    {
      id: 1,
      make: "Tesla",
      model: "Model 3",
      year: 2023,
      battery: "75kWh",
      efficiency: "4.1 mi/kWh",
      isPrimary: true
    },
    {
      id: 2,
      make: "BMW",
      model: "iX3",
      year: 2022,
      battery: "80kWh",
      efficiency: "3.8 mi/kWh",
      isPrimary: false
    }
  ];

  const handleSaveProfile = () => {
    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved successfully.",
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar onLogout={onLogout} />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-futuristic text-3xl md:text-4xl font-bold text-electric">
              Profile
            </h1>
            <p className="text-muted-foreground text-lg">
              Manage your account and charging preferences
            </p>
          </div>
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-evadoom-primary to-evadoom-glow flex items-center justify-center text-white text-2xl font-bold">
            {userData.name.split(' ').map(n => n[0]).join('')}
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* User Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="card-electric text-center">
                <CardContent className="p-6">
                  <Zap className="w-8 h-8 mx-auto mb-3 text-evadoom-primary" />
                  <div className="text-3xl font-bold font-futuristic mb-2">{userStats.totalCharges}</div>
                  <div className="text-muted-foreground">Total Charges</div>
                </CardContent>
              </Card>
              <Card className="card-electric text-center">
                <CardContent className="p-6">
                  <Car className="w-8 h-8 mx-auto mb-3 text-evadoom-secondary" />
                  <div className="text-3xl font-bold font-futuristic mb-2">{userStats.totalKwh}</div>
                  <div className="text-muted-foreground">kWh Charged</div>
                </CardContent>
              </Card>
              <Card className="card-electric text-center">
                <CardContent className="p-6">
                  <Star className="w-8 h-8 mx-auto mb-3 text-evadoom-accent" />
                  <div className="text-3xl font-bold font-futuristic mb-2">{userStats.rating}</div>
                  <div className="text-muted-foreground">User Rating</div>
                </CardContent>
              </Card>
            </div>

            {/* Financial Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="card-electric">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-evadoom-primary" />
                    Charging Expenses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-evadoom-primary mb-2">
                    ${userStats.moneySpent}
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Total spent on charging this month
                  </p>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Fast Charging</span>
                      <span>$156.23</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Normal Charging</span>
                      <span>$67.89</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Peer-to-Peer</span>
                      <span>$21.55</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-electric">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-evadoom-secondary" />
                    Hosting Earnings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-evadoom-secondary mb-2">
                    ${userStats.moneyEarned}
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Earned from hosting peer charging
                  </p>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Sessions Hosted</span>
                      <span>12</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Total kWh Provided</span>
                      <span>248 kWh</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Host Rating</span>
                      <span>4.8 ⭐</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Environmental Impact */}
            <Card className="card-electric">
              <CardHeader>
                <CardTitle>Environmental Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-2xl font-bold text-evadoom-accent mb-2">
                      {userStats.carbonSaved} lbs
                    </div>
                    <div className="text-muted-foreground">CO₂ Saved</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-evadoom-primary mb-2">
                      {Math.round(userStats.totalKwh * 0.89)} miles
                    </div>
                    <div className="text-muted-foreground">Green Miles Driven</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-evadoom-secondary mb-2">
                      {Math.round(userStats.carbonSaved / 22)} trees
                    </div>
                    <div className="text-muted-foreground">Equivalent Trees Planted</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vehicles" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold font-futuristic">My Vehicles</h3>
              <Button className="btn-electric">
                <Car className="w-4 h-4 mr-2" />
                Add Vehicle
              </Button>
            </div>
            
            <div className="grid gap-6">
              {vehicles.map((vehicle) => (
                <Card key={vehicle.id} className="card-electric">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-evadoom-primary to-evadoom-glow flex items-center justify-center text-white text-xl">
                          🚗
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold">
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </h4>
                          {vehicle.isPrimary && (
                            <Badge className="bg-evadoom-primary text-background">Primary</Badge>
                          )}
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-sm font-semibold">{vehicle.battery}</div>
                        <div className="text-xs text-muted-foreground">Battery</div>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-sm font-semibold">{vehicle.efficiency}</div>
                        <div className="text-xs text-muted-foreground">Efficiency</div>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-sm font-semibold">87%</div>
                        <div className="text-xs text-muted-foreground">Current Charge</div>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-sm font-semibold">245 mi</div>
                        <div className="text-xs text-muted-foreground">Range Left</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold font-futuristic">Charging History</h3>
              <Button variant="outline">
                <History className="w-4 h-4 mr-2" />
                Export History
              </Button>
            </div>
            
            <div className="space-y-4">
              {chargingHistory.map((session) => (
                <Card key={session.id} className="card-electric">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-evadoom-primary/20 flex items-center justify-center">
                          <Zap className="w-5 h-5 text-evadoom-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{session.location}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{session.date}</span>
                            <span>{session.duration}</span>
                            <Badge variant="outline" className="text-xs">{session.type}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">${session.cost}</div>
                        <div className="text-sm text-muted-foreground">{session.kwh} kWh</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="card-electric">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Personal Information</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </>
                    ) : (
                      <>
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={userData.name}
                      onChange={(e) => setUserData(prev => ({...prev, name: e.target.value}))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={userData.email}
                      onChange={(e) => setUserData(prev => ({...prev, email: e.target.value}))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={userData.phone}
                      onChange={(e) => setUserData(prev => ({...prev, phone: e.target.value}))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={userData.location}
                      onChange={(e) => setUserData(prev => ({...prev, location: e.target.value}))}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                {isEditing && (
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleSaveProfile} className="btn-electric">
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Chatbot />
    </div>
  );
};

export default ProfilePage;