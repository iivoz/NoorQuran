
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getSurah, SurahDetail as SurahDetailType } from "@/services/quranAPI";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";

const SurahDetail = () => {
  const { surahNumber } = useParams();
  const [surah, setSurah] = useState<SurahDetailType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchSurah = async () => {
      setIsLoading(true);
      if (surahNumber) {
        const data = await getSurah(parseInt(surahNumber, 10));
        setSurah(data);
      }
      setIsLoading(false);
    };
    
    fetchSurah();
  }, [surahNumber]);
  
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    toast.success("تم الانتقال إلى أعلى الصفحة");
  };
  
  const handleScrollToBottom = () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    toast.success("تم الانتقال إلى أسفل الصفحة");
  };
  
  return (
    <div className="relative">
      {isLoading ? (
        <SurahDetailSkeleton />
      ) : surah ? (
        <>
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">{surah.name}</h1>
            <p className="text-muted-foreground">
              {surah.revelationType === "Meccan" ? "مكية" : "مدنية"} - {surah.numberOfAyahs} آية
            </p>
            <div className="mt-4">
              <p className="text-center text-2xl font-bold">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </p>
            </div>
          </div>
          
          <div className="quran-text text-xl space-y-6 mb-16">
            {surah.ayahs.map((ayah) => (
              <p key={ayah.number} className="leading-loose">
                {ayah.text}
                <span className="inline-block mr-2 p-1 rounded-full bg-primary/10 text-primary text-sm">
                  {ayah.numberInSurah}
                </span>
              </p>
            ))}
          </div>
          
          <div className="mt-6 flex justify-between">
            {parseInt(surahNumber!) > 1 && (
              <Link to={`/surah/${parseInt(surahNumber!) - 1}`}>
                <Button>السورة السابقة</Button>
              </Link>
            )}
            {parseInt(surahNumber!) < 114 && (
              <Link to={`/surah/${parseInt(surahNumber!) + 1}`}>
                <Button>السورة التالية</Button>
              </Link>
            )}
          </div>
          
          {/* Floating navigation buttons */}
          <div className="fixed bottom-20 left-6 flex flex-col gap-2">
            <Button variant="outline" size="icon" className="rounded-full" onClick={handleScrollToTop}>
              <ArrowUp className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full" onClick={handleScrollToBottom}>
              <ArrowDown className="h-4 w-4" />
            </Button>
          </div>
        </>
      ) : (
        <div className="text-center py-20">
          <p className="text-xl text-muted-foreground">عذراً، لم نتمكن من العثور على هذه السورة</p>
          <Link to="/" className="mt-4 inline-block">
            <Button>العودة إلى قائمة السور</Button>
          </Link>
        </div>
      )}
    </div>
  );
};

const SurahDetailSkeleton = () => (
  <div>
    <div className="mb-8 text-center">
      <Skeleton className="h-8 w-40 mx-auto mb-2" />
      <Skeleton className="h-4 w-32 mx-auto" />
    </div>
    
    {[...Array(10)].map((_, i) => (
      <div key={i} className="mb-6">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-5/6 mt-2" />
        <Skeleton className="h-6 w-4/6 mt-2" />
      </div>
    ))}
  </div>
);

export default SurahDetail;
