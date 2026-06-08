import { Link as RouterLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CalendarRange } from 'lucide-react';

export const NavLinks = ({ onClick }: { onClick: () => void }) => (
  <>
    <Button variant="ghost" render={<RouterLink to="/plans" />} className="w-full justify-start md:w-auto" onClick={onClick}>
      <CalendarRange className="mr-2 h-4 w-4" /> My Plans
    </Button>
  </>
);
