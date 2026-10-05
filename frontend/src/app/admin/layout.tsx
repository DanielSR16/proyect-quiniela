import { AdminTabs } from "@/components/client/admin-tabs";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <h1 className="mb-6 text-5xl text-gold-400">Administración</h1>
      <AdminTabs />
      {children}
    </div>
  );
}
