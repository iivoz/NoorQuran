
import React from 'react';
import { PRAYER_CALCULATION_METHODS } from "@/services/prayerTimesAPI";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RefreshCw, MapPin } from "lucide-react";

interface CalculationMethodSelectorProps {
  calculationMethod: number;
  onMethodChange: (value: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
  location: { latitude: number; longitude: number } | null;
}

const CalculationMethodSelector = ({
  calculationMethod,
  onMethodChange,
  onRefresh,
  isLoading,
  location
}: CalculationMethodSelectorProps) => {
  return (
    <div className="mb-6">
      <div className="flex gap-2 items-center">
        <Select value={calculationMethod.toString()} onValueChange={onMethodChange}>
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
          onClick={onRefresh} 
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
  );
};

export default CalculationMethodSelector;
