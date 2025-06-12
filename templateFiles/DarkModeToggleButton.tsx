import { useDarkMode } from "./useDarkMode";
import { Moon, Sun } from "lucide-react";

const DarkModeToggleButton = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  return (
    <button
      onClick={toggleDarkMode}
      type="button"
      className="rounded-full size-8 bg-black text-white dark:bg-white dark:text-black flex justify-center items-center"
    >
      {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
};

export default DarkModeToggleButton;
