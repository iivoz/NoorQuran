
import React from 'react';
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

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

export default PrayerTimesSkeleton;
