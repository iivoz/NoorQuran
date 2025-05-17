
import React from 'react';
import { Button } from "@/components/ui/button";

interface PrayerTimesErrorProps {
  onRetry: () => void;
}

const PrayerTimesError = ({ onRetry }: PrayerTimesErrorProps) => {
  return (
    <div className="text-center py-10">
      <p className="text-lg text-muted-foreground">
        فشل في جلب أوقات الصلاة. الرجاء التأكد من تفعيل خدمة تحديد الموقع والمحاولة مرة أخرى.
      </p>
      <Button 
        variant="default" 
        onClick={onRetry} 
        className="mt-4"
      >
        إعادة المحاولة
      </Button>
    </div>
  );
};

export default PrayerTimesError;
