'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Button, Card, CardContent, Skeleton } from '@codentra/ui';
import { ReferralCard } from '@/features/referrals/components/referral-card';
import { useMyReferrals, useReferrals } from '@/features/referrals/hooks/use-referrals';

export default function ReferralsPage() {
  const [tab, setTab] = useState<'board' | 'mine'>('board');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');

  const { data: board, isLoading: boardLoading } = useReferrals({
    search: query || undefined,
    company: companyFilter || undefined,
    limit: 30,
  });
  const { data: mine, isLoading: mineLoading } = useMyReferrals();

  const isLoading = tab === 'board' ? boardLoading : mineLoading;
  const items = tab === 'board' ? board?.items : mine?.items;

  const companies = useMemo(() => {
    if (!board?.items.length) return [];
    return [...new Set(board.items.map((r) => r.company))].sort();
  }, [board?.items]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Referrals</h1>
          <p className="mt-1 text-muted-foreground">
            Browse open roles, express interest, and connect with referrers in
            the community.
          </p>
        </div>
        <Link href="/referrals/new">
          <Button>Post a referral</Button>
        </Link>
      </div>

      <Card className="border-dashed">
        <CardContent className="py-4 text-sm text-muted-foreground">
          <strong className="text-foreground">How it works:</strong> browse
          open referrals → read requirements → express interest → get the
          referrer&apos;s contact to follow up.
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button
          size="sm"
          variant={tab === 'board' ? 'default' : 'outline'}
          onClick={() => setTab('board')}
        >
          Open referrals
        </Button>
        <Button
          size="sm"
          variant={tab === 'mine' ? 'default' : 'outline'}
          onClick={() => setTab('mine')}
        >
          My posts
        </Button>
      </div>

      {tab === 'board' && (
        <>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              setQuery(search);
            }}
          >
            <input
              className="flex h-10 flex-1 rounded-md border border-input bg-background px-3 text-sm"
              placeholder="Search company or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button type="submit">Search</Button>
          </form>

          {companies.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={companyFilter === '' ? 'default' : 'outline'}
                onClick={() => setCompanyFilter('')}
              >
                All companies
              </Button>
              {companies.slice(0, 8).map((company) => (
                <Button
                  key={company}
                  size="sm"
                  variant={companyFilter === company ? 'default' : 'outline'}
                  onClick={() => setCompanyFilter(company)}
                >
                  {company}
                </Button>
              ))}
            </div>
          )}
        </>
      )}

      {isLoading && <Skeleton className="h-48 w-full" />}

      {!isLoading && !items?.length && (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            {tab === 'board'
              ? 'No open referrals match your filters.'
              : 'You have not posted any referrals.'}
            {tab === 'mine' && (
              <div className="mt-4">
                <Link href="/referrals/new">
                  <Button size="sm">Post your first referral</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {items?.map((r) => (
          <ReferralCard key={r.id} referral={r} />
        ))}
      </div>
    </div>
  );
}
