'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getCurrentUser, logout } from '@/lib/auth';

export default function Header() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    let mounted = true;
    getCurrentUser().then(u => mounted && setUser(u)).catch(() => {});
    return () => (mounted = false);
  }, []);

  return (
    <header className="border-b bg-black h-[80px] text-2xl">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between ">
        <Link href="/" className="text-xl font-semibold">CampusCurator</Link>
        <nav className="flex items-center gap-3">
          <Link href="/drives" className="">Drives</Link>
          {user?.role === 'admin' && <Link href="/admin/drives/new" className="text-sm">Create Drive</Link>}
          {user ? (
            <>
              <span className="text-sm">Hi, {user.name}</span>
              <button
                onClick={() => { logout().then(() => location.href = '/'); }}
                className="text-sm text-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="">Login</Link>
              <Link href="/auth/register" className="">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}