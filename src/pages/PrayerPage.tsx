
import AppLayout from "@/components/AppLayout";
import PrayerTimes from "@/components/PrayerTimes";

const PrayerPage = () => {
  return (
    <AppLayout>
      <div className="container max-w-xl mx-auto px-4 py-6">
        <PrayerTimes />
      </div>
    </AppLayout>
  );
};

export default PrayerPage;
