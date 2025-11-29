import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ReceiveOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  orderId?: number;
  isReceiving?: boolean;
}

export function ReceiveOrderDialog({
  open,
  onOpenChange,
  onConfirm,
  orderId,
  isReceiving,
}: ReceiveOrderDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Receive Purchase Order?</AlertDialogTitle>
          <AlertDialogDescription>
            This will mark order{' '}
            <span className="font-medium text-foreground">
              PO-{String(orderId).padStart(5, '0')}
            </span>{' '}
            as received and add all items to inventory. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isReceiving}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isReceiving}>
            {isReceiving ? 'Receiving...' : 'Receive Order'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
