import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { landing } from "@/content/landing";
import "./globals.css";

const golosText = localFont({
  src: [
    {
      path: "../fonts/golos-text-cyrillic-wght-normal.woff2",
      weight: "400 900",
      style: "normal",
    },
    {
      path: "../fonts/golos-text-latin-wght-normal.woff2",
      weight: "400 900",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-golos",
  preload: true,
  adjustFontFallback: "Arial",
});

export const metadata: Metadata = {
  title: landing.metadata.title,
  description: landing.metadata.description,
  applicationName: landing.brand,
  openGraph: {
    title: landing.metadata.title,
    description: landing.metadata.description,
    type: "website",
    locale: "ru_RU",
    siteName: landing.brand,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#05070B",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={golosText.variable}>
      <body className={golosText.className}>
        {children}
        {process.env.NODE_ENV === "development" ? (
          <script
            dangerouslySetInnerHTML={{
              __html: `(function () {
  function place() {
    var portal = document.querySelector("nextjs-portal");
    var root = portal && portal.shadowRoot;
    if (!root || root.getElementById("gip-oko-overlay-pos")) return;
    var style = document.createElement("style");
    style.id = "gip-oko-overlay-pos";
    style.textContent =
      ".nextjs-toast{top:auto!important;bottom:20px!important;right:20px!important;left:auto!important;}";
    root.appendChild(style);
  }
  new MutationObserver(place).observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
  place();
})();`,
            }}
          />
        ) : null}
      </body>
    </html>
  );
}
