import { Card, CardContent } from '@codentra/ui';

export default function EmployerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Employer portal</h1>
        <p className="mt-1 text-muted-foreground">
          Post jobs and manage hiring on Codentra.
        </p>
      </div>
      <Card>
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          Employer tools are coming soon. Contact{' '}
          <a
            href="mailto:hello@codentra.com"
            className="text-primary underline"
          >
            hello@codentra.com
          </a>{' '}
          to post jobs in the meantime.
        </CardContent>
      </Card>
    </div>
  );
}
