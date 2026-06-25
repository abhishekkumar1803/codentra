'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@codentra/ui';
import { ScrollReveal } from '@/shared/components/scroll-reveal';
import { PLATFORM_FEATURES } from '../constants/features';

const iconMap: Record<string, string> = {
  code: '</>',
  trophy: '🏆',
  layers: '⬡',
  quiz: '?',
  briefcase: '💼',
  users: '👥',
  chart: '📊',
  star: '★',
};

export function FeaturesSection() {
  return (
    <section id="features" className="scroll-mt-20 px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <ScrollReveal>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to grow
            </h2>
            <p className="mt-4 text-muted-foreground">
              One membership unlocks the full suite of learning, competition,
              and career tools.
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PLATFORM_FEATURES.map((feature, index) => (
            <ScrollReveal key={feature.title} delay={index * 80}>
              <Card className="h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <CardHeader className="pb-2">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-lg">
                    {iconMap[feature.icon] ?? '•'}
                  </div>
                  <CardTitle className="text-base">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
