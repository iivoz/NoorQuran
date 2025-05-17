
import React from 'react';

interface DateDisplayProps {
  hijriDate: string;
  gregorianDate: string;
}

const DateDisplay = ({ hijriDate, gregorianDate }: DateDisplayProps) => {
  return (
    <div className="text-center mb-6">
      <p className="text-lg font-medium">{hijriDate}</p>
      <p className="text-sm text-muted-foreground">{gregorianDate}</p>
    </div>
  );
};

export default DateDisplay;
