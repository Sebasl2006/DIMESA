"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "./LogoutButton";
import { IconChart, IconOrders, IconBox, IconUser, IconSparkle, IconInfo, IconImage, IconTag } from "./icons";
import * as s from "./admin-styles";

const NAV = [
  { href: "/admin/analiticas", label: "Analíticas", Icon: IconChart },
  { href: "/admin/pedidos", label: "Pedidos", Icon: IconOrders },
  { href: "/admin/productos", label: "Productos", Icon: IconBox },
  { href: "/admin/marcas", label: "Marcas", Icon: IconTag },
  { href: "/admin/profesionales", label: "Profesionales", Icon: IconUser },
  { href: "/admin/servicios", label: "Servicios", Icon: IconSparkle },
  { href: "/admin/informacion", label: "Información", Icon: IconInfo },
  { href: "/admin/fondo", label: "Fondo", Icon: IconImage },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="admin-sidebar" style={s.sidebar}>
      <div className="admin-sidebar-label" style={s.sidebarBrand}>DIMESA</div>
      <div className="admin-sidebar-label" style={s.sidebarSection}>Panel</div>
      <nav style={s.sidebarNav}>
        {NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className="admin-sidebar-link"
              style={{ ...s.sidebarLink, ...(active ? s.sidebarLinkActive : {}) }}
              title={item.label}
            >
              <item.Icon />
              <span className="admin-sidebar-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="admin-sidebar-footer" style={s.sidebarFooter}>
        <LogoutButton />
      </div>
    </div>
  );
}
