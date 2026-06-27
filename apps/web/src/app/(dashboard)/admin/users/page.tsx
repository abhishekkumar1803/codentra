'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, Card, CardContent, Input, Skeleton } from '@codentra/ui';
import { useAdminUsers } from '@/features/admin/hooks/use-admin';

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const { data, isLoading } = useAdminUsers({ search: query || undefined });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        <p className="mt-1 text-muted-foreground">Manage platform users.</p>
      </div>

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setQuery(search);
        }}
      >
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Button type="submit">Search</Button>
      </form>

      {isLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : (
        <Card>
          <CardContent className="pt-6">
            {!data?.items.length ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No users found.
              </p>
            ) : (
              <ul className="divide-y">
                {data.items.map((user) => (
                  <li
                    key={user.id}
                    className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"
                  >
                    <div>
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="font-medium hover:underline"
                      >
                        {user.name}
                      </Link>
                      <p className="text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <span>{user.role}</span>
                      <span>{user.subscriptionStatus ?? 'No sub'}</span>
                      <span>{user.isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
