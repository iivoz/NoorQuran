
import React from 'react';
import PrayerTimeItem from './PrayerTimeItem';
import { PrayerTimes as PrayerTimesType } from "@/services/prayerTimesAPI";

interface PrayerTimesListProps {
  prayerTimes: PrayerTimesType;
  nextPrayer: { name: string; time: string } | null;
}

const PrayerTimesList = ({ prayerTimes, nextPrayer }: PrayerTimesListProps) => {
  return (
    <div className="space-y-3">
      <PrayerTimeItem name="الفجر" time={prayerTimes.fajr} isActive={nextPrayer?.name === "الفجر"} />
      <PrayerTimeItem name="الشروق" time={prayerTimes.sunrise} isActive={nextPrayer?.name === "الشروق"} />
      <PrayerTimeItem name="الظهر" time={prayerTimes.dhuhr} isActive={nextPrayer?.name === "الظهر"} />
      <PrayerTimeItem name="العصر" time={prayerTimes.asr} isActive={nextPrayer?.name === "العصر"} />
      <PrayerTimeItem name="المغرب" time={prayerTimes.maghrib} isActive={nextPrayer?.name === "المغرب"} />
      <PrayerTimeItem name="العشاء" time={prayerTimes.isha} isActive={nextPrayer?.name === "العشاء"} />
    </div>
  );
};

export default PrayerTimesList;
