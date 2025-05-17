
import { useState, useEffect } from "react";
import { 
  getPrayerTimes, 
  getNextPrayer, 
  getTimeUntilNextPrayer, 
  PrayerTimes as PrayerTimesType,
  PRAYER_CALCULATION_METHODS
} from "@/services/prayerTimesAPI";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RefreshCw, MapPin } from "lucide-react";

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
      
      {/* اختيار طريقة حساب مواقيت الصلاة */}
      <div className="mb-6">
        <div className="flex gap-2 items-center">
          <Select value={calculationMethod.toString()} onValueChange={handleMethodChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="اختر طريقة حساب مواقيت الصلاة" />
            </SelectTrigger>
            <SelectContent>
              {PRAYER_CALCULATION_METHODS.map((method) => (
                <SelectItem key={method.id} value={method.id.toString()}>
                  {method.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => fetchPrayerTimes()} 
            disabled={isLoading}
            title="تحديث مواقيت الصلاة"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        
        <div className="mt-2 text-sm text-muted-foreground text-center">
          {calculationMethod === 101 ? (
            <p>مصدر البيانات: الهيئة العامة للشؤون الإسلامية والأوقاف - الإمارات العربية المتحدة</p>
          ) : (
            location && (
              <div className="flex items-center justify-center gap-1">
                <MapPin className="h-3 w-3" /> 
                <span>الموقع: {location.latitude.toFixed(2)}, {location.longitude.toFixed(2)}</span>
              </div>
            )
          )}
        </div>
      </div>
      
      {isLoading ? (
        <PrayerTimesSkeleton />
      ) : prayerTimes ? (
        <>
          {/* بطاقة الصلاة القادمة */}
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
          
          {/* عرض التاريخ */}
          <div className="text-center mb-6">
            <p className="text-lg font-medium">{prayerTimes.hijriDate}</p>
            <p className="text-sm text-muted-foreground">{prayerTimes.date}</p>
          </div>
          
          {/* قائمة مواقيت الصلاة */}
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
          <Button 
            variant="default" 
            onClick={fetchPrayerTimes} 
            className="mt-4"
          >
            إعادة المحاولة
          </Button>
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

