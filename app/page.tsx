import React from 'react';

import { Button } from '@/libs/frontend/components/core/button';

export default function Home() {
  return (
    <main>
      <h1 className="text-3xl font-bold underline">{'Hello world!'}</h1>
      <Button variant="outline">{'Get Started'}</Button>
    </main>
  );
}
