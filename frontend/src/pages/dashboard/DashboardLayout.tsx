import { Link, Outlet, useLocation } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";

interface DashboardLayoutProps {
  onLogout: () => void;
}

const NAV_ITEMS = [
  { to: "/carteira", label: "Carteira" },
  { to: "/extrato", label: "Extrato" },
  { to: "/gateway/cadastro", label: "Cadastrar no gateway" },
  { to: "/gateway", label: "Vincular conta do gateway" },
  { to: "/checkout/pix", label: "Checkout Pix" },
  { to: "/checkout/cartao", label: "Checkout Cartão" },
  { to: "/saque", label: "Saque" },
  { to: "/webhooks", label: "Webhooks" },
];

function DashboardLayout({ onLogout }: DashboardLayoutProps) {
  const { pathname } = useLocation();

  return (
    <>
      <NavigationMenu className='mx-auto'>
        <NavigationMenuList>
          <NavigationMenuItem className="flex flex-col md:flex-row justify-center items-center gap-2">
            {NAV_ITEMS.map((item) => (
              <NavigationMenuLink
                key={item.to}
                active={pathname === item.to}
                className={navigationMenuTriggerStyle()}
                render={<Link to={item.to}>{item.label}</Link>}
              />
            ))}
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Button onClick={onLogout} variant="destructive">
              Sair
            </Button>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      <section className="p-8 shadow mt-5">
        <Outlet />
      </section>
    </>
  );
}

export default DashboardLayout;
