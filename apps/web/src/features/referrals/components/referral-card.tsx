'use client';

import { useState } from 'react';
import type { ReferralListItem } from '@codentra/types';
import { Button, Card, CardContent } from '@codentra/ui';
import { useExpressInterest, useCloseReferral } from '../hooks/use-referrals';

export function ReferralCard({ referral }: { referral: ReferralListItem }) {
  const [expanded, setExpanded] = useState(false);
  const [interestNote, setInterestNote] = useState('');
  const [contact, setContact] = useState<{
    email: string | null;
    mailtoLink: string | null;
  } | null>(null);

  const expressInterest = useExpressInterest();
  const closeReferral = useCloseReferral();

  const isOpen = referral.status === 'OPEN';

  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold">
                {referral.roleTitle} at {referral.company}
              </p>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  isOpen
                    ? 'bg-green-100 text-green-800'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {referral.status}
              </span>
            </div>
            <p
              className={`mt-2 text-sm text-muted-foreground ${
                expanded ? '' : 'line-clamp-2'
              }`}
            >
              {referral.description}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Posted by {referral.referrer.name} ·{' '}
              {new Date(referral.createdAt).toLocaleDateString('en-IN')}
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? 'Less' : 'Details'}
            </Button>
            {referral.isOwner && isOpen && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => closeReferral.mutate(referral.id)}
                disabled={closeReferral.isPending}
              >
                Close
              </Button>
            )}
          </div>
        </div>

        {expanded && (
          <div className="mt-4 space-y-4 border-t pt-4">
            {referral.requirements && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Requirements
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm">
                  {referral.requirements}
                </p>
              </div>
            )}

            {!referral.isOwner && isOpen && (
              <div className="space-y-3 rounded-md border bg-muted/20 p-4">
                <p className="text-sm font-medium">Interested in this role?</p>
                <textarea
                  className="min-h-[72px] w-full rounded-md border bg-background px-3 py-2 text-sm"
                  placeholder="Brief intro — your experience, why you're a fit..."
                  value={interestNote}
                  onChange={(e) => setInterestNote(e.target.value)}
                />
                <Button
                  size="sm"
                  disabled={expressInterest.isPending}
                  onClick={() =>
                    expressInterest.mutate(
                      { id: referral.id, message: interestNote },
                      {
                        onSuccess: (data) =>
                          setContact({
                            email: data.contactEmail,
                            mailtoLink: data.mailtoLink,
                          }),
                      },
                    )
                  }
                >
                  {expressInterest.isPending
                    ? 'Sending...'
                    : 'Express interest'}
                </Button>

                {contact && (
                  <div className="text-sm">
                    <p className="text-green-600">{expressInterest.data?.message}</p>
                    {contact.mailtoLink ? (
                      <a
                        href={contact.mailtoLink}
                        className="mt-2 inline-block text-primary underline"
                      >
                        Email referrer ({contact.email})
                      </a>
                    ) : (
                      <p className="mt-2 text-muted-foreground">
                        The referrer did not leave a contact email — they were
                        notified in-app.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {referral.isOwner && referral.contactEmail && (
              <p className="text-xs text-muted-foreground">
                Contact on file: {referral.contactEmail}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
