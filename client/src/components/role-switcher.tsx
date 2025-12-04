import { useState } from "react";
import { useUserRole, type UserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Truck, Shield, ChevronDown, X } from "lucide-react";

export default function RoleSwitcher() {
  const { currentRole, switchRole } = useUserRole();
  const [isOpen, setIsOpen] = useState(false);

  const roles = [
    {
      id: 'customer' as UserRole,
      name: 'Klant',
      description: 'Bestellen en volgen',
      icon: User,
      color: 'bg-blue-500'
    },
    {
      id: 'driver' as UserRole,
      name: 'Bezorger',
      description: 'Bezorgingen uitvoeren',
      icon: Truck,
      color: 'bg-green-500'
    },
    {
      id: 'admin' as UserRole,
      name: 'Beheerder',
      description: 'Systeem beheren',
      icon: Shield,
      color: 'bg-purple-500'
    }
  ];

  const currentRoleData = roles.find(role => role.id === currentRole);
  const CurrentIcon = currentRoleData?.icon || User;

  const handleRoleSwitch = (role: UserRole) => {
    switchRole(role);
    setIsOpen(false);
  };

  return (
    <>
      {/* Role Switcher Button */}
      <div className="fixed top-16 right-4 z-50">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="bg-white/95 backdrop-blur-sm shadow-lg border-2 border-brand-blue"
        >
          <div className={`w-3 h-3 rounded-full ${currentRoleData?.color} mr-2`}></div>
          <CurrentIcon className="h-4 w-4 mr-2" />
          <span className="font-medium">{currentRoleData?.name}</span>
          <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </Button>
      </div>

      {/* Role Selection Overlay */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed top-20 right-4 z-50">
            <Card className="shadow-2xl border-2 border-brand-blue w-64">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Wissel van rol</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="w-6 h-6 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {roles.map((role) => {
                    const Icon = role.icon;
                    const isActive = role.id === currentRole;
                    
                    return (
                      <Button
                        key={role.id}
                        variant={isActive ? "default" : "ghost"}
                        className={`w-full justify-start p-3 h-auto ${
                          isActive ? 'bg-brand-blue text-white' : 'hover:bg-gray-100'
                        }`}
                        onClick={() => handleRoleSwitch(role.id)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full ${role.color} flex items-center justify-center`}>
                            <Icon className="h-4 w-4 text-white" />
                          </div>
                          <div className="text-left">
                            <p className="font-medium">{role.name}</p>
                            <p className={`text-xs ${isActive ? 'text-blue-100' : 'text-gray-500'}`}>
                              {role.description}
                            </p>
                          </div>
                          {isActive && (
                            <Badge variant="secondary" className="ml-auto text-xs">
                              Actief
                            </Badge>
                          )}
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </>
  );
}