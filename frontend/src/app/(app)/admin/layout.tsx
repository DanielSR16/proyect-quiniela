import { AdminTabs } from "@/components/client/admin-tabs";
import { exigirAdmin } from "@/lib/sesion";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await exigirAdmin();

  return (
    <div>
      <h1 className="mb-6 text-5xl text-gold-400">Administración</h1>
      <AdminTabs />
      {children}
    </div>
  );
}
