import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MapPin, 
  Navigation, 
  Search, 
  Zap, 
  Clock,
  Star,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getDistance } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import Chatbot from "@/components/Chatbot";
import ReservationModal from "@/components/ReservationModal";
import { Loader } from "@googlemaps/js-api-loader";
import { supabase } from "@/integrations/supabase/client";

declare global {
  interface Window {
    google: typeof google;
  }
}

declare const google: any;

interface ChargingMapPageProps {
  onLogout: () => void;
}

interface ChargingStation {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  distance: string;
  available: number;
  total: number;
  type: "Fast" | "Normal" | "Ultra";
  price: string;
  isOpen: boolean;
  rating: number;
  reviews: number;
  amenities: string[];
  placeId?: string;
}

const ChargingMapPage = ({ onLogout }: ChargingMapPageProps) => {
  const [selectedStation, setSelectedStation] = useState<ChargingStation | null>(null);
  const [reservationModalOpen, setReservationModalOpen] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchText, setSearchText] = useState("");
  const [nearbyStations, setNearbyStations] = useState<ChargingStation[]>([]);
  const [mapLoading, setMapLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [searchedLocation, setSearchedLocation] = useState<{lat: number, lng: number} | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const searchMarkerRef = useRef<any>(null);
  const infoWindowRef = useRef<any>(null);
  const refreshIntervalRef = useRef<number | null>(null);
  const { toast } = useToast();

  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
  const SEARCH_RADIUS_KM = 50;

  const geocodeAddress = async (address: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('fetch-charging-stations', {
        body: { searchType: 'geocode', address }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  };

  const fetchChargingStations = async (lat?: number, lng?: number, bounds?: any, searchType: string = 'nearby') => {
    try {
      setDataLoading(true);
      const body: any = { 
        searchType,
        radius: 6000
      };

      if (searchType === 'viewport' && bounds) {
        body.bounds = bounds;
      } else if (lat && lng) {
        body.latitude = lat;
        body.longitude = lng;
      }

      const { data, error } = await supabase.functions.invoke('fetch-charging-stations', {
        body
      });

      if (error) throw error;

      if (data?.stations) {
        const centerLat = searchedLocation?.lat || userLocation?.lat || lat;
        const centerLng = searchedLocation?.lng || userLocation?.lng || lng;
        
        let filteredStations = data.stations;
        
        if (centerLat && centerLng) {
          filteredStations = data.stations
            .map((station: ChargingStation) => {
              const distance = getDistance(centerLat, centerLng, station.latitude, station.longitude);
              return {
                ...station,
                distance: `${distance.toFixed(1)} km`,
                distanceValue: distance
              };
            })
            .filter((station: any) => station.distanceValue <= SEARCH_RADIUS_KM)
            .sort((a: any, b: any) => a.distanceValue - b.distanceValue);
        }
        
        setNearbyStations(filteredStations);
        return filteredStations;
      }
      return [];
    } catch (error) {
      console.error('Error fetching charging stations:', error);
      toast({
        title: "Error",
        description: "Unable to load stations. Retrying…",
        variant: "destructive"
      });
      return [];
    } finally {
      setDataLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchText.trim() || !mapInstanceRef.current) return;

    setDataLoading(true);
    const geocodeResult = await geocodeAddress(searchText);

    if (geocodeResult?.location) {
      const newLocation = {
        lat: geocodeResult.location.lat,
        lng: geocodeResult.location.lng
      };
      
      setSearchedLocation(newLocation);
      mapInstanceRef.current.panTo(newLocation);
      mapInstanceRef.current.setZoom(13);

      if (searchMarkerRef.current) {
        searchMarkerRef.current.setMap(null);
      }

      const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");
      
      const searchPin = new PinElement({
        background: '#3b82f6',
        borderColor: '#ffffff',
        glyphColor: '#ffffff',
        scale: 1.2,
      });

      searchMarkerRef.current = new AdvancedMarkerElement({
        map: mapInstanceRef.current,
        position: newLocation,
        title: "Searched Location",
        content: searchPin.element
      });

      const stations = await fetchChargingStations(newLocation.lat, newLocation.lng, null, 'nearby');
      
      if (stations.length === 0) {
        toast({
          title: "No stations found",
          description: `No charging stations found within ${SEARCH_RADIUS_KM}km of ${geocodeResult.address || searchText}`,
        });
      }

      addMarkersToMap(stations, mapInstanceRef.current, AdvancedMarkerElement, PinElement);
    } else {
      toast({
        title: "Location not found",
        description: "Could not find the specified location. Please try again.",
        variant: "destructive"
      });
    }
    setDataLoading(false);
  };

  const darkMapStyle = [
    { elementType: "geometry", stylers: [{ color: "#0a0a0a" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#0a0a0a" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#00ff88" }] },
    { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#00ff88" }] },
    { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#1a1a1a" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#2c2c2c" }] },
    { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#00ff88" }] },
    { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#3c3c3c" }] },
    { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#00ff88" }] },
    { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2f3948" }] },
    { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#00ff88" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#1a1a2e" }] },
    { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
    { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#0a0a0a" }] }
  ];

  const handleGetDirections = (station: ChargingStation) => {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${station.latitude},${station.longitude}`,
      "_blank"
    );
  };

  const addMarkersToMap = (stationsData: ChargingStation[], map: any, AdvancedMarkerElement: any, PinElement: any) => {
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    if (!infoWindowRef.current && window.google) {
      infoWindowRef.current = new google.maps.InfoWindow();
    }

    stationsData.forEach((station) => {
      const isAvailable = station.isOpen && station.available > 0;
      const stationPin = new PinElement({
        background: isAvailable ? '#00ff88' : '#ff4444',
        borderColor: '#ffffff',
        glyphColor: '#000000',
        scale: 1.0,
      });

      const marker = new AdvancedMarkerElement({
        map: map,
        position: { lat: station.latitude, lng: station.longitude },
        title: station.name,
        content: stationPin.element
      });

      marker.addListener("click", () => {
        const contentString = `
          <div style="padding: 12px; max-width: 280px;">
            <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 8px; color: #000;">${station.name}</h3>
            <p style="font-size: 13px; color: #666; margin-bottom: 8px;">${station.address}</p>
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <span style="color: #facc15;">⭐ ${station.rating.toFixed(1)}</span>
              <span style="color: ${station.isOpen ? '#22c55e' : '#ef4444'};">
                ${station.isOpen ? 'Open' : 'Closed'}
              </span>
            </div>
            <button 
              onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${station.latitude},${station.longitude}', '_blank')"
              style="
                width: 100%;
                padding: 8px 16px;
                background: #00ff88;
                color: #000;
                border: none;
                border-radius: 6px;
                font-weight: 600;
                cursor: pointer;
                margin-top: 8px;
              "
            >
              Get Directions
            </button>
          </div>
        `;
        
        if (infoWindowRef.current) {
          infoWindowRef.current.setContent(contentString);
          infoWindowRef.current.open(map, marker);
        }
        
        setSelectedStation(station);
        map.panTo({ lat: station.latitude, lng: station.longitude });
      });

      marker.addListener("mouseover", () => {
        const element = marker.content as HTMLElement;
        element.style.transform = 'scale(1.2)';
        element.style.transition = 'transform 0.2s ease';
      });

      marker.addListener("mouseout", () => {
        const element = marker.content as HTMLElement;
        element.style.transform = 'scale(1)';
      });

      markersRef.current.push(marker);
    });
  };

  useEffect(() => {
    const initializeMap = async () => {
      try {
        const loader = new Loader({
          apiKey: GOOGLE_MAPS_API_KEY,
          version: "weekly",
          libraries: ["places", "marker", "geometry"]
        });

        const { Map } = await loader.importLibrary("maps");
        const { AdvancedMarkerElement, PinElement } = await loader.importLibrary("marker");

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const userPos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              };
              setUserLocation(userPos);

              if (mapRef.current) {
                const map = new Map(mapRef.current, {
                  center: userPos,
                  zoom: 14,
                  styles: darkMapStyle,
                  disableDefaultUI: true,
                  mapId: "EVADOOM_MAP"
                });

                mapInstanceRef.current = map;

                const userPin = new PinElement({
                  background: '#00ff88',
                  borderColor: '#ffffff',
                  glyphColor: '#000000',
                  scale: 1.2,
                });

                new AdvancedMarkerElement({
                  map: map,
                  position: userPos,
                  title: "Your Location",
                  content: userPin.element
                });

                const stations = await fetchChargingStations(userPos.lat, userPos.lng, null, 'nearby');
                addMarkersToMap(stations, map, AdvancedMarkerElement, PinElement);

                map.addListener('idle', async () => {
                  const bounds = map.getBounds();
                  if (bounds) {
                    const ne = bounds.getNorthEast();
                    const sw = bounds.getSouthWest();
                    const viewportBounds = {
                      north: ne.lat(),
                      south: sw.lat(),
                      east: ne.lng(),
                      west: sw.lng()
                    };
                    const centerLat = searchedLocation?.lat || userLocation?.lat;
                    const centerLng = searchedLocation?.lng || userLocation?.lng;
                    
                    if (centerLat && centerLng) {
                      const viewportStations = await fetchChargingStations(centerLat, centerLng, viewportBounds, 'viewport');
                      if (viewportStations.length > 0) {
                        addMarkersToMap(viewportStations, map, AdvancedMarkerElement, PinElement);
                      }
                    }
                  }
                });

                refreshIntervalRef.current = window.setInterval(async () => {
                  const bounds = map.getBounds();
                  if (bounds) {
                    const ne = bounds.getNorthEast();
                    const sw = bounds.getSouthWest();
                    const viewportBounds = {
                      north: ne.lat(),
                      south: sw.lat(),
                      east: ne.lng(),
                      west: sw.lng()
                    };
                    const centerLat = searchedLocation?.lat || userLocation?.lat;
                    const centerLng = searchedLocation?.lng || userLocation?.lng;
                    
                    if (centerLat && centerLng) {
                      const updatedStations = await fetchChargingStations(centerLat, centerLng, viewportBounds, 'viewport');
                      if (updatedStations.length > 0 && mapInstanceRef.current) {
                        addMarkersToMap(updatedStations, mapInstanceRef.current, AdvancedMarkerElement, PinElement);
                      }
                    }
                  }
                }, 10000);

                setMapLoading(false);
              }
            },
            (error) => {
              console.error("Error getting location:", error);
              toast({
                title: "Location Error",
                description: "Could not get your location. Please enable location services.",
                variant: "destructive"
              });
              setMapLoading(false);
            }
          );
        } else {
          toast({
            title: "Geolocation Error",
            description: "Geolocation is not supported by this browser.",
            variant: "destructive"
          });
          setMapLoading(false);
        }
      } catch (error) {
        console.error("Error loading Google Maps:", error);
        toast({
          title: "Map Loading Error",
          description: "Failed to load Google Maps. Please check your connection.",
          variant: "destructive"
        });
        setMapLoading(false);
      }
    };

    initializeMap();

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  const filteredStations = nearbyStations.filter(station => {
    const matchesSearch = station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         station.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === "all" || station.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar onLogout={onLogout} />
      
      <div className="h-[calc(100vh-64px)] flex">
        <div className="flex-1 relative">
          {mapLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                <p className="text-foreground">Loading map...</p>
              </div>
            </div>
          )}
          <div ref={mapRef} className="w-full h-full" />
        </div>

        <div className="w-96 bg-card border-l border-border overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border space-y-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Find Charging Stations</h1>
              <p className="text-sm text-muted-foreground">Real-time availability near you</p>
            </div>

            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search location (e.g., Chandigarh)..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-10"
              />
            </form>

            <div className="relative">
              <Input
                placeholder="Filter stations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            </div>

            <Tabs value={filterType} onValueChange={setFilterType}>
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="Fast">Fast</TabsTrigger>
                <TabsTrigger value="Normal">Normal</TabsTrigger>
                <TabsTrigger value="Ultra">Ultra</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                {searchedLocation ? 'Stations Near Search' : 'Nearby Stations'}
                {dataLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              </h2>
              <Badge variant="secondary" className="bg-primary/20 text-primary">
                {filteredStations.length} Found
              </Badge>
            </div>

            {filteredStations.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <MapPin className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-center text-muted-foreground">
                    {dataLoading ? 'Searching for stations...' : 'No charging stations found. Try adjusting your search or filters.'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredStations.map((station) => (
                <Card
                  key={station.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedStation?.id === station.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedStation(station)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base mb-1">{station.name}</CardTitle>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {station.address}
                        </p>
                      </div>
                      <Badge
                        variant={station.type === 'Ultra' ? 'destructive' : station.type === 'Fast' ? 'default' : 'secondary'}
                      >
                        {station.type}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${station.isOpen && station.available > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span>
                          {station.isOpen && station.available > 0 ? 'Available' : 'Unavailable'} • {station.available}/{station.total} chargers
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span>{station.rating.toFixed(1)} ({station.reviews} reviews)</span>
                      </div>
                      <span className="text-primary font-semibold">{station.price}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4" />
                      <span>{station.isOpen ? 'Open Now' : 'Closed'}</span>
                      <span className="text-muted-foreground">• {station.distance}</span>
                    </div>

                    {station.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-2">
                        {station.amenities.map((amenity, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGetDirections(station);
                        }}
                      >
                        <Navigation className="w-4 h-4 mr-1" />
                        Directions
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1"
                        disabled={!station.isOpen || station.available === 0}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedStation(station);
                          setReservationModalOpen(true);
                        }}
                      >
                        <Zap className="w-4 h-4 mr-1" />
                        Reserve
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      <Chatbot />
      <ReservationModal 
        open={reservationModalOpen} 
        onOpenChange={setReservationModalOpen}
        station={selectedStation}
      />
    </div>
  );
};

export default ChargingMapPage;
