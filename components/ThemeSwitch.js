import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { FiSun, FiMoon } from "react-icons/fi";

export default function ThemeSwitch() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // useEffect는 클라이언트 사이드에서만 실행
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <button
      aria-label="테마 전환"
      className="flex items-center justify-center p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? (
        <>
          <FiSun className="w-5 h-5 mr-1" />
          <span className="text-sm">라이트 모드</span>
        </>
      ) : (
        <>
          <FiMoon className="w-5 h-5 mr-1" />
          <span className="text-sm">다크 모드</span>
        </>
      )}
    </button>
  );
}
