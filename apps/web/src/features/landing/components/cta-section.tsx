import Link from 'next/link';
import { Button } from '@codentra/ui';

export function CtaSection() {
  return (
    <section className="px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-4xl rounded-2xl bg-primary px-6 py-16 text-center text-primary-foreground sm:px-12">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Ready to accelerate your career?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
          Join thousands of developers learning, competing, and growing on
          Codentra.
        </p>
        <Link href="/register" className="mt-8 inline-block">
          <Button
            size="lg"
            variant="secondary"
            className="bg-white text-primary hover:bg-white/90"
          >
            Create Free Account
          </Button>
        </Link>
      </div>
    </section>
  );
}
