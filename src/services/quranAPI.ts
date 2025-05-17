
import { toast } from "sonner";

export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  page: number;
}

export interface CompleteQuran {
  surahs: Surah[];
}

export interface SurahDetail {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string;
  numberOfAyahs: number;
  ayahs: Ayah[];
}

// Get all surahs
export const getAllSurahs = async (): Promise<Surah[]> => {
  try {
    const response = await fetch('https://api.alquran.cloud/v1/surah');
    const data = await response.json();
    
    if (data.code === 200 && data.status === "OK") {
      return data.data;
    } else {
      throw new Error(data.message || "فشل في جلب السور");
    }
  } catch (error) {
    console.error("Error fetching surahs:", error);
    toast.error("فشل في جلب السور");
    return [];
  }
};

// Get a specific surah
export const getSurah = async (surahNumber: number): Promise<SurahDetail | null> => {
  try {
    const response = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}`);
    const data = await response.json();
    
    if (data.code === 200 && data.status === "OK") {
      return data.data;
    } else {
      throw new Error(data.message || "فشل في جلب السورة");
    }
  } catch (error) {
    console.error(`Error fetching surah ${surahNumber}:`, error);
    toast.error("فشل في جلب السورة");
    return null;
  }
};

// Get audio for a specific surah
export const getSurahAudio = async (surahNumber: number, reciter: string = "ar.alafasy"): Promise<string | null> => {
  try {
    const response = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/${reciter}`);
    const data = await response.json();
    
    if (data.code === 200 && data.status === "OK") {
      // Find the audio URL in the response
      return data.data.audioUrl || null;
    } else {
      throw new Error(data.message || "فشل في جلب الصوت");
    }
  } catch (error) {
    console.error(`Error fetching audio for surah ${surahNumber}:`, error);
    toast.error("فشل في جلب الصوت");
    return null;
  }
};
