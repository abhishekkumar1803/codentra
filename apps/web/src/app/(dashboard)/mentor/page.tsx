'use client';

import { Card, CardContent, Skeleton } from '@codentra/ui';
import { useMentorAssignments } from '@/features/services/hooks/use-services';

export default function MentorPage() {
  const { data, isLoading } = useMentorAssignments();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mentor dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Your assigned premium service sessions.
        </p>
      </div>

      {isLoading && <Skeleton className="h-32 w-full" />}

      {!isLoading && !data?.items.length && (
        <p className="text-sm text-muted-foreground">No active assignments.</p>
      )}

      {data?.items.length ? (
        <div className="space-y-3">
          {data.items.map((item) => (
            <Card key={item.id}>
              <CardContent className="py-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.user.name} · {item.user.email}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    {item.status}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  );
}
