import { Link as RouterLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Map as MapIcon, Compass, CalendarRange } from 'lucide-react';

export const NavLinks = ({ onClick }: { onClick: () => void }) => (
  <>
    <Button variant="ghost" render={<RouterLink to="/" />} className="w-full justify-start md:w-auto" onClick={onClick}>
      <MapIcon className="mr-2 h-4 w-4" /> Dashboard
    </Button>
    <Button variant="ghost" render={<RouterLink to="/discover" />} className="w-full justify-start md:w-auto" onClick={onClick}>
      <Compass className="mr-2 h-4 w-4" /> Discover
    </Button>
    <Button variant="ghost" render={<RouterLink to="/manage" />} className="w-full justify-start md:w-auto" onClick={onClick}>
      <CalendarRange className="mr-2 h-4 w-4" /> Manage Events
    </Button>
  </>
);
