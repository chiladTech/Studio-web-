import React from 'react';
import AdminShell from '@/components/admin/AdminShell';

/**
 * Layout for every authenticated admin page.
 *
 * The sidebar/header live here once instead of being duplicated in each
 * admin page. /admin/login is intentionally outside this route group so
 * it renders without the admin shell.
 */
export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShell>{children}</AdminShell>;
}