import './Layout.css';
import Navbar from './Navbar';
import type { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="layout-shell">
      <Navbar />
      <main className="layout-main">
        {children}
      </main>
    </div>
  );
}