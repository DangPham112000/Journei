import { useState } from 'react';
import { useCreateDestinationMutation } from '../__generated__/graphql';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AddDestinationModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (id: string, name: string) => void;
}

export function AddDestinationModal({ open, onClose, onSuccess }: AddDestinationModalProps) {
  const [name, setName] = useState('');
  const [createDest, { loading }] = useCreateDestinationMutation();

  const handleSubmit = async () => {
    if (!name.trim()) return;
    try {
      const res = await createDest({ variables: { name: name.trim() } });
      if (res.data?.createDestination) {
         onSuccess(res.data.createDestination.id, res.data.createDestination.name);
      }
      setName('');
      onClose();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Destination</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Label>Destination Name</Label>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Da Nang" />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!name.trim() || loading}>Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
