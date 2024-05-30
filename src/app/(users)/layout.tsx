'use client';
import { HeaderUserComponent } from '@/components/business/layout/header-user.component';
import { SidebarUserComponent } from '@/components/business/layout/sidebar-user.component';
import '../../assets/styles/globals.css';

export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <SidebarUserComponent />
      <div className="flex flex-col">
        <HeaderUserComponent />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-10">
          <div className="flex items-center">
            <h1 className="text-lg font-semibold md:text-2xl">Top criativos</h1>
          </div>
          <div className="flex flex-1 justify-center rounded-lg border border-dashed shadow-sm p-4">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
