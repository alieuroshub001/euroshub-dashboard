import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

// Role-specific content components
const AdminDashboard = () => (
  <div className="max-w-7xl mx-auto">
    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Admin Dashboard</h1>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">User Management</h3>
        <p className="text-gray-600 dark:text-gray-300">Manage users and their permissions.</p>
      </div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">System Settings</h3>
        <p className="text-gray-600 dark:text-gray-300">Configure system-wide settings.</p>
      </div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Reports</h3>
        <p className="text-gray-600 dark:text-gray-300">View and generate reports.</p>
      </div>
    </div>
  </div>
);

const ClientDashboard = () => (
  <div className="max-w-7xl mx-auto">
    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Client Dashboard</h1>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">My Projects</h3>
        <p className="text-gray-600 dark:text-gray-300">View and manage your projects.</p>
      </div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Invoices</h3>
        <p className="text-gray-600 dark:text-gray-300">View and pay your invoices.</p>
      </div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Support</h3>
        <p className="text-gray-600 dark:text-gray-300">Get help and support.</p>
      </div>
    </div>
  </div>
);

// Add similar components for other roles: SuperAdmin, HR, Employee

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  // If user is not logged in, redirect to login
  if (!session) {
    redirect('/auth/login');
  }

  // Render role-specific content
  const renderRoleContent = () => {
    switch (session.user?.role) {
      case 'superadmin':
        return <AdminDashboard />; // You can create a SuperAdminDashboard component
      case 'admin':
        return <AdminDashboard />;
      case 'client':
        return <ClientDashboard />;
      case 'hr':
        return <AdminDashboard />; // You can create a HRDashboard component
      case 'employee':
        return <AdminDashboard />; // You can create a EmployeeDashboard component
      default:
        return (
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Dashboard</h1>
            <p>Welcome to your dashboard!</p>
          </div>
        );
    }
  };

  return renderRoleContent();
}