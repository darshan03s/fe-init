export type Theme = "dark" | "light";

export type ThemeProviderState = {
    theme: Theme;
    setTheme: (theme: Theme) => void;
};

export const initialState: ThemeProviderState = {
    theme: "light",
    setTheme: () => null,
};
