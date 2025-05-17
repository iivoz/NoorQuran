
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllSurahs, Surah } from "@/services/quranAPI";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const SurahList = () => {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [filteredSurahs, setFilteredSurahs] = useState<Surah[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchSurahs = async () => {
      setIsLoading(true);
      const data = await getAllSurahs();
      setSurahs(data);
      setFilteredSurahs(data);
      setIsLoading(false);
    };
    
    fetchSurahs();
  }, []);
  
  useEffect(() => {
    if (searchTerm) {
      const filtered = surahs.filter((surah) => 
        surah.name.includes(searchTerm) ||
        surah.number.toString().includes(searchTerm)
      );
      setFilteredSurahs(filtered);
    } else {
      setFilteredSurahs(surahs);
    }
  }, [searchTerm, surahs]);
  
  return (
    <div className="w-full">
      <div className="mb-6 relative">
        <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="بحث عن سورة..."
          className="pr-10 text-right"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <ul className="space-y-1">
        {isLoading ? (
          <>
            {[...Array(10)].map((_, i) => (
              <SurahSkeleton key={i} />
            ))}
          </>
        ) : (
          filteredSurahs.map((surah) => (
            <li key={surah.number}>
              <Link 
                to={`/surah/${surah.number}`}
                className="block bg-card hover:bg-accent/10 transition-colors p-4 rounded-md"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center bg-primary/10 rounded-full font-bold text-primary">
                      {surah.number}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">{surah.name}</h3>
                      <p className="text-muted-foreground text-xs">{surah.revelationType === "Meccan" ? "مكية" : "مدنية"} - {surah.numberOfAyahs} آية</p>
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

const SurahSkeleton = () => (
  <div className="p-4 bg-card rounded-md">
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-3">
        <Skeleton className="w-8 h-8 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    </div>
  </div>
);

export default SurahList;
