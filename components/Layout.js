import { useTheme } from "../context/ThemeContext";
import { SunIcon, MoonIcon } from "./Icons";

export default function Layout({ children }) {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
      <button
        onClick={toggleDarkMode}
        className="fixed top-4 right-4 p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        aria-label="Toggle theme"
      >
        {darkMode ? <SunIcon /> : <MoonIcon />}
      </button>
      {children}
    </div>
  );
}
