import { useGetMyPlansQuery, useCreatePlanMutation, useGetDestinationsQuery, useDeletePlanMutation } from '../../__generated__/graphql';
import PlanCard from '../../components/PlanCard';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AddDestinationModal } from '../../components/AddDestinationModal';

export default function ManagePlansPage() {
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useGetMyPlansQuery();
  const { data: destData, refetch: refetchDestinations } = useGetDestinationsQuery();

  const [createPlan] = useCreatePlanMutation();
  const [deletePlan] = useDeletePlanMutation();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<string | null>(null);

  const [addDestModalOpen, setAddDestModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>([]);

  if (loading) {
    return (
      <div className="flex justify-center mt-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  if (error) return <p className="text-destructive">Error loading your plans</p>;

  const handleCreateOpen = () => setCreateModalOpen(true);
  const handleCreateClose = () => {
    setCreateModalOpen(false);
    setTitle('');
    setStartDate(undefined);
    setEndDate(undefined);
    setSelectedDestinations([]);
  };

  const handleCreateSubmit = async () => {
    if (!startDate || !endDate || selectedDestinations.length === 0) return;
    try {
      const res = await createPlan({
        variables: {
          title,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          destinationIds: selectedDestinations,
        }
      });
      refetch();
      handleCreateClose();
      if (res.data?.createPlan) {
         navigate(`/plans/${res.data.createPlan.id}`);
      }
    } catch (e) {
      console.error('Failed to create plan', e);
    }
  };

  const handleDeleteClick = (id: string) => {
    setPlanToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (planToDelete) {
      try {
        await deletePlan({ variables: { id: planToDelete } });
        refetch();
      } catch (e) {
        console.error('Failed to delete plan', e);
      } finally {
        setDeleteModalOpen(false);
        setPlanToDelete(null);
      }
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setPlanToDelete(null);
  };

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Manage My Plans</h1>
        <Button onClick={handleCreateOpen} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Create Plan
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {data?.myPlans.map((plan) => (
          <div key={plan.id} className="relative group">
            <PlanCard
              plan={plan}
              onClick={() => navigate(`/plans/${plan.id}`)}
            />
            <div className="absolute top-2 right-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
              <Button size="icon" variant="destructive" className="h-8 w-8 rounded-full shadow-sm" onClick={(e) => {
                e.stopPropagation();
                handleDeleteClick(plan.id);
              }}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {(!data?.myPlans || data.myPlans.length === 0) && (
        <p className="text-muted-foreground mt-4 text-sm md:text-base">You haven't created any plans yet.</p>
      )}

      <Dialog open={createModalOpen} onOpenChange={(open) => !open && handleCreateClose()}>
        <DialogContent className="sm:max-w-[700px] h-[90vh] sm:h-auto flex flex-col p-0">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle>Create New Plan</DialogTitle>
            <DialogDescription>Plan your next journey.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col md:flex-row flex-grow">
              <ScrollArea className="flex-1 px-6 md:border-r">
                <div className="grid gap-4 py-4 pr-2">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Summer in Da Lat" />
                  </div>

                  <div className="grid gap-2">
                    <Label>Destination (Primary)</Label>
                    <div className="flex gap-2">
                      <Select
                        value={selectedDestinations[0] || ''}
                        onValueChange={(val) => val && setSelectedDestinations([val])}
                      >
                        <SelectTrigger className="flex-grow">
                          <SelectValue placeholder="Select a destination" />
                        </SelectTrigger>
                        <SelectContent>
                          {destData?.destinations.map(d => (
                              <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button variant="outline" onClick={() => setAddDestModalOpen(true)}><Plus className="w-4 h-4"/></Button>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label>Start Date</Label>
                    <Popover>
                      <PopoverTrigger render={
                        <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")} />
                      }>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={startDate} onSelect={setStartDate} />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="grid gap-2">
                    <Label>End Date</Label>
                    <Popover>
                      <PopoverTrigger render={
                        <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")} />
                      }>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={endDate} onSelect={setEndDate} />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </ScrollArea>

              <div className="flex-1 p-6 flex flex-col items-center justify-center bg-gray-50 hidden md:flex">
                  <div className="text-center text-muted-foreground">
                      <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Google Calendar integration not configured.</p>
                      <p className="text-xs mt-2">Checking for schedule conflicts...</p>
                  </div>
              </div>
          </div>
          <DialogFooter className="p-6 pt-4 border-t">
            <div className="flex gap-2 w-full sm:w-auto sm:justify-end">
              <Button variant="outline" className="flex-1 sm:flex-none" onClick={handleCreateClose}>Cancel</Button>
              <Button className="flex-1 sm:flex-none" onClick={handleCreateSubmit} disabled={!title || !startDate || !endDate || selectedDestinations.length === 0}>Create</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteModalOpen} onOpenChange={(open) => !open && handleCancelDelete()}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>Are you sure you want to delete this plan? All places and schedules will be permanently lost.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 w-full sm:w-auto sm:justify-end mt-4">
            <Button variant="outline" className="flex-1 sm:flex-none" onClick={handleCancelDelete}>Cancel</Button>
            <Button variant="destructive" className="flex-1 sm:flex-none" onClick={handleConfirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AddDestinationModal
        open={addDestModalOpen}
        onClose={() => setAddDestModalOpen(false)}
        onSuccess={(id) => {
            refetchDestinations();
            setSelectedDestinations([id]);
        }}
      />
    </div>
  );
}
