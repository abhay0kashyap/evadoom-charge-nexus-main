import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  ShoppingCart, 
  Heart, 
  Star, 
  Search,
  LogOut,
  User,
  Home,
  Filter,
  Grid,
  List
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import evadoomLogo from "@/assets/evadoom-logo.png";

interface ShopPageProps {
  onLogout: () => void;
}

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  rating: number;
  reviews: number;
  category: string;
  subcategory: string;
  isFavorite: boolean;
  inStock: boolean;
}

const ShopPage = ({ onLogout }: ShopPageProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [cartItems, setCartItems] = useState<number[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const { toast } = useToast();

  // Generate unique products for each category
  useEffect(() => {
    const generateProducts = () => {
      const mensProducts: Product[] = [
        // Men's EV Wearables (30 items)
        ...Array.from({ length: 30 }, (_, i) => ({
          id: i + 1,
          name: `Men's EV ${['Thunder', 'Volt', 'Electric', 'Power', 'Charge', 'Spark', 'Energy', 'Circuit', 'Current', 'Ion'][i % 10]} ${['Jacket', 'T-Shirt', 'Hoodie', 'Cap', 'Polo', 'Sweater', 'Tank Top', 'Windbreaker', 'Vest', 'Long Sleeve'][Math.floor(i / 3) % 10]}`,
          price: Math.floor(Math.random() * 200) + 30,
          image: `men-${i + 1}`,
          rating: Math.round((Math.random() * 2 + 3) * 10) / 10,
          reviews: Math.floor(Math.random() * 500) + 10,
          category: "men",
          subcategory: ['jackets', 'shirts', 'hoodies', 'caps'][Math.floor(i / 7.5)],
          isFavorite: Math.random() > 0.8,
          inStock: Math.random() > 0.1
        }))
      ];

      const womensProducts: Product[] = [
        // Women's EV Wearables (30 items)
        ...Array.from({ length: 30 }, (_, i) => ({
          id: i + 31,
          name: `Women's EV ${['Luna', 'Electra', 'Voltage', 'Amp', 'Watt', 'Ohm', 'Tesla', 'Joule', 'Kelvin', 'Newton'][i % 10]} ${['Top', 'Leggings', 'Jacket', 'Cap', 'Sports Bra', 'Dress', 'Skirt', 'Cardigan', 'Blouse', 'Shorts'][Math.floor(i / 3) % 10]}`,
          price: Math.floor(Math.random() * 180) + 25,
          image: `women-${i + 1}`,
          rating: Math.round((Math.random() * 2 + 3) * 10) / 10,
          reviews: Math.floor(Math.random() * 400) + 15,
          category: "women",
          subcategory: ['tops', 'leggings', 'jackets', 'caps'][Math.floor(i / 7.5)],
          isFavorite: Math.random() > 0.8,
          inStock: Math.random() > 0.1
        }))
      ];

      const accessoryProducts: Product[] = [
        // Accessories (20+ items)
        ...Array.from({ length: 25 }, (_, i) => ({
          id: i + 61,
          name: `EV ${['Smart', 'Pro', 'Elite', 'Premium', 'Advanced', 'Deluxe', 'Ultra', 'Super', 'Mega', 'Turbo'][i % 10]} ${['Charging Cable', 'Keychain', 'Gloves', 'EV Tag', 'Helmet', 'Portable Charger', 'Tire Inflator', 'Phone Mount', 'Car Organizer', 'Seat Cover', 'Steering Wheel Cover', 'Dashboard Cam', 'Air Freshener'][i % 13]}`,
          price: Math.floor(Math.random() * 500) + 15,
          image: `accessory-${i + 1}`,
          rating: Math.round((Math.random() * 2 + 3) * 10) / 10,
          reviews: Math.floor(Math.random() * 300) + 5,
          category: "accessories",
          subcategory: ['charging', 'protection', 'comfort', 'tech'][Math.floor(i / 6.25)],
          isFavorite: Math.random() > 0.8,
          inStock: Math.random() > 0.05
        }))
      ];

      setProducts([...mensProducts, ...womensProducts, ...accessoryProducts]);
    };

    generateProducts();
  }, []);

  const addToCart = (productId: number) => {
    setCartItems(prev => [...prev, productId]);
    toast({
      title: "Added to Cart",
      description: "Item has been added to your shopping cart.",
    });
  };

  const toggleFavorite = (productId: number) => {
    setProducts(prev => prev.map(p => 
      p.id === productId ? { ...p, isFavorite: !p.isFavorite } : p
    ));
    toast({
      title: "Favorites Updated",
      description: "Item added to your favorites.",
    });
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const ProductCard = ({ product }: { product: Product }) => (
    <Card className="card-electric card-glow group">
      <CardHeader className="p-0">
        <div className="relative overflow-hidden rounded-t-lg">
          <div className="aspect-square bg-gradient-to-br from-muted via-muted/50 to-background flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <div className="text-4xl mb-2">
                {product.category === 'men' && '👕'}
                {product.category === 'women' && '👚'}
                {product.category === 'accessories' && '🔌'}
              </div>
              <p className="text-xs">{product.image}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className={`absolute top-2 right-2 ${product.isFavorite ? 'text-red-500' : 'text-muted-foreground'}`}
            onClick={() => toggleFavorite(product.id)}
          >
            <Heart className={`w-4 h-4 ${product.isFavorite ? 'fill-current' : ''}`} />
          </Button>
          {!product.inStock && (
            <Badge variant="destructive" className="absolute top-2 left-2">
              Out of Stock
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <h3 className="font-semibold text-sm line-clamp-2 mb-2">{product.name}</h3>
        <div className="flex items-center gap-1 mb-2">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          <span className="text-sm text-muted-foreground">
            {product.rating} ({product.reviews})
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-evadoom-primary">
            ${product.price}
          </span>
          <Button
            size="sm"
            className="btn-electric"
            onClick={() => addToCart(product.id)}
            disabled={!product.inStock}
          >
            <ShoppingCart className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={evadoomLogo} alt="Evadoom" className="w-8 h-8" />
            <h1 className="font-futuristic text-xl font-bold text-electric">EVADOOM</h1>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <a href="/" className="text-muted-foreground hover:text-primary transition-colors">
              <Home className="w-4 h-4" />
            </a>
            <a href="/shop" className="text-foreground hover:text-primary transition-colors">
              Shop
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="relative">
              <ShoppingCart className="w-4 h-4" />
              {cartItems.length > 0 && (
                <Badge className="absolute -top-1 -right-1 w-5 h-5 rounded-full p-0 flex items-center justify-center text-xs">
                  {cartItems.length}
                </Badge>
              )}
            </Button>
            <Button variant="ghost" size="sm">
              <User className="w-4 h-4 mr-2" />
              Profile
            </Button>
            <Button variant="ghost" size="sm" onClick={onLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <h1 className="font-futuristic text-4xl md:text-6xl font-bold mb-4 text-electric">
            EV Lifestyle Store
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Discover premium electric vehicle wearables and accessories designed for the future
          </p>
          
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* Product Categories */}
        <Tabs defaultValue="men" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
            <TabsTrigger value="men">Men's</TabsTrigger>
            <TabsTrigger value="women">Women's</TabsTrigger>
            <TabsTrigger value="accessories">Accessories</TabsTrigger>
          </TabsList>

          <TabsContent value="men" className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Men's EV Wearables</h2>
              <p className="text-muted-foreground">Premium clothing designed for electric mobility enthusiasts</p>
            </div>
            <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}>
              {filteredProducts
                .filter(p => p.category === "men")
                .map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="women" className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Women's EV Wearables</h2>
              <p className="text-muted-foreground">Stylish and sustainable fashion for the modern EV driver</p>
            </div>
            <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}>
              {filteredProducts
                .filter(p => p.category === "women")
                .map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="accessories" className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">EV Accessories</h2>
              <p className="text-muted-foreground">Essential tools and gadgets for your electric vehicle lifestyle</p>
            </div>
            <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}>
              {filteredProducts
                .filter(p => p.category === "accessories")
                .map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Stats Section */}
        <section className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="card-electric text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-evadoom-primary mb-2">85+</div>
              <div className="text-muted-foreground">Unique Products</div>
            </CardContent>
          </Card>
          <Card className="card-electric text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-evadoom-secondary mb-2">4.8★</div>
              <div className="text-muted-foreground">Average Rating</div>
            </CardContent>
          </Card>
          <Card className="card-electric text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-evadoom-accent mb-2">24/7</div>
              <div className="text-muted-foreground">Customer Support</div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default ShopPage;