
import { toast } from "sonner";

export interface PrayerTimes {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  date: string;
  hijriDate: string;
  method: number;
}

export interface PrayerTimesResponse {
  code: number;
  status: string;
  data: {
    timings: {
      Fajr: string;
      Sunrise: string;
      Dhuhr: string;
      Asr: string;
      Maghrib: string;
      Isha: string;
    };
    date: {
      readable: string;
      timestamp: string;
      hijri: {
        date: string;
        month: {
          ar: string;
        };
        year: string;
      };
    };
    meta: {
      method: {
        id: number;
        name: string;
      };
    };
  };
}

// طرق حساب مواقيت الصلاة المتاحة
export const PRAYER_CALCULATION_METHODS = [
  { id: 1, name: "جامعة أم القرى، مكة المكرمة" },
  { id: 2, name: "الجمعية الإسلامية لأمريكا الشمالية (ISNA)" },
  { id: 3, name: "رابطة العالم الإسلامي" },
  { id: 4, name: "جامعة العلوم الإسلامية، كراتشي" },
  { id: 5, name: "الاتحاد الإسلامي العالمي" },
  { id: 7, name: "هيئة المساحة المصرية" },
  { id: 8, name: "معهد الجيوفيزياء، جامعة طهران" },
  { id: 9, name: "المنطقة الإسلامية لأمريكا الشمالية" },
  { id: 10, name: "الكويت" },
  { id: 11, name: "قطر" },
  { id: 12, name: "إدارة البحوث الإسلامية، سنغافورة" },
  { id: 13, name: "عمان" },
  { id: 14, name: "الهيئة العامة للمساحة، الإمارات العربية المتحدة" },
  { id: 15, name: "الأردن" },
];

export const getPrayerTimes = async (
  latitude: number, 
  longitude: number,
  methodId: number = 3 // استخدام رابطة العالم الإسلامي افتراضياً
): Promise<PrayerTimes | null> => {
  try {
    // الحصول على التاريخ الحالي
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    
    const url = `https://api.aladhan.com/v1/timings/${day}-${month}-${year}?latitude=${latitude}&longitude=${longitude}&method=${methodId}`;
    
    console.log(`جاري طلب مواقيت الصلاة من: ${url}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`فشل في جلب البيانات: ${response.status} ${response.statusText}`);
    }
    
    const data: PrayerTimesResponse = await response.json();
    
    if (data.code === 200 && data.status === "OK") {
      console.log("تم استلام بيانات مواقيت الصلاة بنجاح:", data);
      
      return {
        fajr: data.data.timings.Fajr,
        sunrise: data.data.timings.Sunrise,
        dhuhr: data.data.timings.Dhuhr,
        asr: data.data.timings.Asr,
        maghrib: data.data.timings.Maghrib,
        isha: data.data.timings.Isha,
        date: data.data.date.readable,
        hijriDate: data.data.date.hijri.date + " " + data.data.date.hijri.month.ar + " " + data.data.date.hijri.year,
        method: data.data.meta.method.id
      };
    } else {
      throw new Error(data.status || "فشل في جلب أوقات الصلاة");
    }
  } catch (error) {
    console.error("حدث خطأ أثناء جلب مواقيت الصلاة:", error);
    toast.error("فشل في جلب أوقات الصلاة");
    return null;
  }
};

export const getNextPrayer = (prayerTimes: PrayerTimes): { name: string; time: string } => {
  const currentTime = new Date();
  const currentHours = currentTime.getHours();
  const currentMinutes = currentTime.getMinutes();
  
  const prayers = [
    { name: "الفجر", time: prayerTimes.fajr },
    { name: "الشروق", time: prayerTimes.sunrise },
    { name: "الظهر", time: prayerTimes.dhuhr },
    { name: "العصر", time: prayerTimes.asr },
    { name: "المغرب", time: prayerTimes.maghrib },
    { name: "العشاء", time: prayerTimes.isha }
  ];
  
  for (const prayer of prayers) {
    const [prayerHours, prayerMinutes] = prayer.time.split(":").map(Number);
    
    if (
      prayerHours > currentHours ||
      (prayerHours === currentHours && prayerMinutes > currentMinutes)
    ) {
      return prayer;
    }
  }
  
  // إذا لم يتم العثور على صلاة بعد الوقت الحالي، ارجع صلاة الفجر لليوم التالي
  return prayers[0];
};

export const getTimeUntilNextPrayer = (nextPrayer: { name: string; time: string }): string => {
  const currentTime = new Date();
  const [hours, minutes] = nextPrayer.time.split(":").map(Number);
  
  const prayerTime = new Date();
  prayerTime.setHours(hours, minutes, 0, 0);
  
  // إذا كان وقت الصلاة أبكر من الوقت الحالي، فهو لليوم التالي
  if (prayerTime < currentTime) {
    prayerTime.setDate(prayerTime.getDate() + 1);
  }
  
  // حساب الفرق بالدقائق
  const diffMs = prayerTime.getTime() - currentTime.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  const hours_remaining = Math.floor(diffMins / 60);
  const minutes_remaining = diffMins % 60;
  
  if (hours_remaining > 0) {
    return `${hours_remaining} ساعة و ${minutes_remaining} دقيقة`;
  } else {
    return `${minutes_remaining} دقيقة`;
  }
};
