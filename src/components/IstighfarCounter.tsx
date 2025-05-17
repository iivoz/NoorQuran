
import { useState, useEffect, useRef } from "react";
import {
  getCounterData,
  incrementCounter,
  updateDailyGoal,
  resetCounter,
  CounterData
} from "@/services/counterService";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Repeat, RefreshCcw } from "lucide-react";

const IstighfarCounter = () => {
  const [counter, setCounter] = useState<CounterData>(getCounterData());
  const [goalInput, setGoalInput] = useState(counter.dailyGoal.toString());
  const [showRipple, setShowRipple] = useState(false);
  const [ripplePosition, setRipplePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Initialize counter data from localStorage
    setCounter(getCounterData());
  }, []);
  
  const handleIncrement = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setRipplePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setShowRipple(true);
      
      // Hide ripple after animation completes
      setTimeout(() => setShowRipple(false), 600);
    }
    
    const updatedCounter = incrementCounter();
    setCounter(updatedCounter);
    
    if (updatedCounter.count === updatedCounter.dailyGoal) {
      toast.success("ما شاء الله! لقد أكملت هدفك اليومي");
    } else if (updatedCounter.count % 33 === 0) {
      toast.success(`ما شاء الله! ${updatedCounter.count} استغفار`);
    }
  };
  
  const handleUpdateGoal = () => {
    const goal = parseInt(goalInput, 10);
    if (isNaN(goal) || goal < 1) {
      toast.error("الرجاء إدخال رقم صحيح أكبر من الصفر");
      setGoalInput(counter.dailyGoal.toString());
      return;
    }
    
    const updatedCounter = updateDailyGoal(goal);
    setCounter(updatedCounter);
    toast.success(`تم تحديث الهدف اليومي إلى ${goal}`);
  };
  
  const handleReset = () => {
    const resetData = resetCounter();
    setCounter(resetData);
    toast.success("تم إعادة تعيين العداد");
  };
  
  const percentage = (counter.count / counter.dailyGoal) * 100;
  
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-2xl font-bold mb-4">سَبِّح واستغفر</h1>
      
      <div className="w-64 h-64 mb-6" ref={containerRef}>
        <div 
          className="ripple-container w-full h-full cursor-pointer"
          onClick={handleIncrement}
        >
          <CircularProgressbar
            value={percentage}
            text={counter.count.toString()}
            background
            backgroundPadding={6}
            styles={buildStyles({
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              textColor: "var(--foreground)",
              textSize: "1.8rem",
              pathColor: "hsl(var(--primary))",
              trailColor: "rgba(var(--primary), 0.1)"
            })}
          />
          
          {showRipple && (
            <div 
              className="ripple"
              style={{
                left: ripplePosition.x,
                top: ripplePosition.y,
                width: 10,
                height: 10
              }}
            />
          )}
        </div>
      </div>
      
      <div className="mb-6">
        <p className="text-center mb-1">أستغفر الله العظيم وأتوب إليه</p>
        <p className="text-muted-foreground text-sm text-center">
          {counter.count} / {counter.dailyGoal} ({Math.round(percentage)}%)
        </p>
      </div>
      
      <div className="flex gap-2 items-center mb-8">
        <Input
          className="w-24 text-center"
          value={goalInput}
          onChange={(e) => setGoalInput(e.target.value)}
          type="number"
          min="1"
        />
        <Button onClick={handleUpdateGoal}>تعديل الهدف</Button>
      </div>
      
      <Button variant="outline" onClick={handleReset} className="gap-2">
        <RefreshCcw className="h-4 w-4" />
        إعادة تعيين
      </Button>
      
      <div className="mt-8 space-y-4 w-full max-w-md">
        <DhikrButton text="أستغفر الله العظيم وأتوب إليه" onIncrement={handleIncrement} />
        <DhikrButton text="لا إله إلا الله" onIncrement={handleIncrement} />
        <DhikrButton text="سبحان الله وبحمده" onIncrement={handleIncrement} />
      </div>
    </div>
  );
};

interface DhikrButtonProps {
  text: string;
  onIncrement: (e: React.MouseEvent) => void;
}

const DhikrButton = ({ text, onIncrement }: DhikrButtonProps) => (
  <Button
    variant="secondary"
    className="w-full py-6 text-lg flex gap-2"
    onClick={onIncrement}
  >
    <Repeat className="h-4 w-4" />
    {text}
  </Button>
);

export default IstighfarCounter;
