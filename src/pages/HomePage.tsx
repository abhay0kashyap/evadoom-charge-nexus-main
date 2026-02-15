import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Zap, 
  MapPin, 
  Users, 
  Battery,
  ChevronRight,
  Clock,
  Star,
  Shield,
  Globe,
  Heart,
  Send,
  Mail,
  Phone,
  MapPinIcon,
  Facebook,
  Twitter,
  Instagram,
  Linkedin
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Chatbot from "@/components/Chatbot";
import AnimatedCounter from "@/components/AnimatedCounter";
import FloatingParticles from "@/components/FloatingParticles";
import ScrollingCar from "@/components/ScrollingCar";
import { supabase } from "@/integrations/supabase/client";
import heroImage from "@/assets/hero-charging-station.jpg";

interface HomePageProps {
  onLogout: () => void;
}

const HomePage = ({ onLogout }: HomePageProps) => {
  const { toast } = useToast();
  const [scrollY, setScrollY] = useState(0);
  const [nearbyStations, setNearbyStations] = useState<any[]>([]);
  const [activeStationsCount, setActiveStationsCount] = useState(0);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  });

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch real charging station data
  useEffect(() => {
    const fetchNearbyStations = async () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { data, error } = await supabase.functions.invoke('fetch-charging-stations', {
                body: { 
                  latitude: position.coords.latitude, 
                  longitude: position.coords.longitude, 
                  radius: 7000 
                }
              });

              if (error) throw error;

              if (data?.stations) {
                setNearbyStations(data.stations.slice(0, 2)); // Show only first 2
                const availableCount = data.stations.filter((s: any) => s.available > 0 && s.isOpen).length;
                setActiveStationsCount(availableCount);
              }
            } catch (error) {
              console.error('Error fetching stations:', error);
            }
          },
          (error) => {
            console.error('Geolocation error:', error);
          }
        );
      }
    };

    fetchNearbyStations();
  }, []);

  // Real-time stats
  const quickStats = [
    { label: "Active Stations", value: activeStationsCount || 0, icon: Zap, color: "text-evadoom-primary" },
    { label: "Peer Chargers", value: 156, icon: Users, color: "text-evadoom-secondary" },
    { label: "Available Now", value: activeStationsCount || 0, icon: Battery, color: "text-evadoom-accent" },
  ];

  const peerChargers = [
    {
      id: 1,
      name: "Sarah M.",
      distance: "300m",
      rating: 4.9,
      price: "$0.20/kWh",
      available: true
    },
    {
      id: 2,
      name: "Mike R.",
      distance: "850m", 
      rating: 4.7,
      price: "$0.18/kWh",
      available: true
    }
  ];

  const handleQuickAction = (action: string) => {
    toast({
      title: `${action} Selected`,
      description: "Redirecting to the appropriate section...",
    });
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent!",
      description: "Thank you for contacting us. We'll get back to you soon.",
    });
    setContactForm({ name: '', email: '', message: '' });
  };

  const handleContactChange = (field: string, value: string) => {
    setContactForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <FloatingParticles />
      <ScrollingCar />
      <Navbar onLogout={onLogout} />

      <main className="relative z-10">
        {/* 3D Animated Hero Section with Parallax */}
        <section className="relative h-screen overflow-hidden perspective-1000">
          <div 
            className="absolute inset-0 bg-cover bg-center transform-3d"
            style={{ 
              backgroundImage: `url(${heroImage})`,
              transform: `translate3d(0, ${scrollY * 0.5}px, 0) scale(${1 + scrollY * 0.0005})`
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80"></div>
          </div>
          
          {/* Floating 3D elements */}
          <div className="absolute top-20 left-10 animate-float">
            <div className="w-20 h-20 glassmorphism rounded-full flex items-center justify-center">
              <Zap className="w-8 h-8 text-evadoom-primary" />
            </div>
          </div>
          
          <div className="absolute top-40 right-20 animate-parallax">
            <div className="w-16 h-16 glassmorphism rounded-lg flex items-center justify-center">
              <Battery className="w-6 h-6 text-evadoom-accent" />
            </div>
          </div>

          <div className="relative z-10 h-full flex items-center justify-center text-center text-white p-8">
            <div className="max-w-4xl animate-fade-up">
              <h1 className="font-futuristic text-5xl md:text-7xl font-bold mb-6 text-glow">
                Powering Tomorrow, Together
              </h1>
              <p className="text-xl md:text-3xl mb-12 font-light text-white/90">
                Connect to the future of electric vehicle charging network
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link to="/charging-map">
                  <Button size="lg" className="glassmorphism border-white/30 text-white hover:bg-white/20 hover-lift text-lg px-8 py-4">
                    <MapPin className="w-6 h-6 mr-3" />
                    Find Charging Stations
                  </Button>
                </Link>
                <Link to="/peer-charging">
                  <Button size="lg" className="glassmorphism border-white/30 text-white hover:bg-white/20 hover-lift text-lg px-8 py-4">
                    <Users className="w-6 h-6 mr-3" />
                    Peer-to-Peer Charging
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-16 space-y-20">
          {/* Animated Stats Section */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-up">
            {quickStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card 
                  key={index} 
                  className="glassmorphism hover-lift text-center border-evadoom-primary/20 animate-bounce-in"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <CardContent className="p-8">
                    <Icon className={`w-12 h-12 mx-auto mb-6 ${stat.color}`} />
                    <AnimatedCounter end={stat.value} />
                    <div className="text-muted-foreground text-lg mt-2">{stat.label}</div>
                  </CardContent>
                </Card>
              );
            })}
          </section>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Nearby Stations */}
            <section className="space-y-6 animate-slide-in-left">
              <div className="flex items-center justify-between">
                <h3 className="text-3xl font-bold font-futuristic text-electric">Nearby Stations</h3>
                <Link to="/charging-map">
                  <Button variant="outline" className="hover-glow">
                    <MapPin className="w-4 h-4 mr-2" />
                    View Map
                  </Button>
                </Link>
              </div>
              <div className="space-y-4">
                {nearbyStations.length > 0 ? nearbyStations.map((station, index) => (
                  <Card 
                    key={station.id} 
                    className="glassmorphism hover-lift animate-scale-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-lg">{station.name}</h4>
                          <p className="text-muted-foreground">{station.distance}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <Badge variant={station.available > 0 && station.isOpen ? "default" : "secondary"} className="glassmorphism">
                              {station.available}/{station.total} available
                            </Badge>
                            <Badge variant="outline">{station.type}</Badge>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span>{station.rating.toFixed(1)}</span>
                            </div>
                          </div>
                        </div>
                        <Button className="btn-electric hover-glow">
                          Reserve
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )) : (
                  <Card className="glassmorphism">
                    <CardContent className="p-8 text-center">
                      <p className="text-muted-foreground">Loading nearby stations...</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </section>

            {/* Peer Charging */}
            <section className="space-y-6 animate-slide-in-right">
              <div className="flex items-center justify-between">
                <h3 className="text-3xl font-bold font-futuristic text-electric">Peer Charging</h3>
                <Link to="/peer-charging">
                  <Button variant="outline" className="hover-glow">
                    <Users className="w-4 h-4 mr-2" />
                    View All
                  </Button>
                </Link>
              </div>
              <div className="space-y-4">
                {peerChargers.map((charger, index) => (
                  <Card 
                    key={charger.id} 
                    className="glassmorphism hover-lift animate-scale-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-full bg-gradient-to-r from-evadoom-primary to-evadoom-glow flex items-center justify-center text-white font-bold text-lg">
                            {charger.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-semibold text-lg">{charger.name}</h4>
                            <p className="text-muted-foreground">
                              {charger.distance} • ⭐ {charger.rating}
                            </p>
                            <p className="text-evadoom-primary font-medium text-lg">
                              {charger.price}
                            </p>
                          </div>
                        </div>
                        <Button className="btn-electric hover-glow">
                          Request
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </div>

          {/* Enhanced Services Grid */}
          <section className="space-y-10 animate-fade-up">
            <h3 className="text-4xl font-bold font-futuristic text-center text-electric">Our Services</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Link to="/charging-map">
                <Card className="glassmorphism hover-glow cursor-pointer group transform transition-all duration-500 hover:scale-105 hover:rotate-1">
                  <CardContent className="p-8 text-center">
                    <div className="relative mb-6">
                      <MapPin className="w-16 h-16 mx-auto text-evadoom-primary group-hover:scale-110 transition-transform" />
                      <div className="absolute inset-0 w-16 h-16 mx-auto bg-evadoom-primary/20 blur-xl rounded-full group-hover:bg-evadoom-primary/40 transition-all"></div>
                    </div>
                    <h4 className="text-2xl font-bold mb-4">Interactive Map</h4>
                    <p className="text-muted-foreground mb-6">Find charging stations with real-time availability</p>
                    <ChevronRight className="w-6 h-6 mx-auto text-evadoom-primary group-hover:translate-x-2 transition-transform" />
                  </CardContent>
                </Card>
              </Link>

              <Link to="/peer-charging">
                <Card className="glassmorphism hover-glow cursor-pointer group transform transition-all duration-500 hover:scale-105 hover:rotate-1">
                  <CardContent className="p-8 text-center">
                    <div className="relative mb-6">
                      <Users className="w-16 h-16 mx-auto text-evadoom-secondary group-hover:scale-110 transition-transform" />
                      <div className="absolute inset-0 w-16 h-16 mx-auto bg-evadoom-secondary/20 blur-xl rounded-full group-hover:bg-evadoom-secondary/40 transition-all"></div>
                    </div>
                    <h4 className="text-2xl font-bold mb-4">Peer-to-Peer</h4>
                    <p className="text-muted-foreground mb-6">Connect with nearby EV owners for charging</p>
                    <ChevronRight className="w-6 h-6 mx-auto text-evadoom-secondary group-hover:translate-x-2 transition-transform" />
                  </CardContent>
                </Card>
              </Link>

              <Link to="/generator-rental">
                <Card className="glassmorphism hover-glow cursor-pointer group transform transition-all duration-500 hover:scale-105 hover:rotate-1">
                  <CardContent className="p-8 text-center">
                    <div className="relative mb-6">
                      <Zap className="w-16 h-16 mx-auto text-evadoom-accent group-hover:scale-110 transition-transform" />
                      <div className="absolute inset-0 w-16 h-16 mx-auto bg-evadoom-accent/20 blur-xl rounded-full group-hover:bg-evadoom-accent/40 transition-all"></div>
                    </div>
                    <h4 className="text-2xl font-bold mb-4">Generator Rental</h4>
                    <p className="text-muted-foreground mb-6">Portable charging solutions for any location</p>
                    <ChevronRight className="w-6 h-6 mx-auto text-evadoom-accent group-hover:translate-x-2 transition-transform" />
                  </CardContent>
                </Card>
              </Link>
            </div>
          </section>

          {/* About Us Section */}
          <section className="space-y-10 animate-fade-up">
            <div className="text-center max-w-4xl mx-auto">
              <h3 className="text-4xl font-bold font-futuristic text-electric mb-6">About Evadoom</h3>
              <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
                Evadoom is building the future of EV charging with real-time availability, 
                peer-to-peer networks, and portable charging solutions. We believe in a 
                sustainable tomorrow where electric vehicles power communities together.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
                <div className="text-center animate-fade-up" style={{ animationDelay: '0.1s' }}>
                  <div className="relative mb-6">
                    <Shield className="w-16 h-16 mx-auto text-evadoom-primary" />
                    <div className="absolute inset-0 w-16 h-16 mx-auto bg-evadoom-primary/20 blur-xl rounded-full"></div>
                  </div>
                  <h4 className="text-xl font-bold mb-3">Reliable Network</h4>
                  <p className="text-muted-foreground">
                    99.9% uptime with real-time monitoring and instant availability updates.
                  </p>
                </div>
                
                <div className="text-center animate-fade-up" style={{ animationDelay: '0.2s' }}>
                  <div className="relative mb-6">
                    <Globe className="w-16 h-16 mx-auto text-evadoom-secondary" />
                    <div className="absolute inset-0 w-16 h-16 mx-auto bg-evadoom-secondary/20 blur-xl rounded-full"></div>
                  </div>
                  <h4 className="text-xl font-bold mb-3">Global Reach</h4>
                  <p className="text-muted-foreground">
                    Expanding network across cities worldwide, connecting EV drivers everywhere.
                  </p>
                </div>
                
                <div className="text-center animate-fade-up" style={{ animationDelay: '0.3s' }}>
                  <div className="relative mb-6">
                    <Heart className="w-16 h-16 mx-auto text-evadoom-accent" />
                    <div className="absolute inset-0 w-16 h-16 mx-auto bg-evadoom-accent/20 blur-xl rounded-full"></div>
                  </div>
                  <h4 className="text-xl font-bold mb-3">Community Driven</h4>
                  <p className="text-muted-foreground">
                    Powered by EV owners sharing charging solutions with their neighbors.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Contact Us Section */}
        <section className="bg-gradient-to-br from-card/50 to-accent/20 py-20 mt-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h3 className="text-4xl font-bold font-futuristic text-electric mb-6">Get In Touch</h3>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Have questions about our services? Want to join our network? We'd love to hear from you.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-16 max-w-6xl mx-auto">
              {/* Contact Form */}
              <div className="animate-slide-in-left">
                <Card className="glassmorphism p-8">
                  <form onSubmit={handleContactSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-2">Name</label>
                      <Input
                        id="name"
                        value={contactForm.name}
                        onChange={(e) => handleContactChange('name', e.target.value)}
                        className="glassmorphism border-evadoom-primary/30 focus:border-evadoom-primary transition-colors"
                        placeholder="Your full name"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
                      <Input
                        id="email"
                        type="email"
                        value={contactForm.email}
                        onChange={(e) => handleContactChange('email', e.target.value)}
                        className="glassmorphism border-evadoom-primary/30 focus:border-evadoom-primary transition-colors"
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium mb-2">Message</label>
                      <Textarea
                        id="message"
                        value={contactForm.message}
                        onChange={(e) => handleContactChange('message', e.target.value)}
                        className="glassmorphism border-evadoom-primary/30 focus:border-evadoom-primary transition-colors min-h-[120px]"
                        placeholder="Tell us how we can help you..."
                        required
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="btn-electric btn-glow hover-glow w-full text-lg py-3"
                    >
                      <Send className="w-5 h-5 mr-2" />
                      Send Message
                    </Button>
                  </form>
                </Card>
              </div>

              {/* Contact Info & Social */}
              <div className="animate-slide-in-right space-y-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 glassmorphism rounded-full flex items-center justify-center">
                      <Mail className="w-6 h-6 text-evadoom-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">Email Us</h4>
                      <p className="text-muted-foreground">kashyapabhay745@gmail.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 glassmorphism rounded-full flex items-center justify-center">
                      <Phone className="w-6 h-6 text-evadoom-secondary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">Call Us</h4>
                      <p className="text-muted-foreground">9855333991</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 glassmorphism rounded-full flex items-center justify-center">
                      <MapPinIcon className="w-6 h-6 text-evadoom-accent" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">Visit Us</h4>
                      <p className="text-muted-foreground">123 Electric Avenue<br />San Francisco, CA 94102</p>
                    </div>
                  </div>
                </div>

                {/* Social Media */}
                <div className="pt-8 border-t border-border">
                  <h4 className="font-semibold text-lg mb-4">Follow Us</h4>
                  <div className="flex gap-4">
                    {[
                      { icon: Facebook, label: 'Facebook', color: 'hover:text-blue-500' },
                      { icon: Twitter, label: 'Twitter', color: 'hover:text-blue-400' },
                      { icon: Instagram, label: 'Instagram', color: 'hover:text-pink-500' },
                      { icon: Linkedin, label: 'LinkedIn', color: 'hover:text-blue-600' }
                    ].map((social, index) => {
                      const Icon = social.icon;
                      return (
                        <button
                          key={index}
                          className={`w-12 h-12 glassmorphism rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 ${social.color}`}
                          aria-label={social.label}
                        >
                          <Icon className="w-6 h-6" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Newsletter Signup */}
                <Card className="glassmorphism p-6">
                  <h4 className="font-semibold text-lg mb-3">Stay Updated</h4>
                  <p className="text-muted-foreground mb-4">Get the latest news about EV charging innovations.</p>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Enter your email" 
                      className="glassmorphism border-evadoom-primary/30 flex-1"
                    />
                    <Button className="btn-electric hover-glow">
                      Subscribe
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Chatbot />
    </div>
  );
};

export default HomePage;