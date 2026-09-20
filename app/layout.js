export const metadata = {
  title: "Restaurant Competitor Intel",
  description: "Know exactly what your competitors are doing on DoorDash & Uber Eats",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: "#0A0A0B" }}>
        {children}
      </body>
    </html>
  );
}
