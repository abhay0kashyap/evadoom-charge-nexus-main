import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ChargingStation {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  placeId?: string;
}

interface ReservationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  station: ChargingStation | null;
}

const ReservationModal = ({ open, onOpenChange, station }: ReservationModalProps) => {
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("12:00");
  const [duration, setDuration] = useState("60");
  const [spot, setSpot] = useState("1");
  const [paymentMethod, setPaymentMethod] = useState("now");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const calculatePrice = () => {
    const hours = parseInt(duration) / 60;
    const pricePerHour = 0.35;
    return (hours * pricePerHour).toFixed(2);
  };

  const handleReservation = async () => {
    if (!station || !date) {
      toast({
        title: "Missing Information",
        description: "Please select a date and time",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to make a reservation",
          variant: "destructive"
        });
        return;
      }

      // Combine date and time
      const [hours, minutes] = time.split(':');
      const reservationDateTime = new Date(date);
      reservationDateTime.setHours(parseInt(hours), parseInt(minutes));

      // Create reservation
      const { data: reservation, error: reservationError } = await supabase
        .from('reservations')
        .insert({
          user_id: user.id,
          station_id: station.placeId || station.id.toString(),
          station_name: station.name,
          latitude: station.latitude,
          longitude: station.longitude,
          reservation_time: reservationDateTime.toISOString(),
          duration: parseInt(duration),
          status: paymentMethod === 'now' ? 'confirmed' : 'pending',
          payment_status: paymentMethod === 'now' ? 'paid' : 'unpaid',
          price: parseFloat(calculatePrice())
        })
        .select()
        .single();

      if (reservationError) throw reservationError;

      // Create user notification
      await supabase.from('notifications').insert({
        user_id: user.id,
        type: 'reservation',
        title: 'Reservation Confirmed',
        message: `Your reservation at ${station.name} is ${paymentMethod === 'now' ? 'confirmed' : 'pending payment'}`,
        related_reservation_id: reservation.id
      });

      // Create admin notification (broadcast to all admins - you'd need admin role system)
      await supabase.from('notifications').insert({
        user_id: null, // Admin notification
        type: 'admin',
        title: 'New Reservation',
        message: `New reservation at ${station.name} for ${format(reservationDateTime, 'PPP p')}`,
        related_reservation_id: reservation.id
      });

      toast({
        title: "Reservation Successful",
        description: `Your spot at ${station.name} is ${paymentMethod === 'now' ? 'confirmed' : 'pending payment'}`
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Reservation error:', error);
      toast({
        title: "Reservation Failed",
        description: "Unable to create reservation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reserve Charging Spot</DialogTitle>
        </DialogHeader>

        {station && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-foreground">{station.name}</h3>
              <p className="text-sm text-muted-foreground">{station.address}</p>
            </div>

            <div className="space-y-2">
              <Label>Charging Spot</Label>
              <RadioGroup value={spot} onValueChange={setSpot}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="spot1" />
                  <Label htmlFor="spot1">Spot 1 - Fast Charger</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="2" id="spot2" />
                  <Label htmlFor="spot2">Spot 2 - Ultra Charger</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="3" id="spot3" />
                  <Label htmlFor="spot3">Spot 3 - Normal Charger</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                min="30"
                step="30"
              />
            </div>

            <div className="space-y-2">
              <Label>Payment</Label>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="now" id="pay-now" />
                  <Label htmlFor="pay-now">Pay Now (${calculatePrice()})</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="later" id="pay-later" />
                  <Label htmlFor="pay-later">Pay Later (${calculatePrice()})</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <div>
                <p className="text-sm text-muted-foreground">Total Price</p>
                <p className="text-2xl font-bold text-primary">${calculatePrice()}</p>
              </div>
              <Button onClick={handleReservation} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {paymentMethod === 'now' ? 'Pay & Reserve' : 'Reserve Now'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ReservationModal;
