import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { latitude, longitude, radius = 7000, searchType = 'nearby', bounds, address } = await req.json();
    
    const GOOGLE_PLACES_API_KEY = Deno.env.get('GOOGLE_PLACES_API_KEY');
    
    if (!GOOGLE_PLACES_API_KEY) {
      console.error('GOOGLE_PLACES_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle geocoding request
    if (searchType === 'geocode' && address) {
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_PLACES_API_KEY}`;
      console.log('Geocoding address:', address);
      
      const geocodeResponse = await fetch(geocodeUrl);
      const geocodeData = await geocodeResponse.json();

      if (geocodeData.status === 'OK' && geocodeData.results.length > 0) {
        const location = geocodeData.results[0].geometry.location;
        return new Response(
          JSON.stringify({ 
            location: {
              lat: location.lat,
              lng: location.lng
            },
            address: geocodeData.results[0].formatted_address
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        return new Response(
          JSON.stringify({ error: 'Location not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    let url = '';
    
    // Support different search types
    if (searchType === 'global') {
      // Global text search for worldwide results
      url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=ev+charging+stations&key=${GOOGLE_PLACES_API_KEY}`;
      console.log('Fetching global charging stations');
    } else if (searchType === 'viewport' && bounds) {
      // Viewport-based search using bounds
      const { north, south, east, west } = bounds;
      url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${(north + south) / 2},${(east + west) / 2}&radius=${radius}&type=charging_station&key=${GOOGLE_PLACES_API_KEY}`;
      console.log('Fetching charging stations for viewport:', bounds);
    } else {
      // Default nearby search
      if (!latitude || !longitude) {
        return new Response(
          JSON.stringify({ error: 'Latitude and longitude are required for nearby search' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=charging_station&key=${GOOGLE_PLACES_API_KEY}`;
      console.log('Fetching charging stations for location:', { latitude, longitude, radius });
    }
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Google Places API error:', data.status, data.error_message);
      return new Response(
        JSON.stringify({ error: `Google Places API error: ${data.status}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const stations = (data.results || []).map((place: any, index: number) => ({
      id: index + 1,
      placeId: place.place_id,
      name: place.name,
      address: place.vicinity || place.formatted_address || 'Address not available',
      latitude: place.geometry.location.lat,
      longitude: place.geometry.location.lng,
      rating: place.rating || 0,
      isOpen: place.opening_hours?.open_now ?? false,
      reviews: place.user_ratings_total || 0,
      available: place.opening_hours?.open_now ? Math.floor(Math.random() * 3) + 1 : 0,
      total: 4,
      type: ['Fast', 'Normal', 'Ultra'][Math.floor(Math.random() * 3)] as 'Fast' | 'Normal' | 'Ultra',
      price: `$${(Math.random() * 0.5 + 0.15).toFixed(2)}/kWh`,
      amenities: ['WiFi', 'Restrooms', '24/7'].filter(() => Math.random() > 0.5)
    }));

    // Calculate distance for each station (simple approximation)
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371; // Earth's radius in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return (R * c).toFixed(1);
    };

    const stationsWithDistance = stations.map(station => ({
      ...station,
      distance: `${calculateDistance(latitude, longitude, station.latitude, station.longitude)} km`
    }));

    console.log(`Successfully fetched ${stationsWithDistance.length} charging stations`);

    return new Response(
      JSON.stringify({ stations: stationsWithDistance, count: stationsWithDistance.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in fetch-charging-stations:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
