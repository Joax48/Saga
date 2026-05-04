import type { Metadata } from 'next';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'Scientific Production Portal',
  description: 'Public portal for researchers, projects, and scientific productions',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="flex justify-start h-22"></div>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
