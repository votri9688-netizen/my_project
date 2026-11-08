import './globals.css';
import { SidebarProvider } from '../components/SidebarContext';
import ChatbotDrawer from '../components/ChatbotDrawer';

export const metadata = {
  title: 'Cao Facebook - B2B SaaS Reels Dashboard',
  description: 'Manage Facebook Fanpages, Sources, Quota, Scheduler, Reports & AI Assistant',
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
          <ChatbotDrawer />
        </SidebarProvider>
      </body>
    </html>
  );
}
