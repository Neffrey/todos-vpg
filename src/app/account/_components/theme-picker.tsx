"use client";

// LIBS
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useEffect } from "react";
import { FaMoon, FaStar, FaSun } from "react-icons/fa";

// UTILS
import { type LdTheme, ldThemes, type ColorTheme } from "~/server/db/schema";
import { api } from "~/trpc/react";

// COMPONENTS
import UseOnRender from "~/components/hooks/use-on-render";
import useThemeStore from "~/components/stores/theme-store";
import { Switch } from "~/components/ui/switch";
import { DivedToast } from "~/components/ui/toast";
import { useToast } from "~/components/ui/use-toast";

// COMP
const ThemePicker = () => {
  const { toast } = useToast();

  // Color Theme States
  const colorTheme = useThemeStore((state) => state.colorTheme);
  const themeList = useThemeStore((state) => state.themeList);
  const setColorTheme = useThemeStore((state) => state.setColorTheme);

  // Next Themes
  const { theme: ldTheme, setTheme: setLdTheme } = useTheme();

  // Effect to trigger Theme Change in localStorage
  useEffect(() => {
    const localTheme = window.localStorage.getItem("theme");
    if (localTheme !== null && themeList.includes(localTheme as ColorTheme)) {
      setColorTheme(localTheme as ColorTheme);
    } else window.localStorage.setItem("theme", colorTheme);
  }, [setColorTheme, colorTheme, themeList]);

  const { update: updateSession } = useSession();

  const editUser = api.user.edit.useMutation({
    onSuccess: async () => {
      await updateSession();
      toast({
        action: (
          <DivedToast type="success">{"Theme has been changed!"}</DivedToast>
        ),
      });
    },
  });

  const handleLdThemeChange = (input?: LdTheme) => {
    if (input === ldTheme) return;

    // Toggle ldTheme
    if (input === undefined) {
      // If light theme, set dark theme
      if (ldTheme === ldThemes[0]) {
        setLdTheme(ldThemes[1]);
        editUser.mutate({ ldTheme: ldThemes[1] });
      } else {
        setLdTheme(ldThemes[0]);
        editUser.mutate({ ldTheme: ldThemes[0] });
      }
      return;
    }

    // Set specific ldTheme
    setLdTheme(input);
    editUser.mutate({ ldTheme: input });
  };

  const handleColorThemeChange = (input: ColorTheme) => {
    if (input === colorTheme) return;
    window.localStorage.setItem("theme", input);
    setColorTheme(input);
    editUser.mutate({ colorTheme: input });
    void updateSession();
  };

  return (
    <div
      // Drawer Content Here
      className="bg-base-300 grid h-full w-full grid-cols-2 gap-2 p-4 text-popover-foreground"
    >
      <div
        // Light Dark Theme Buttons
        className="col-span-2 mb-4 flex justify-center gap-6 text-3xl font-bold"
      >
        <div
          className="flex cursor-pointer items-center gap-2"
          onClick={() => handleLdThemeChange(ldThemes[0])}
        >
          <FaSun />
        </div>
        <div
          className="flex cursor-pointer items-center gap-2"
          onClick={() => handleLdThemeChange()}
        >
          <UseOnRender>
            <Switch
              checked={ldTheme === ldThemes[1]}
              className="data-[state=checked]:bg-neutral-foreground data-[state=unchecked]:bg-neutral-foreground"
            />
          </UseOnRender>
        </div>
        <div
          className="flex cursor-pointer place-items-center gap-2"
          onClick={() => handleLdThemeChange(ldThemes[1])}
        >
          <FaMoon />
        </div>
      </div>

      <UseOnRender>
        {
          // Color Theme Buttons
          themeList.map((theme) => {
            return (
              <button
                key={theme}
                data-theme={theme}
                data-set-theme={theme}
                data-act-class="ACTIVECLASS"
                suppressHydrationWarning
                className={`overflow-hidden rounded-lg border-4 text-sm lg:text-base ${ldTheme} ${
                  theme === colorTheme
                    ? "border-primary"
                    : "border-transparent hover:border-primary/70"
                }`}
                onClick={() => handleColorThemeChange(theme)}
              >
                <div className="relative h-full w-full cursor-pointer bg-background font-sans text-foreground">
                  {
                    // Star in top left corner on current theme
                    theme === colorTheme && (
                      <div className="absolute left-1 top-1 text-2xl text-primary">
                        <FaStar />
                      </div>
                    )
                  }
                  <div className="grid h-full w-full grid-cols-5 grid-rows-3">
                    {/* Left side bg color blocks */}
                    <div className="col-start-1 row-span-2 row-start-1 bg-card" />
                    <div className="col-start-1 row-start-3 bg-popover" />
                    {/* Right side theme name & bg color blocks */}
                    <div className="bg-base-100 col-span-4 col-start-2 row-span-3 row-start-1 flex flex-col justify-center gap-1 px-2">
                      <div className="text-right text-lg font-bold capitalize lg:text-xl">
                        {theme}
                      </div>
                      {/* Theme "A" blocks */}
                      <div className="mb-2 flex flex-wrap justify-end gap-1">
                        <div className="flex aspect-square w-4 items-center justify-center rounded bg-primary sm:w-5 md:w-6 lg:w-7">
                          <span className="text-sm font-bold text-primary-foreground">
                            A
                          </span>
                        </div>
                        <div className="flex aspect-square w-4 items-center justify-center rounded bg-muted sm:w-5 md:w-6 lg:w-7">
                          <span className="text-sm font-bold text-muted-foreground">
                            A
                          </span>
                        </div>
                        <div className="flex aspect-square w-4 items-center justify-center rounded bg-secondary sm:w-5 md:w-6 lg:w-7">
                          <span className="text-sm font-bold text-secondary-foreground">
                            A
                          </span>
                        </div>
                        <div className="flex aspect-square w-4 items-center justify-center rounded bg-accent sm:w-5 md:w-6 lg:w-7">
                          <span className="text-sm font-bold text-accent-foreground">
                            A
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        }
      </UseOnRender>
    </div>
  );
};
export default ThemePicker;
