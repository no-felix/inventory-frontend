import { useEffect, useState } from 'react';
import { ServerOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ServiceDownPageProps {
  onRetry?: () => void;
}

export default function ServiceDownPage({ onRetry }: ServiceDownPageProps) {
  const [retrying, setRetrying] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleRetry = async () => {
    setRetrying(true);
    setCountdown(5);
    
    // Wait a moment before retrying
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
    
    setRetrying(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="space-y-4">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
            <ServerOff className="h-10 w-10 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Service Unavailable</CardTitle>
          <CardDescription className="text-base">
            We're having trouble connecting to the server. This could be due to
            maintenance or a temporary outage.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
            <p>Please try again in a few moments.</p>
            <p className="mt-2">
              If the problem persists, please contact your system administrator.
            </p>
          </div>
          
          <Button
            onClick={handleRetry}
            disabled={retrying || countdown > 0}
            className="w-full"
            size="lg"
          >
            {retrying ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Reconnecting...
              </>
            ) : countdown > 0 ? (
              `Retry in ${countdown}s`
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </>
            )}
          </Button>
          
          <p className="text-xs text-muted-foreground">
            The system will automatically retry when the service is back online.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
