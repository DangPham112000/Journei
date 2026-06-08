import type { GetMyPlansQuery } from '../__generated__/graphql';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, MapPin } from 'lucide-react';

type PlanType = GetMyPlansQuery['myPlans'][0];

interface PlanCardProps {
  plan: PlanType;
  onClick?: (plan: PlanType) => void;
}

export default function PlanCard({ plan, onClick }: PlanCardProps) {
  return (
    <Card className="mb-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer w-full" onClick={() => onClick?.(plan)}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-2">
            <CardTitle className="text-lg leading-tight">{plan.title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="flex items-center text-sm text-muted-foreground mb-2">
          <CalendarDays className="mr-1.5 h-4 w-4 shrink-0" />
          <span className="truncate">
            {new Date(plan.startDate).toLocaleDateString()} - {new Date(plan.endDate).toLocaleDateString()}
          </span>
        </div>
        <div className="flex items-start text-sm text-muted-foreground">
          <MapPin className="mr-1.5 h-4 w-4 shrink-0 mt-0.5" />
          <div className="flex flex-wrap gap-1">
             {plan.destinations.map(d => (
                 <Badge key={d.id} variant="secondary" className="font-normal">{d.name}</Badge>
             ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
