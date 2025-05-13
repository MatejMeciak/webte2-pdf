import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { pdfActions } from "@/features/pdf/data/pdfActions";
import { LogOut, Menu, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import React from "react";
import { useAuth } from "@/features/auth/context/AuthContext";

const AppNavigation = () => {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="border-b shadow-sm bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-primary tracking-tight">PDFMaster</h1>
            </Link>

            {/* Desktop navigation */}
            <div className="hidden md:block">
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>PDF Tools</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                        {pdfActions.map((action) => (
                          <ListItem
                            key={action.path}
                            title={action.title}
                            href={action.path}
                          >
                            {action.description}
                          </ListItem>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>

          {/* Auth actions - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-sm">
                  <UserCircle className="h-5 w-5 mr-1.5 text-primary" />
                  <span>{user?.email}</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout}
                  className="flex items-center"
                >
                  <LogOut className="h-4 w-4 mr-1.5" />
                  Logout
                </Button>
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link to="/register">
                  <Button variant="default" size="sm">Register</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Menu">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[80%] sm:w-[350px]">
                <div className="flex flex-col space-y-4 mt-6">
                  {isAuthenticated && (
                    <div className="flex items-center mb-4 p-3 bg-muted rounded-md">
                      <UserCircle className="h-5 w-5 mr-2 text-primary" />
                      <span className="text-sm font-medium">{user?.email}</span>
                    </div>
                  )}
                  
                  <h2 className="text-lg font-medium mb-2">PDF Tools</h2>
                  <div className="space-y-3">
                    {pdfActions.map((action) => (
                      <Link 
                        key={action.path} 
                        to={action.path}
                        className="block px-3 py-2 rounded-md hover:bg-accent"
                        onClick={() => setOpen(false)}
                      >
                        <div className="font-medium">{action.title}</div>
                        <p className="text-sm text-muted-foreground mt-1">{action.description}</p>
                      </Link>
                    ))}
                  </div>
                  
                  <div className="pt-4 mt-4 border-t">
                    {isAuthenticated ? (
                      <Button 
                        variant="outline" 
                        className="w-full flex items-center justify-center"
                        onClick={() => {
                          handleLogout();
                          setOpen(false);
                        }}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </Button>
                    ) : (
                      <div className="flex flex-col space-y-2">
                        <Link to="/login" onClick={() => setOpen(false)}>
                          <Button variant="outline" className="w-full">Login</Button>
                        </Link>
                        <Link to="/register" onClick={() => setOpen(false)}>
                          <Button variant="default" className="w-full">Register</Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </div>
  );
};

const ListItem = React.forwardRef<
  React.ComponentRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, href, ...props }) => {
  return (
    <li>
      <Link
        to={href || "#"}
        className={cn(
          "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
          className
        )}
        {...props}
      >
        <div className="text-sm font-medium leading-none">{title}</div>
        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
          {children}
        </p>
      </Link>
    </li>
  );
});
ListItem.displayName = "ListItem";

export default AppNavigation;