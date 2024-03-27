import { useRouter } from 'next/router';
import React, { ComponentType, useEffect, ReactElement } from 'react';
import { useAuth } from '../context/authContext';

interface WithAuthProps {
  // You can add specific props for the HOC here if needed
}

function withAuth<P extends object>(WrappedComponent: ComponentType<P>): ComponentType<P & WithAuthProps> {
  // This component now returns a function that explicitly accepts all props P
  // and returns a ReactElement or null.
  return function WithAuthComponent(props: P): ReactElement | null {
    const { isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isAuthenticated) {
        router.push('/pages/login');
      }
    }, [isAuthenticated, router]);

    // Correctly spread the props to the WrappedComponent
    return <WrappedComponent {...props} />;
  };
}

export default withAuth;
