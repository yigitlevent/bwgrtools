import { NavLink } from "@mantine/core";
import { Link as RouterLink, useLocation } from "react-router-dom";

import type { LucideIcon } from "lucide-react";


export function RouteButton({ title, route, Icon }: { title: string; route: string; Icon: LucideIcon; }): React.JSX.Element {
  const location = useLocation();
  const active = location.pathname === route;

  return (
    <NavLink
      component={RouterLink}
      to={route}
      label={title}
      active={active}
      leftSection={<Icon size={20} color={active ? "var(--mantine-primary-color-filled)" : undefined} />}
    />
  );
}
