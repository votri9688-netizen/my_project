import './globals.css';
import Sidebar from '../components/Sidebar';

export const metadata = {
  title: 'Reels Automation Dashboard',
  description: 'Manage Facebook Fanpages, Meta Reels Publishing & AI Content Pipeline',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen bg-slate-50 text-slate-900">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
