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
import { LogOut, Menu, UserCircle, Book } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import React from "react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useTranslation } from 'react-i18next';

const FlagSK = () => (
  <svg width="24" height="16" viewBox="0 0 32 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="8" fill="#FFFFFF"/>
    <rect y="8" width="32" height="8" fill="#0B4EA2"/>
    <rect y="16" width="32" height="8" fill="#EE1C25"/>
    {/* State emblem background */}
    <path d="M2 4V20H12V4H2Z" fill="#EE1C25"/>
    {/* Double cross */}
    <path d="M4 7H10V8H8V17H10V18H4V17H6V8H4V7Z" fill="#FFFFFF"/>
    <path d="M5 10H9V11H5V10Z" fill="#FFFFFF"/>
    <path d="M5 14H9V15H5V14Z" fill="#FFFFFF"/>
    {/* Three hills */}
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

  const handleLanguageChange = (lang: 'en' | 'sk') => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="border-b shadow-sm bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Language Selection */}
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-primary tracking-tight">PDFMaster</h1>
              </Link>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="w-8 h-8 p-0" 
                  onClick={() => handleLanguageChange('sk')}
                >
                  <FlagSK />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="w-8 h-8 p-0"
                  onClick={() => handleLanguageChange('en')}
                >
                  <FlagEN />
                </Button>
              </div>
            </div>

            {/* Desktop navigation */}
            <div className="hidden md:block">
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>{t('nav.pdfTools')}</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                        {pdfActions.map((features) => (
                          <ListItem
                            key={features.path}
                            title={t(`pdf.features.${features.titleKey}.title`)}
                            href={features.path}
                          >
                            {t(`pdf.features.${features.titleKey}.description`)}
                          </ListItem>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Button variant="ghost" asChild>
                      <Link to="/guide" className="flex items-center">
                        <Book className="mr-2 h-4 w-4" />
                        {t('nav.guide')}
                      </Link>
                    </Button>
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
                {isAdmin && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => navigate('/admin/history')}
                    className="flex items-center"
                  >
                    {t('nav.adminHistory')}
                  </Button>
                )}
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
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">{t('nav.login')}</Button>
                </Link>
                <Link to="/register">
                  <Button variant="default" size="sm">{t('nav.register')}</Button>
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
                      <>
                        {isAdmin && (
                          <Button
                            variant="default"
                            className="w-full flex items-center justify-center mb-2"
                            onClick={() => {
                              navigate('/admin/history');
                              setOpen(false);
                            }}
                          >
                            {t('nav.adminHistory')}
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          className="w-full flex items-center justify-center"
                          onClick={() => {
                            handleLogout();
                            setOpen(false);
                          }}
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          {t('nav.logout')}
                        </Button>
                      </>
                    ) : (
                      <div className="flex flex-col space-y-2">
                        <Link to="/login" onClick={() => setOpen(false)}>
                          <Button variant="outline" className="w-full">{t('nav.login')}</Button>
                        </Link>
                        <Link to="/register" onClick={() => setOpen(false)}>
                          <Button variant="default" className="w-full">{t('nav.register')}</Button>
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