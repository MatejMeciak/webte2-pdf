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
import { LogOut, Menu, UserCircle, Book, FileText, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import React from "react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useTranslation } from 'react-i18next';
import { usePdfActions } from "@/features/pdf/data/pdfActions";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const FlagSK = () => (
  <svg width="24" height="16" viewBox="0 0 32 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="8" fill="#FFFFFF"/>
    <rect y="8" width="32" height="8" fill="#0B4EA2"/>
    <rect y="16" width="32" height="8" fill="#EE1C25"/>
    <path d="M2 4V20H12V4H2Z" fill="#EE1C25"/>
    <path d="M4 7H10V8H8V17H10V18H4V17H6V8H4V7Z" fill="#FFFFFF"/>
    <path d="M5 10H9V11H5V10Z" fill="#FFFFFF"/>
    <path d="M5 14H9V15H5V14Z" fill="#FFFFFF"/>
    <path d="M3 17C3 17 5 15 7 15C9 15 11 17 11 17V20H3V17Z" fill="#0B4EA2"/>
  </svg>
);

const FlagEN = () => (
  <svg width="24" height="24" viewBox="0 0 32 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="24" fill="#012169"/>
    <path d="M0 0L32 24M32 0L0 24" stroke="white" strokeWidth="4"/>
    <path d="M0 0L32 24M32 0L0 24" stroke="#C8102E" strokeWidth="2"/>
    <path d="M16 0V24M0 12H32" stroke="white" strokeWidth="8"/>
    <path d="M16 0V24M0 12H32" stroke="#C8102E" strokeWidth="4"/>
  </svg>
);

const AppNavigation = () => {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, logout, user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const pdfActions = usePdfActions();

  const handleLanguageChange = (lang: 'en' | 'sk') => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const handleLogout = async () => {
    await logout(); 
    navigate('/login');
  };

  return (
    <div className="border-b shadow-sm bg-white dark:bg-card sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-primary tracking-tight">PDFMaster</h1>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-1">
            {/* Main nav items - always visible */}
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-foreground">{t('nav.pdfTools')}</NavigationMenuTrigger>
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
                
                <NavigationMenuItem>
                  <Button variant="ghost" asChild className="text-foreground">
                    <Link to="/guide" className="flex items-center">
                      <Book className="mr-2 h-4 w-4" />
                      {t('nav.guide')}
                    </Link>
                  </Button>
                </NavigationMenuItem>
                
                {isAuthenticated && isAdmin && (
                  <NavigationMenuItem>
                    <Button variant="ghost" asChild className="text-foreground">
                      <Link to="/admin/history" className="flex items-center">
                        <FileText className="mr-2 h-4 w-4" />
                        {t('nav.adminHistory')}
                      </Link>
                    </Button>
                  </NavigationMenuItem>
                )}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Right side: Language + Auth */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 px-2 border-dashed">
                  {i18n.language === 'sk' ? <FlagSK /> : <FlagEN />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleLanguageChange('sk')} className="cursor-pointer">
                  <div className="flex items-center">
                    <FlagSK />
                    <span className="ml-2">Slovenčina</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleLanguageChange('en')} className="cursor-pointer">
                  <div className="flex items-center">
                    <FlagEN />
                    <span className="ml-2">English</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Auth Buttons */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center text-sm bg-muted px-3 py-1.5 rounded-md">
                  <UserCircle className="h-4 w-4 mr-1.5 text-primary" />
                  <span className="max-w-[150px] truncate">{user?.email}</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout}
                  className="flex items-center"
                >
                  <LogOut className="h-4 w-4 mr-1.5" />
                  {t('nav.logout')}
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">{t('nav.login')}</Button>
                </Link>
                <Link to="/register">
                  <Button variant="default" size="sm">{t('nav.register')}</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Language toggle for mobile */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="w-8 h-8 p-0" 
              onClick={() => handleLanguageChange(i18n.language === 'sk' ? 'en' : 'sk')}
            >
              {i18n.language === 'sk' ? <FlagEN /> : <FlagSK />}
            </Button>
            
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Menu">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[85%] sm:w-[350px] overflow-y-auto">
                <SheetHeader className="text-left pb-2">
                  <SheetTitle>PDFMaster</SheetTitle>
                </SheetHeader>
                
                {/* Mobile menu content - restructured */}
                <div className="flex flex-col space-y-5 mt-2">
                  {/* User Account Section - At top */}
                  {isAuthenticated ? (
                    <div className="rounded-lg border bg-card p-3">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex items-center flex-1 min-w-0">
                          <Avatar className="h-9 w-9 flex-shrink-0 bg-primary/10 text-primary">
                            <AvatarFallback>
                              {user?.email?.charAt(0).toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="ml-3 overflow-hidden">
                            <p className="text-sm font-medium truncate">{user?.email}</p>
                            {isAdmin && <span className="text-xs text-primary">{t('common.admin')}</span>}
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            handleLogout();
                            setOpen(false);
                          }}
                          className="w-full sm:w-auto flex items-center justify-center h-8 mt-2 sm:mt-0"
                        >
                          <LogOut className="h-3.5 w-3.5 mr-1.5" />
                          {t('nav.logout')}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-lg border bg-card p-4 flex flex-col space-y-2">
                      <Link to="/login" onClick={() => setOpen(false)}>
                        <Button variant="outline" className="w-full justify-start">
                          {t('nav.login')}
                        </Button>
                      </Link>
                      <Link to="/register" onClick={() => setOpen(false)}>
                        <Button variant="default" className="w-full justify-start">
                          {t('nav.register')}
                        </Button>
                      </Link>
                    </div>
                  )}
                  
                  {/* Guide and History Section */}
                  <div className="rounded-lg border bg-card p-4 space-y-2">
                    <Link 
                      to="/guide" 
                      className="flex items-center justify-between p-2 rounded-md hover:bg-accent transition-colors"
                      onClick={() => setOpen(false)}
                    >
                      <div className="flex items-center">
                        <Book className="h-4 w-4 mr-3 text-primary" />
                        <span className="font-medium">{t('nav.guide')}</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                    
                    {isAuthenticated && isAdmin && (
                      <Link 
                        to="/admin/history" 
                        className="flex items-center justify-between p-2 rounded-md hover:bg-accent transition-colors"
                        onClick={() => setOpen(false)}
                      >
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-3 text-primary" />
                          <span className="font-medium">{t('nav.adminHistory')}</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </Link>
                    )}
                  </div>
                  
                  {/* PDF Actions Section */}
                  <div className="rounded-lg border bg-card p-4">
                    <h2 className="font-medium mb-3 px-2">{t('nav.pdfTools')}</h2>
                    <div className="space-y-1">
                      {pdfActions.map((action) => (
                        <Link 
                          key={action.path} 
                          to={action.path}
                          className="flex items-center justify-between p-2 rounded-md hover:bg-accent transition-colors"
                          onClick={() => setOpen(false)}
                        >
                          <div className="flex items-center">
                            {React.createElement(
                              typeof action.icon === "function" ? action.icon : "div", 
                              { className: "h-4 w-4 mr-3 text-primary" }
                            )}
                            <span>{action.title}</span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </Link>
                      ))}
                    </div>
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

// List item component for navigation menu
const ListItem = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<"a"> & { title: string }
>(({ className, title, children, href, ...props }, ref) => {
  return (
    <li>
      <Link
        to={href || "#"}
        className={cn(
          "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
          className
        )}
        {...props}
        ref={ref}
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