import { ThemeProvider } from "next-themes";

export function ThemeProviderWrapper({ children }: { children: React.ReactNode }) {
  const isClient = typeof window !== "undefined";

  if (!isClient) {
    return <>{children}</>;
  }

  return (
    <ThemeProvider defaultTheme="system" attribute="class">
      {children}
    </ThemeProvider>
  );
}
