import { AdminSidebar } from "../AdminSidebar";
import * as s from "../admin-styles";

export default function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={s.page}>
      <div className="admin-bg" />
      <div style={{ position: "relative", zIndex: 1, display: "flex", minHeight: "100vh" }}>
        <AdminSidebar />
        <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
      </div>
    </div>
  );
}
