import './globals.css';
import { SidebarProvider } from '../components/SidebarContext';

export const metadata = {
  title: 'Reels Automation Dashboard',
  description: 'Manage Facebook Fanpages, Meta Reels Publishing & AI Content Pipeline',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body className="antialiased selection:bg-blue-500 selection:text-white">
        <SidebarProvider>
          {children}
        </SidebarProvider>
      </body>
    </html>
  );
}
