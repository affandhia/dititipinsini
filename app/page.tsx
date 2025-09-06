'use client';

import React from 'react';

import { CalculatorCard } from '@/libs/frontend/components/CalculatorCard';
import { Navbar } from '@/libs/frontend/components/Navbar';

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        <CalculatorCard />
      </div>
    </main>
  );
}
