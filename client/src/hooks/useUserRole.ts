import { useState, useEffect } from 'react';

export type UserRole = 'customer' | 'driver' | 'admin';

export function useUserRole() {
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem('spoedpakketjes_user_role');
    return (saved as UserRole) || 'customer';
  });

  const switchRole = (role: UserRole) => {
    setCurrentRole(role);
    localStorage.setItem('spoedpakketjes_user_role', role);
  };

  useEffect(() => {
    localStorage.setItem('spoedpakketjes_user_role', currentRole);
  }, [currentRole]);

  return {
    currentRole,
    switchRole,
    isCustomer: currentRole === 'customer',
    isDriver: currentRole === 'driver',
    isAdmin: currentRole === 'admin'
  };
}