import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  TrendingUp,
  BarChart3,
  Settings,
  LogOut,
  ChevronRight,
} from 'lucide-react';

import { useAuth } from '@/context';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

// ----------------------------------------------------------
// Navigation Items
// ----------------------------------------------------------

interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  items?: { title: string; url: string }[];
}

const mainNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Products',
    url: '/products',
    icon: Package,
    items: [
      { title: 'All Products', url: '/products' },
      { title: 'Add Product', url: '/products/new' },
    ],
  },
  {
    title: 'Purchase Orders',
    url: '/purchase-orders',
    icon: ShoppingCart,
    items: [
      { title: 'All Orders', url: '/purchase-orders' },
      { title: 'Create Order', url: '/purchase-orders/new' },
    ],
  },
  {
    title: 'Stock Movements',
    url: '/stock-movements',
    icon: TrendingUp,
  },
];

const analyticsNavItems: NavItem[] = [
  {
    title: 'Analytics',
    url: '/analytics',
    icon: BarChart3,
    items: [
      { title: 'Inventory Summary', url: '/analytics/summary' },
      { title: 'Stock Levels', url: '/analytics/stock-levels' },
      { title: 'Low Stock Alerts', url: '/analytics/low-stock' },
      { title: 'Slow Moving Items', url: '/analytics/slow-moving' },
    ],
  },
];

// ----------------------------------------------------------
// NavItem Component
// ----------------------------------------------------------

function NavItemComponent({ item }: { item: NavItem }) {
  const location = useLocation();
  const isActive = location.pathname === item.url ||
    (item.items?.some((sub) => location.pathname === sub.url) ?? false);

  if (item.items) {
    return (
      <Collapsible asChild defaultOpen={isActive}>
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton tooltip={item.title}>
              <item.icon className="h-4 w-4" />
              <span>{item.title}</span>
              <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {item.items.map((subItem) => (
                <SidebarMenuSubItem key={subItem.url}>
                  <SidebarMenuSubButton
                    asChild
                    isActive={location.pathname === subItem.url}
                  >
                    <NavLink to={subItem.url}>{subItem.title}</NavLink>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    );
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
        <NavLink
          to={item.url}
          className={({ isActive }) =>
            cn(isActive && 'bg-sidebar-accent text-sidebar-accent-foreground')
          }
        >
          <item.icon className="h-4 w-4" />
          <span>{item.title}</span>
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

// ----------------------------------------------------------
// App Sidebar Component
// ----------------------------------------------------------

export function AppSidebar() {
  const { logout } = useAuth();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <NavLink to="/" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Package className="h-4 w-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Inventory</span>
                  <span className="text-xs text-muted-foreground">Management</span>
                </div>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <NavItemComponent key={item.url} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Reports</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {analyticsNavItems.map((item) => (
                <NavItemComponent key={item.url} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Settings">
              <NavLink to="/settings">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={logout}
              tooltip="Sign out"
              className="text-destructive hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;
