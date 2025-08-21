import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const session = await getServerSession(authOptions);

  // If user is not logged in, redirect to login
  if (!session) {
    redirect('/auth/login');
  }

  return (
    <DashboardClient
      userRole={session.user?.role as 'superadmin' | 'admin' | 'client' | 'hr' | 'employee'}
      userName={session.user?.name || 'User'}
      userEmail={session.user?.email || ''}
      profileImage={session.user?.image}
    >
      {children}
    </DashboardClient>
  );
}