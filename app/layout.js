import './globals.css';

export const metadata = {
  title: 'LLM Wiki Viewer',
  description: 'LLM Wiki chạy trên Vercel + Firebase Firestore'
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
