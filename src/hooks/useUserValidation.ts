import { useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';

export function useUserValidation() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      // Validate that the user actually exists in the database
      const validateUser = async () => {
        try {
          const response = await fetch('/api/user/validate');
          if (!response.ok) {
            console.log('User validation failed, signing out');
            await signOut({ redirect: true });
          }
        } catch (error) {
          console.error('Error validating user:', error);
          await signOut({ redirect: true });
        }
      };

      validateUser();
    }
  }, [session, status]);
}
