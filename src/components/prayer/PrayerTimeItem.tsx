
import React from 'react';

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

export default PrayerTimeItem;
