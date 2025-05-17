
import React from 'react';
import { Card } from "@/components/ui/card";

interface NextPrayerCardProps {
  nextPrayer: { name: string; time: string } | null;
  timeUntil: string;
}

const NextPrayerCard = ({ nextPrayer, timeUntil }: NextPrayerCardProps) => {
  if (!nextPrayer) return null;
  
  return (
    <Card className="p-6 mb-6 bg-primary/5 border-primary/20">
      <h2 className="text-lg font-semibold mb-2">الصلاة القادمة</h2>
      <div className="flex justify-between items-center mb-2">
        <span className="text-2xl font-bold">{nextPrayer.name}</span>
        <span className="text-xl">{nextPrayer.time}</span>
      </div>
      <p className="text-muted-foreground">
        متبقي: {timeUntil}
      </p>
    </Card>
  );
};

export default NextPrayerCard;
