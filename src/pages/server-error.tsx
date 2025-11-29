import { ServerCrash } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';

export function ServerErrorPage() {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center text-center">
      <ServerCrash className="h-24 w-24 text-destructive/50 mb-6" />
      <h1 className="text-4xl font-bold tracking-tight mb-2">500</h1>
      <p className="text-xl text-muted-foreground mb-6">Server Error</p>
      <p className="text-muted-foreground mb-8 max-w-md">
        Something went wrong on our end. Please try again later or contact support if the problem persists.
      </p>
      <div className="flex gap-4">
        <Button variant="outline" onClick={handleRefresh}>
          Refresh Page
        </Button>
        <Button asChild>
          <Link to="/">Go back home</Link>
        </Button>
      </div>
    </div>
  );
}

export default ServerErrorPage;
