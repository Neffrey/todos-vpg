"use client";

// LIBRARIES
import { create } from "zustand";

// UTILS
import { COLOR_THEMES, type ColorTheme } from "~/server/db/schema";

export interface ThemeStoreType {
  colorTheme: ColorTheme;
  setColorTheme: (colorTheme: ColorTheme) => void;
  themeList: ColorTheme[];
}

const useThemeStore = create<ThemeStoreType>((set) => ({
  colorTheme: "galaxy",
  setColorTheme: (colorTheme) => {
    set(() => ({
      colorTheme,
    }));
    window.localStorage.setItem("theme", colorTheme);
  },
  themeList: [...COLOR_THEMES],
}));

export default useThemeStore;
