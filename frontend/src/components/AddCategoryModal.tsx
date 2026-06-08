import { useState } from 'react';
import { useCreateCategoryMutation } from '../__generated__/graphql';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AddCategoryModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (id: string, name: string) => void;
}

export function AddCategoryModal({ open, onClose, onSuccess }: AddCategoryModalProps) {
  const [name, setName] = useState('');
  const [createCat, { loading }] = useCreateCategoryMutation();

  const handleSubmit = async () => {
    if (!name.trim()) return;
    try {
      const res = await createCat({ variables: { name: name.trim() } });
      if (res.data?.createCategory) {
         onSuccess(res.data.createCategory.id, res.data.createCategory.name);
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
          <DialogTitle>Add New Category</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Label>Category Name</Label>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Shopping" />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!name.trim() || loading}>Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
