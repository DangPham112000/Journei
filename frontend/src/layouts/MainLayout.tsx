import { Navigate, Outlet, Link as RouterLink } from 'react-router-dom';
import { useMeQuery } from '../__generated__/graphql';
import { Button } from '@/components/ui/button';
import { Loader2, Menu, Map as MapIcon, User } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useState } from 'react';
import { NavLinks } from '../components/NavLinks';

export default function MainLayout() {
  const { data, loading, error } = useMeQuery();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data?.me) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <RouterLink to="/" className="font-bold text-lg flex items-center gap-2">
            <MapIcon className="h-5 w-5 text-primary" />
            <span className="hidden sm:inline-block">Journey Planner</span>
          </RouterLink>

          <div className="hidden md:flex items-center space-x-2">
            <NavLinks onClick={() => setIsMobileMenuOpen(false)} />
            <div className="flex items-center gap-2 ml-4 pl-4 border-l">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{data.me.name}</span>
            </div>
          </div>

          <div className="md:hidden flex items-center">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger render={
                <Button variant="ghost" size="icon" />
              }>
                  <Menu className="h-6 w-6" />
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px]">
                <SheetHeader>
                  <SheetTitle className="text-left flex items-center gap-2">
                    <MapIcon className="h-5 w-5 text-primary" />
                    Journey Planner
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-2 mt-6">
                  <NavLinks onClick={() => setIsMobileMenuOpen(false)} />
                  <div className="mt-4 pt-4 border-t flex items-center gap-2 px-4">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{data.me.name}</span>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <main className="flex-grow flex flex-col w-full relative">
        <Outlet />
      </main>
    </div>
  );
}
