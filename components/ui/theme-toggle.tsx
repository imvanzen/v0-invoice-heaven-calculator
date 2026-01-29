"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const cycleTheme = () => {
    if (!mounted) return;

    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  const getIcon = () => {
    if (!mounted) {
      return <Monitor className="h-[1.2rem] w-[1.2rem]" />;
    }

    if (theme === "light") {
      return <Sun className="h-[1.2rem] w-[1.2rem]" />;
    } else if (theme === "dark") {
      return <Moon className="h-[1.2rem] w-[1.2rem]" />;
    } else {
      return <Monitor className="h-[1.2rem] w-[1.2rem]" />;
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      aria-label="Toggle theme"
      onClick={cycleTheme}
    >
      {getIcon()}
    </Button>
  );
}
