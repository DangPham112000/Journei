import { useParams, useNavigate } from 'react-router-dom';
import { useGetPlanQuery, useGetPlacesForPlanQuery, useGetCategoriesQuery, useCreatePlaceMutation, useGetRecommendedPlacesLazyQuery, useGetScheduledActivitiesForPlanQuery, useCreateScheduledActivityMutation, useDeleteScheduledActivityMutation, useUpdatePlaceVisitStatusMutation, useUpdateScheduledActivityMutation } from '../../__generated__/graphql';
import ScheduleGrid from '../../components/ScheduleGrid';
import { Loader2, Plus, ArrowLeft, ExternalLink, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AddCategoryModal } from '../../components/AddCategoryModal';

export default function PlanDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: planData, loading: planLoading } = useGetPlanQuery({ variables: { id: id! }, skip: !id });
  const { data: placesData, loading: placesLoading, refetch: refetchPlaces } = useGetPlacesForPlanQuery({ variables: { planId: id! }, skip: !id });
  const { data: scheduleData, refetch: refetchSchedule } = useGetScheduledActivitiesForPlanQuery({ variables: { planId: id! }, skip: !id });
  const { data: catData, refetch: refetchCategories } = useGetCategoriesQuery();

  const [getRecommendedPlaces, { data: recData, loading: recLoading }] = useGetRecommendedPlacesLazyQuery();
  const [createPlace] = useCreatePlaceMutation();
  const [updatePlaceStatus] = useUpdatePlaceVisitStatusMutation();
  const [createSchedule] = useCreateScheduledActivityMutation();
  const [deleteSchedule] = useDeleteScheduledActivityMutation();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addCatModalOpen, setAddCatModalOpen] = useState(false);

  const [name, setName] = useState('');
  const [selectedDestId, setSelectedDestId] = useState('');
  const [selectedCatId, setSelectedCatId] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [notes, setNotes] = useState('');
  const [reviewLinkInput, setReviewLinkInput] = useState('');

  // Scheduling State
  const [selectedTimeRange, setSelectedTimeRange] = useState<{start: Date, end: Date} | null>(null);
  const [selectedPlaceIdForSchedule, setSelectedPlaceIdForSchedule] = useState<string | null>(null);
  const [confirmScheduleModalOpen, setConfirmScheduleModalOpen] = useState(false);

  // Edit/Delete Schedule Modal State
  const [editScheduleModalOpen, setEditScheduleModalOpen] = useState(false);
  const [scheduleToEdit, setScheduleToEdit] = useState<string | null>(null);

  // Edit form state
  const [editSchedulePlaceId, setEditSchedulePlaceId] = useState<string>('');
  const [updateSchedule] = useUpdateScheduledActivityMutation();

  if (planLoading || placesLoading) {
    return (
      <div className="flex justify-center mt-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const plan = planData?.plan;
  if (!plan) return <p>Plan not found</p>;

  // Group places by destination
  const placesByDest = placesData?.placesForPlan.reduce((acc, place) => {
    const destName = place.destination.name;
    if (!acc[destName]) acc[destName] = [];
    acc[destName].push(place);
    return acc;
  }, {} as Record<string, typeof placesData.placesForPlan>) || {};

  const handleAddOpen = () => {
    setAddModalOpen(true);
    setName('');
    setSelectedDestId(plan.destinations.length === 1 ? plan.destinations[0].id : '');
    setSelectedCatId('');
    setPriceRange('');
    setNotes('');
    setReviewLinkInput('');
  };

  const handleDestChange = (destId: string) => {
    setSelectedDestId(destId);
    if (destId) {
      getRecommendedPlaces({ variables: { destinationId: destId } });
    }
  };

  const handleCreateSubmit = async () => {
    try {
      await createPlace({
        variables: {
          planId: plan.id,
          name,
          destinationId: selectedDestId,
          categoryId: selectedCatId,
          priceRange,
          notes,
          reviewLinks: reviewLinkInput ? [reviewLinkInput] : [],
        }
      });
      refetchPlaces();
      setAddModalOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleVisitStatus = async (placeId: string, currentStatus: string) => {
     try {
         await updatePlaceStatus({
             variables: {
                 id: placeId,
                 visitStatus: currentStatus === 'VISITED' ? 'PLANNED' : 'VISITED'
             }
         });
         refetchPlaces();
     } catch (e) {
         console.error(e);
     }
  };

  const autofillRec = (rec: NonNullable<typeof recData>['recommendedPlaces'][0]) => {
      setName(rec.name);
      setSelectedCatId(rec.category.id);
      if (rec.priceRange) setPriceRange(rec.priceRange);
      if (rec.notes) setNotes(rec.notes);
      if (rec.reviewLinks?.length) setReviewLinkInput(rec.reviewLinks[0]);
  };

  const handleTimeRangeSelect = (start: Date, end: Date) => {
      setSelectedTimeRange({ start, end });
      if (selectedPlaceIdForSchedule) {
          setConfirmScheduleModalOpen(true);
      }
  };

  const handlePlaceSelectForSchedule = (placeId: string) => {
      setSelectedPlaceIdForSchedule(placeId);
      if (selectedTimeRange) {
          setConfirmScheduleModalOpen(true);
      }
  };

  const handleConfirmSchedule = async () => {
      if (!selectedTimeRange || !selectedPlaceIdForSchedule) return;
      try {
          await createSchedule({
              variables: {
                  placeId: selectedPlaceIdForSchedule,
                  startTime: selectedTimeRange.start.toISOString(),
                  endTime: selectedTimeRange.end.toISOString()
              }
          });
          refetchSchedule();
      } catch (e) {
          console.error(e);
      } finally {
          setConfirmScheduleModalOpen(false);
          setSelectedTimeRange(null);
          setSelectedPlaceIdForSchedule(null);
      }
  };

  const handleCancelSchedule = () => {
      setConfirmScheduleModalOpen(false);
      setSelectedTimeRange(null);
      setSelectedPlaceIdForSchedule(null);
  };

  const handleActivityClick = (activityId: string) => {
      setScheduleToEdit(activityId);
      const activity = scheduleData?.scheduledActivitiesForPlan.find(a => a.id === activityId);
      if (activity) {
          setEditSchedulePlaceId(activity.place.id);
      }
      setEditScheduleModalOpen(true);
  };

  const handleUpdateSchedule = async () => {
      if (!scheduleToEdit || !editSchedulePlaceId) return;
      try {
          await updateSchedule({
             variables: {
                 id: scheduleToEdit,
                 placeId: editSchedulePlaceId
             }
          });
          refetchSchedule();
          setEditScheduleModalOpen(false);
          setScheduleToEdit(null);
      } catch (e) {
          console.error(e);
      }
  };

  const handleDeleteSchedule = async () => {
      if (!scheduleToEdit) return;
      try {
          await deleteSchedule({ variables: { id: scheduleToEdit }});
          refetchSchedule();
          setEditScheduleModalOpen(false);
          setScheduleToEdit(null);
      } catch (e) {
          console.error(e);
      }
  };

  // Derive scheduled place IDs to split the bucket list in Tab 2
  const scheduledPlaceIds = new Set(scheduleData?.scheduledActivitiesForPlan.map(a => a.place.id) || []);
  const unscheduledPlaces = placesData?.placesForPlan.filter(p => !scheduledPlaceIds.has(p.id)) || [];
  const scheduledPlaces = placesData?.placesForPlan.filter(p => scheduledPlaceIds.has(p.id)) || [];

  const activities = scheduleData?.scheduledActivitiesForPlan.map(a => ({
      id: a.id,
      startTime: a.startTime,
      endTime: a.endTime,
      title: a.place.name,
  })) || [];


  return (
    <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl h-full flex flex-col">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/plans')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{plan.title}</h1>
          <p className="text-sm text-muted-foreground">
            {new Date(plan.startDate).toLocaleDateString()} - {new Date(plan.endDate).toLocaleDateString()}
          </p>
        </div>
      </div>

      <Tabs defaultValue="bucket-list" className="flex-grow flex flex-col min-h-0">
        <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 mb-4 h-auto shrink-0">
          <TabsTrigger value="bucket-list" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2">
            Places to go
          </TabsTrigger>
          <TabsTrigger value="schedule" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2">
            Plan a time
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bucket-list" className="flex-grow mt-0 flex flex-col min-h-0">
          <div className="flex justify-end mb-4">
             <Button onClick={handleAddOpen}><Plus className="w-4 h-4 mr-2" /> Add Place</Button>
          </div>

          <ScrollArea className="flex-grow min-h-0 pr-4">
            {Object.entries(placesByDest).length === 0 ? (
               <p className="text-muted-foreground text-center mt-8">Your bucket list is empty. Add some places!</p>
            ) : (
               Object.entries(placesByDest).map(([destName, places]) => (
                 <div key={destName} className="mb-8">
                   <div className="flex items-center gap-2 mb-4">
                     <MapPin className="text-primary w-5 h-5" />
                     <h2 className="text-xl font-semibold">{destName}</h2>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     {places.map(place => (
                        <Card key={place.id}>
                          <CardContent className="p-4 flex flex-col gap-2">
                             <div className="flex justify-between items-start">
                               <h3 className="font-semibold">{place.name}</h3>
                               <Badge
                                  variant={place.visitStatus === 'VISITED' ? 'default' : 'secondary'}
                                  className="cursor-pointer"
                                  onClick={() => toggleVisitStatus(place.id, place.visitStatus)}
                                >
                                  {place.visitStatus}
                                </Badge>
                             </div>
                             <div className="text-sm text-muted-foreground">
                               {place.category.name}
                             </div>
                             {place.priceRange && (
                               <div className="text-sm">💰 {place.priceRange}</div>
                             )}
                             {place.notes && (
                               <div className="text-sm italic text-gray-600">"{place.notes}"</div>
                             )}
                             {place.reviewLinks && place.reviewLinks.length > 0 && (
                               <div className="mt-2 flex flex-wrap gap-2">
                                 {place.reviewLinks.map((link, idx) => (
                                   <a key={idx} href={link} target="_blank" rel="noreferrer" className="text-xs text-blue-600 flex items-center hover:underline">
                                      Link {idx + 1} <ExternalLink className="w-3 h-3 ml-1" />
                                   </a>
                                 ))}
                               </div>
                             )}
                          </CardContent>
                        </Card>
                     ))}
                   </div>
                 </div>
               ))
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="schedule" className="flex-grow mt-0 flex flex-col md:flex-row gap-4 min-h-[500px]">
          <div className="flex-grow md:w-2/3 h-full min-h-[400px]">
              <ScheduleGrid
                 startDate={plan.startDate}
                 endDate={plan.endDate}
                 activities={activities}
                 onTimeRangeSelect={handleTimeRangeSelect}
                 onActivityClick={handleActivityClick}
                 selectedRange={selectedTimeRange}
              />
          </div>
          <div className="md:w-1/3 w-full flex flex-col gap-4 h-full">
              <Card className="flex-grow flex flex-col overflow-hidden">
                 <CardContent className="p-4 flex flex-col h-full">
                    <h3 className="font-semibold mb-3 shrink-0">Select Place</h3>
                    <ScrollArea className="flex-grow pr-3">
                       {unscheduledPlaces.length === 0 && scheduledPlaces.length === 0 && (
                          <p className="text-sm text-muted-foreground text-center">No places in your bucket list.</p>
                       )}

                       {unscheduledPlaces.length > 0 && (
                          <div className="mb-6 flex flex-col gap-2">
                             {unscheduledPlaces.map(p => (
                                <Card
                                   key={p.id}
                                   className={cn("cursor-pointer transition-colors border", selectedPlaceIdForSchedule === p.id && "border-primary bg-primary/5")}
                                   onClick={() => handlePlaceSelectForSchedule(p.id)}
                                >
                                   <CardContent className="p-3 text-sm">
                                      <div className="font-medium">{p.name}</div>
                                      <div className="text-xs text-muted-foreground">{p.destination.name}</div>
                                   </CardContent>
                                </Card>
                             ))}
                          </div>
                       )}

                       {scheduledPlaces.length > 0 && (
                          <div>
                             <h4 className="text-sm font-medium text-muted-foreground mb-2 pb-1 border-b">Planned Places</h4>
                             <div className="flex flex-col gap-2">
                               {scheduledPlaces.map(p => (
                                  <Card
                                     key={p.id}
                                     className={cn("cursor-pointer transition-colors border opacity-70", selectedPlaceIdForSchedule === p.id && "border-primary bg-primary/5 opacity-100")}
                                     onClick={() => handlePlaceSelectForSchedule(p.id)}
                                  >
                                     <CardContent className="p-3 text-sm">
                                        <div className="font-medium">{p.name}</div>
                                        <div className="text-xs text-muted-foreground">{p.destination.name}</div>
                                     </CardContent>
                                  </Card>
                               ))}
                             </div>
                          </div>
                       )}
                    </ScrollArea>
                 </CardContent>
              </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={addModalOpen} onOpenChange={(o) => !o && setAddModalOpen(false)}>
        <DialogContent className="sm:max-w-[800px] h-[90vh] sm:h-[80vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-2 shrink-0">
            <DialogTitle>Add Place to Bucket List</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col md:flex-row flex-grow min-h-0 border-t">
              <ScrollArea className="flex-1 px-6 py-4 md:border-r">
                <div className="flex flex-col gap-4 pr-2 pb-4">
                  <div className="grid gap-2">
                    <Label>Destination</Label>
                    <Select value={selectedDestId} onValueChange={(val) => val && handleDestChange(val)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select destination" />
                      </SelectTrigger>
                      <SelectContent>
                         {plan.destinations.map(d => (
                            <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                         ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label>Category</Label>
                    <div className="flex gap-2">
                      <Select value={selectedCatId} onValueChange={(val) => val && setSelectedCatId(val)}>
                        <SelectTrigger className="flex-grow">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {catData?.categories.map(c => (
                              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button variant="outline" onClick={() => setAddCatModalOpen(true)}><Plus className="w-4 h-4"/></Button>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label>Name</Label>
                    <Input value={name} onChange={e => setName(e.target.value)} />
                  </div>

                  <div className="grid gap-2">
                    <Label>Price Range</Label>
                    <Input placeholder="e.g. 50k - 100k VND" value={priceRange} onChange={e => setPriceRange(e.target.value)} />
                  </div>

                  <div className="grid gap-2">
                    <Label>Notes</Label>
                    <Textarea value={notes} onChange={e => setNotes(e.target.value)} />
                  </div>

                  <div className="grid gap-2">
                    <Label>Review Link</Label>
                    <Input value={reviewLinkInput} onChange={e => setReviewLinkInput(e.target.value)} />
                  </div>
                </div>
              </ScrollArea>

              <div className="flex-1 bg-gray-50 flex flex-col min-h-0">
                 <div className="p-4 border-b shrink-0 font-semibold text-sm text-gray-700 bg-gray-100">
                    Recommendations
                 </div>
                 <ScrollArea className="flex-grow p-4">
                    {!selectedDestId ? (
                       <p className="text-sm text-muted-foreground text-center mt-4">Select a destination to see recommendations</p>
                    ) : recLoading ? (
                       <div className="flex justify-center mt-4"><Loader2 className="w-5 h-5 animate-spin" /></div>
                    ) : recData?.recommendedPlaces.length === 0 ? (
                       <p className="text-sm text-muted-foreground text-center mt-4">No recommendations found for this destination.</p>
                    ) : (
                       <div className="flex flex-col gap-2">
                         {recData?.recommendedPlaces.map(rec => (
                            <Card key={rec.id} className="cursor-pointer hover:border-primary transition-colors" onClick={() => autofillRec(rec)}>
                              <CardContent className="p-3 text-sm flex justify-between items-center">
                                 <div>
                                   <div className="font-semibold">{rec.name}</div>
                                   <div className="text-muted-foreground text-xs">{rec.category.name}</div>
                                 </div>
                                 <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">Autofill</Button>
                              </CardContent>
                            </Card>
                         ))}
                       </div>
                    )}
                 </ScrollArea>
              </div>
          </div>
          <DialogFooter className="p-6 pt-4 border-t shrink-0">
            <div className="flex gap-2 w-full sm:w-auto sm:justify-end">
              <Button variant="outline" className="flex-1 sm:flex-none" onClick={() => setAddModalOpen(false)}>Cancel</Button>
              <Button className="flex-1 sm:flex-none" onClick={handleCreateSubmit} disabled={!name || !selectedDestId || !selectedCatId}>Add Place</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmScheduleModalOpen} onOpenChange={(o) => !o && handleCancelSchedule()}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Confirm Schedule</DialogTitle>
          </DialogHeader>
          <div className="py-4">
             <p className="text-sm mb-2">You are scheduling:</p>
             <p className="font-medium">{placesData?.placesForPlan.find(p => p.id === selectedPlaceIdForSchedule)?.name}</p>
             <p className="text-sm text-muted-foreground mt-2">Time:</p>
             <p className="font-medium">
               {selectedTimeRange && `${selectedTimeRange.start.toLocaleString()} - ${selectedTimeRange.end.toLocaleTimeString()}`}
             </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelSchedule}>Cancel</Button>
            <Button onClick={handleConfirmSchedule}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editScheduleModalOpen} onOpenChange={(o) => !o && setEditScheduleModalOpen(false)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Edit Scheduled Activity</DialogTitle>
          </DialogHeader>
          <div className="py-4 flex flex-col gap-4">
             <div className="grid gap-2">
                <Label>Change Place</Label>
                <Select value={editSchedulePlaceId} onValueChange={(val) => val && setEditSchedulePlaceId(val)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a new place" />
                    </SelectTrigger>
                    <SelectContent>
                        {placesData?.placesForPlan.map(p => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
             </div>
             <Button variant="outline" onClick={handleUpdateSchedule}>Save Changes</Button>

             <div className="mt-4 pt-4 border-t">
               <p className="text-sm mb-2 text-muted-foreground">Or remove this activity entirely:</p>
               <Button variant="destructive" className="w-full" onClick={handleDeleteSchedule}>Delete Activity</Button>
             </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditScheduleModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AddCategoryModal
        open={addCatModalOpen}
        onClose={() => setAddCatModalOpen(false)}
        onSuccess={(id) => {
            refetchCategories();
            setSelectedCatId(id);
        }}
      />
    </div>
  );
}
