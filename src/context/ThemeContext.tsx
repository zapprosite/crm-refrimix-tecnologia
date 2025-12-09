import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    effectiveTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>(() => {
        // Read from localStorage on mount
        const stored = localStorage.getItem('theme') as Theme | null;
        return stored || 'system';
    });

    const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('light');

    useEffect(() => {
        // Save to localStorage whenever theme changes
        localStorage.setItem('theme', theme);

        // Determine effective theme
        let effective: 'light' | 'dark' = 'light';

        if (theme === 'system') {
            // Check system preference
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            effective = mediaQuery.matches ? 'dark' : 'light';

            // Listen for system theme changes
            const handler = (e: MediaQueryListEvent) => {
                setEffectiveTheme(e.matches ? 'dark' : 'light');
            };
            mediaQuery.addEventListener('change', handler);

            setEffectiveTheme(effective);

            return () => mediaQuery.removeEventListener('change', handler);
        } else {
            effective = theme;
            setEffectiveTheme(effective);
        }
    }, [theme]);

    useEffect(() => {
        // Apply dark class to html element
        const root = document.documentElement;
        if (effectiveTheme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [effectiveTheme]);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme, effectiveTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
