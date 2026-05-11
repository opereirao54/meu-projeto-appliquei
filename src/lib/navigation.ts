import { Sidebar, ChartBar, Wallet, ArrowLeftRight, CreditCard, TrendUp, Clock, Settings, SignOut, Menu } from '@phosphor-icons/react';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; weight?: string }>;
  group?: string;
  path: string;
}

export const navItems: NavItem[] = [
  {
    id: 'patrimonio',
    label: 'Patrimônio',
    icon: Wallet,
    path: '/patrimonio',
  },
  {
    id: 'carteira',
    label: 'Carteira',
    icon: ChartBar,
    path: '/carteira',
  },
  {
    id: 'operacoes',
    label: 'Operações',
    icon: ArrowLeftRight,
    group: 'Transações',
    path: '/operacoes',
  },
  {
    id: 'cartoes',
    label: 'Cartões',
    icon: CreditCard,
    group: 'Transações',
    path: '/cartoes',
  },
  {
    id: 'timeline',
    label: 'Timeline',
    icon: Clock,
    group: 'Análise',
    path: '/timeline',
  },
  {
    id: 'proventos',
    label: 'Proventos',
    icon: TrendUp,
    group: 'Análise',
    path: '/proventos',
  },
  {
    id: 'configuracoes',
    label: 'Configurações',
    icon: Settings,
    path: '/configuracoes',
  },
];
