import "./globals.css";
import Script from "next/script";

export const metadata = {
  title: "Vedmantra",
  description: "Premium Astrology Platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "Plus Jakarta Sans, sans-serif",
          background: "#F7EFE4",
        }}
      >
        {children}

        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-EYJL0RXSV6"
          strategy="afterInteractive"
        />

        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-EYJL0RXSV6');
          `}
        </Script>
      </body>
    </html>
  );
}