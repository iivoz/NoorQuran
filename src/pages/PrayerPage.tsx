
import AppLayout from "@/components/AppLayout";
import PrayerTimes from "@/components/PrayerTimes";

const PrayerPage = () => {
  return (
    <AppLayout>
      <div className="container max-w-lg mx-auto px-4 py-6">
        <PrayerTimes />
      </div>
    </AppLayout>
  );
};

export default PrayerPage;
