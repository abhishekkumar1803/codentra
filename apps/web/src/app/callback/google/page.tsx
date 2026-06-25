import { Suspense } from 'react';
import { GoogleCallbackClient } from './google-callback-client';

export default function GoogleCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <GoogleCallbackClient />
    </Suspense>
  );
}
