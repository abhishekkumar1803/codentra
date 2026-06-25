import { Card, CardContent, CardHeader, CardTitle } from '@codentra/ui';
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
    <section id="features" className="px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to level up
          </h2>
          <p className="mt-4 text-muted-foreground">
            From coding contests to career services — Codentra has you covered.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PLATFORM_FEATURES.map((feature) => (
            <Card
              key={feature.title}
              className="transition-shadow hover:shadow-md"
            >
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
          ))}
        </div>
      </div>
    </section>
  );
}
