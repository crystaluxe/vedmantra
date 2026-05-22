import "./globals.css";

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
      </body>
    </html>
  );
}