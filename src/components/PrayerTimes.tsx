
import { useState, useEffect } from "react";
import { 
  getPrayerTimes, 
  getNextPrayer, 
  getTimeUntilNextPrayer, 
  PrayerTimes as PrayerTimesType
} from "@/services/prayerTimesAPI";
import { toast } from "sonner";

// استيراد المكونات الفرعية الجديدة
import NextPrayerCard from "./prayer/NextPrayerCard";
import PrayerTimesList from "./prayer/PrayerTimesList";
import DateDisplay from "./prayer/DateDisplay";
import PrayerTimesSkeleton from "./prayer/PrayerTimesSkeleton";
import CalculationMethodSelector from "./prayer/CalculationMethodSelector";
import PrayerTimesError from "./prayer/PrayerTimesError";

const PrayerTimes = () => {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimesType | null>(null);
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string } | null>(null);
  const [timeUntil, setTimeUntil] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [calculationMethod, setCalculationMethod] = useState<number>(() => {
    // استرجاع طريقة الحساب المحفوظة أو استخدام القيمة الافتراضية (101 للأوقاف الإماراتية)
    const savedMethod = localStorage.getItem("prayerCalculationMethod");
    return savedMethod ? Number(savedMethod) : 101;
  });
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationType, setLocationType] = useState<"auto" | "custom">("auto");
  
  // استرجاع الموقع وتخزينه
  const getLocation = (): Promise<{latitude: number; longitude: number}> => {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            const locationData = { latitude, longitude };
            setLocation(locationData);
            localStorage.setItem("prayerLocation", JSON.stringify(locationData));
            resolve(locationData);
          },
          (error) => {
            console.error("خطأ في الحصول على الموقع:", error);
            // محاولة استخدام الموقع المخزن مسبقًا
            const savedLocation = localStorage.getItem("prayerLocation");
            if (savedLocation) {
              const parsedLocation = JSON.parse(savedLocation);
              setLocation(parsedLocation);
              resolve(parsedLocation);
            } else {
              // استخدام موقع افتراضي إذا لم يكن هناك موقع محفوظ (دبي)
              const defaultLocation = { latitude: 25.276987, longitude: 55.296249 };
              setLocation(defaultLocation);
              localStorage.setItem("prayerLocation", JSON.stringify(defaultLocation));
              toast.warning("تم استخدام موقع افتراضي (دبي). يرجى تفعيل خدمة تحديد الموقع للحصول على أوقات صلاة أكثر دقة.");
              resolve(defaultLocation);
            }
          }
        );
      } else {
        // استخدام موقع افتراضي إذا لم يكن تحديد الموقع مدعوماً (دبي)
        const defaultLocation = { latitude: 25.276987, longitude: 55.296249 };
        setLocation(defaultLocation);
        localStorage.setItem("prayerLocation", JSON.stringify(defaultLocation));
        toast.warning("متصفحك لا يدعم خدمة تحديد الموقع. تم استخدام موقع افتراضي (دبي).");
        resolve(defaultLocation);
      }
    });
  };
  
  const fetchPrayerTimes = async () => {
    setIsLoading(true);
    try {
      let coords;
      
      // استخدام الموقع الحالي أو محاولة الحصول على موقع جديد
      if (location) {
        coords = location;
      } else {
        coords = await getLocation();
      }
      
      const times = await getPrayerTimes(coords.latitude, coords.longitude, calculationMethod);
      
      if (times) {
        setPrayerTimes(times);
        const next = getNextPrayer(times);
        setNextPrayer(next);
        setTimeUntil(getTimeUntilNextPrayer(next));
        
        // حفظ طريقة الحساب إذا تغيرت
        localStorage.setItem("prayerCalculationMethod", calculationMethod.toString());
        toast.success("تم تحديث مواقيت الصلاة بنجاح");
      }
    } catch (error) {
      console.error("خطأ في جلب مواقيت الصلاة:", error);
      toast.error("فشل في تحديث مواقيت الصلاة");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleMethodChange = (value: string) => {
    const methodId = Number(value);
    setCalculationMethod(methodId);
  };
  
  useEffect(() => {
    fetchPrayerTimes();
    
    // تحديث الوقت المتبقي حتى الصلاة القادمة
    const interval = setInterval(() => {
      if (prayerTimes && nextPrayer) {
        setTimeUntil(getTimeUntilNextPrayer(nextPrayer));
      }
    }, 60000); // تحديث كل دقيقة
    
    return () => clearInterval(interval);
  }, [calculationMethod]);
  
  // تحديث الصلاة القادمة عند تغيير مواقيت الصلاة
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
      
      <CalculationMethodSelector
        calculationMethod={calculationMethod}
        onMethodChange={handleMethodChange}
        onRefresh={fetchPrayerTimes}
        isLoading={isLoading}
        location={location}
      />
      
      {isLoading ? (
        <PrayerTimesSkeleton />
      ) : prayerTimes ? (
        <>
          <NextPrayerCard nextPrayer={nextPrayer} timeUntil={timeUntil} />
          
          <DateDisplay 
            hijriDate={prayerTimes.hijriDate} 
            gregorianDate={prayerTimes.date} 
          />
          
          <PrayerTimesList prayerTimes={prayerTimes} nextPrayer={nextPrayer} />
        </>
      ) : (
        <PrayerTimesError onRetry={fetchPrayerTimes} />
      )}
    </div>
  );
};

export default PrayerTimes;
