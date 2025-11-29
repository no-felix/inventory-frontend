import type { ReactNode } from 'react';
import { Package, FileQuestion, SearchX, Inbox } from 'lucide-react';
import { Link } from 'react-router-dom';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type EmptyStateVariant = 'default' | 'search' | 'no-data' | 'not-found';

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  icon?: ReactNode;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  className?: string;
}

const variantConfig: Record<EmptyStateVariant, { icon: ReactNode; title: string; description: string }> = {
  default: {
    icon: <Inbox className="h-12 w-12" />,
    title: 'Nothing here yet',
    description: 'Get started by creating your first item.',
  },
  search: {
    icon: <SearchX className="h-12 w-12" />,
    title: 'No results found',
    description: 'Try adjusting your search or filter to find what you\'re looking for.',
  },
  'no-data': {
    icon: <Package className="h-12 w-12" />,
    title: 'No data available',
    description: 'There are no items to display at the moment.',
  },
  'not-found': {
    icon: <FileQuestion className="h-12 w-12" />,
    title: 'Not found',
    description: 'The item you\'re looking for doesn\'t exist or has been removed.',
  },
};

export function EmptyState({
  variant = 'default',
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const config = variantConfig[variant];
  const displayIcon = icon ?? config.icon;
  const displayTitle = title ?? config.title;
  const displayDescription = description ?? config.description;

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 text-center',
        className
      )}
    >
      <div className="text-muted-foreground/50 mb-4">{displayIcon}</div>
      <h3 className="text-lg font-semibold">{displayTitle}</h3>
      {displayDescription && (
        <p className="mt-1 text-sm text-muted-foreground max-w-sm">{displayDescription}</p>
      )}
      {action && (
        action.href ? (
          <Button className="mt-4" asChild>
            <Link to={action.href}>{action.label}</Link>
          </Button>
        ) : action.onClick ? (
          <Button className="mt-4" onClick={action.onClick}>
            {action.label}
          </Button>
        ) : null
      )}
    </div>
  );
}

export default EmptyState;
