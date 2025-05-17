
import { useState, useEffect } from "react";
import { getPrayerTimes, getNextPrayer, getTimeUntilNextPrayer, PrayerTimes as PrayerTimesType } from "@/services/prayerTimesAPI";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const PrayerTimes = () => {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimesType | null>(null);
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string } | null>(null);
  const [timeUntil, setTimeUntil] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchPrayerTimes = async () => {
      setIsLoading(true);
      try {
        // Try to get location
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            const times = await getPrayerTimes(latitude, longitude);
            
            if (times) {
              setPrayerTimes(times);
              const next = getNextPrayer(times);
              setNextPrayer(next);
              setTimeUntil(getTimeUntilNextPrayer(next));
            }
            setIsLoading(false);
          },
          (error) => {
            console.error("Error getting location:", error);
            toast.error("فشل في الوصول إلى موقعك. الرجاء تفعيل خدمة تحديد الموقع");
            setIsLoading(false);
          }
        );
      } catch (error) {
        console.error("Error fetching prayer times:", error);
        setIsLoading(false);
      }
    };
    
    fetchPrayerTimes();
    
    // Update time until next prayer
    const interval = setInterval(() => {
      if (prayerTimes && nextPrayer) {
        setTimeUntil(getTimeUntilNextPrayer(nextPrayer));
      }
    }, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);
  
  // Update next prayer when prayer times change
  useEffect(() => {
    if (prayerTimes) {
      const next = getNextPrayer(prayerTimes);
      setNextPrayer(next);
      setTimeUntil(getTimeUntilNextPrayer(next));
    }
  }, [prayerTimes]);
  
  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-6 text-center">أوقات الصلاة</h1>
      
      {isLoading ? (
        <PrayerTimesSkeleton />
      ) : prayerTimes ? (
        <>
          {/* Next Prayer Card */}
          <Card className="p-6 mb-6 bg-primary/5 border-primary/20">
            <h2 className="text-lg font-semibold mb-2">الصلاة القادمة</h2>
            {nextPrayer && (
              <>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-2xl font-bold">{nextPrayer.name}</span>
                  <span className="text-xl">{nextPrayer.time}</span>
                </div>
                <p className="text-muted-foreground">
                  متبقي: {timeUntil}
                </p>
              </>
            )}
          </Card>
          
          {/* Date Display */}
          <div className="text-center mb-6">
            <p className="text-lg font-medium">{prayerTimes.date}</p>
          </div>
          
          {/* Prayer Times List */}
          <div className="space-y-3">
            <PrayerTimeItem name="الفجر" time={prayerTimes.fajr} isActive={nextPrayer?.name === "الفجر"} />
            <PrayerTimeItem name="الشروق" time={prayerTimes.sunrise} isActive={nextPrayer?.name === "الشروق"} />
            <PrayerTimeItem name="الظهر" time={prayerTimes.dhuhr} isActive={nextPrayer?.name === "الظهر"} />
            <PrayerTimeItem name="العصر" time={prayerTimes.asr} isActive={nextPrayer?.name === "العصر"} />
            <PrayerTimeItem name="المغرب" time={prayerTimes.maghrib} isActive={nextPrayer?.name === "المغرب"} />
            <PrayerTimeItem name="العشاء" time={prayerTimes.isha} isActive={nextPrayer?.name === "العشاء"} />
          </div>
        </>
      ) : (
        <div className="text-center py-10">
          <p className="text-lg text-muted-foreground">
            فشل في جلب أوقات الصلاة. الرجاء التأكد من تفعيل خدمة تحديد الموقع والمحاولة مرة أخرى.
          </p>
        </div>
      )}
    </div>
  );
};

interface PrayerTimeItemProps {
  name: string;
  time: string;
  isActive: boolean;
}

const PrayerTimeItem = ({ name, time, isActive }: PrayerTimeItemProps) => {
  return (
    <div className={`flex justify-between p-4 rounded-md ${isActive ? 'bg-primary/10' : 'bg-card'}`}>
      <span className={`font-medium ${isActive ? 'text-primary' : ''}`}>{name}</span>
      <span>{time}</span>
    </div>
  );
};

const PrayerTimesSkeleton = () => (
  <>
    <Card className="p-6 mb-6">
      <Skeleton className="h-5 w-32 mb-4" />
      <Skeleton className="h-8 w-full mb-2" />
      <Skeleton className="h-4 w-40" />
    </Card>
    
    <Skeleton className="h-6 w-40 mx-auto mb-6" />
    
    <div className="space-y-3">
      {[...Array(6)].map((_, i) => (
        <Skeleton key={i} className="h-14 w-full" />
      ))}
    </div>
  </>
);

export default PrayerTimes;
