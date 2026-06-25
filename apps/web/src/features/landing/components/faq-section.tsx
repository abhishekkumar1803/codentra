'use client';

import { useState } from 'react';
import { cn } from '@codentra/ui';
import { FAQ_ITEMS } from '../constants/faq';

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Frequently asked questions
          </h1>
          <p className="mt-4 text-muted-foreground">
            Everything you need to know about Codentra.
          </p>
        </div>

        <div className="mt-12 divide-y border-t">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={item.question}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between py-5 text-left text-sm font-medium sm:text-base"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                >
                  {item.question}
                  <span
                    className={cn(
                      'ml-4 shrink-0 text-muted-foreground transition-transform',
                      isOpen && 'rotate-180',
                    )}
                    aria-hidden
                  >
                    ▾
                  </span>
                </button>
                {isOpen && (
                  <p className="pb-5 text-sm leading-relaxed text-muted-foreground">
                    {item.answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
