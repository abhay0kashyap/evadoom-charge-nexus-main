import { useEffect, useState } from "react";
import { Car } from "lucide-react";

const ScrollingCar = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const carPosition = Math.min(scrollY * 0.3, window.innerWidth + 100);
  const carOpacity = scrollY > 100 ? Math.max(1 - (scrollY - 100) / 1000, 0) : 0;

  return (
    <div
      className="fixed top-1/2 z-10 pointer-events-none"
      style={{
        left: `${carPosition - 100}px`,
        opacity: carOpacity,
        transform: 'translateY(-50%)',
        transition: 'opacity 0.3s ease-out'
      }}
    >
      <div className="relative">
        <Car className="w-16 h-16 text-evadoom-primary drop-shadow-lg" />
        <div className="absolute inset-0 w-16 h-16 bg-evadoom-primary/20 blur-xl rounded-full"></div>
        {/* Speed lines */}
        <div className="absolute top-1/2 -left-8 w-6 h-0.5 bg-evadoom-primary/60 transform -translate-y-1/2"></div>
        <div className="absolute top-1/2 -left-6 w-4 h-0.5 bg-evadoom-primary/40 transform -translate-y-1/2"></div>
        <div className="absolute top-1/2 -left-4 w-2 h-0.5 bg-evadoom-primary/20 transform -translate-y-1/2"></div>
      </div>
    </div>
  );
};

export default ScrollingCar;