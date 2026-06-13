import "./globals.css";
import Script from "next/script";
import PWAInstall from "@/components/PWAInstall";

export const metadata = {
  title: "Vedmantra",
  description: "Chat with Top Rated Astrologers",
  manifest: "/manifest.json",

  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Vedmantra",
  },

  icons: {
    icon: "/icon-192.png",
    apple: "/apple-touch-icon.png",
  },
};

const FB_PIXEL_ID = "1685249759459324";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "Plus Jakarta Sans, sans-serif",
          background: "#F7EFE4",
          paddingTop: "52px",
        }}
      >
        {children}
        <PWAInstall />

        {/* Meta Pixel */}
        <Script id="facebook-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;
            n.push=n;
            n.loaded=!0;
            n.version='2.0';
            n.queue=[];
            t=b.createElement(e);
            t.async=!0;
            t.src=v;
            s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s);
            }(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');

            fbq('init', '${FB_PIXEL_ID}');
            fbq('track', 'PageView');
          `}
        </Script>

        {/* Google Analytics */}
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