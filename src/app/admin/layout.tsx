import "./admin.css";

// Carga los estilos hover/focus del panel admin una sola vez para
// /admin/login y para todo lo que esté bajo (protected)/.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
