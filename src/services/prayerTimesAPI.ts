
import { toast } from "sonner";

export interface PrayerTimes {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  date: string;
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
  };
}

export const getPrayerTimes = async (
  latitude: number, 
  longitude: number
): Promise<PrayerTimes | null> => {
  try {
    // Get current date
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    
    const response = await fetch(
      `https://api.aladhan.com/v1/timings/${day}-${month}-${year}?latitude=${latitude}&longitude=${longitude}&method=2`
    );
    
    const data: PrayerTimesResponse = await response.json();
    
    if (data.code === 200 && data.status === "OK") {
      return {
        fajr: data.data.timings.Fajr,
        sunrise: data.data.timings.Sunrise,
        dhuhr: data.data.timings.Dhuhr,
        asr: data.data.timings.Asr,
        maghrib: data.data.timings.Maghrib,
        isha: data.data.timings.Isha,
        date: data.data.date.hijri.date + " " + data.data.date.hijri.month.ar + " " + data.data.date.hijri.year
      };
    } else {
      throw new Error(data.status || "فشل في جلب أوقات الصلاة");
    }
  } catch (error) {
    console.error("Error fetching prayer times:", error);
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
  
  // If no prayer times are found after current time, return the first prayer of the next day
  return prayers[0];
};

export const getTimeUntilNextPrayer = (nextPrayer: { name: string; time: string }): string => {
  const currentTime = new Date();
  const [hours, minutes] = nextPrayer.time.split(":").map(Number);
  
  const prayerTime = new Date();
  prayerTime.setHours(hours, minutes, 0, 0);
  
  // If prayer time is earlier than current time, it's for the next day
  if (prayerTime < currentTime) {
    prayerTime.setDate(prayerTime.getDate() + 1);
  }
  
  // Calculate difference in minutes
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
