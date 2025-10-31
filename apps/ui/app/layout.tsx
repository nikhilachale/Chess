import "./globals.css";



export const metadata = {
  title: "Royal Chess",
  description: "Play chess online with friends and players around the world.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning={true}> 

      <body>
        <div id="app-root">

           {children}

        </div>
      </body>
    </html>
  );
}