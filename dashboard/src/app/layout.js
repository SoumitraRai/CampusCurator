import './globals.css';
import Providers from '@/components/Providers';
import Header from '@/components/Header';

export const metadata = {
  title: 'CampusCurator Dashboard',
  description: 'CampusCurator - project drives management'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <Providers>
          <Header />
          <main className="container mx-auto px-4 py-6">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}