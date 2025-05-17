
export interface CounterData {
  count: number;
  dailyGoal: number;
  resetDate: string;
}

const COUNTER_STORAGE_KEY = "istighfar_counter";

export const getCounterData = (): CounterData => {
  const today = new Date().toDateString();
  const defaultData: CounterData = {
    count: 0,
    dailyGoal: 100,
    resetDate: today
  };
  
  try {
    const storedData = localStorage.getItem(COUNTER_STORAGE_KEY);
    
    if (!storedData) {
      return defaultData;
    }
    
    const data: CounterData = JSON.parse(storedData);
    
    // Check if we need to reset for a new day
    if (data.resetDate !== today) {
      data.count = 0;
      data.resetDate = today;
      saveCounterData(data);
    }
    
    return data;
  } catch (error) {
    console.error("Error getting counter data:", error);
    return defaultData;
  }
};

export const saveCounterData = (data: CounterData): void => {
  try {
    localStorage.setItem(COUNTER_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Error saving counter data:", error);
  }
};

export const incrementCounter = (): CounterData => {
  const data = getCounterData();
  data.count += 1;
  saveCounterData(data);
  return data;
};

export const updateDailyGoal = (goal: number): CounterData => {
  if (goal < 1) goal = 1; // Ensure the goal is at least 1
  
  const data = getCounterData();
  data.dailyGoal = goal;
  saveCounterData(data);
  return data;
};

export const resetCounter = (): CounterData => {
  const today = new Date().toDateString();
  const data = getCounterData();
  
  data.count = 0;
  data.resetDate = today;
  
  saveCounterData(data);
  return data;
};
