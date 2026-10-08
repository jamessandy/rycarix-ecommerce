'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login');
  }, [router]);

  return (
    <div className="min-h-screen bg-ry-pearl pt-32 text-center text-xs text-ry-stone">
      Redirecting to Client Registration...
    </div>
  );
}
