'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { ServiceCatalogItem } from '@codentra/types';
import { Button, Input, Label } from '@codentra/ui';
import { useBookService } from '../hooks/use-services';

type Props = {
  service: ServiceCatalogItem | null;
  open: boolean;
  onClose: () => void;
};

function formatPrice(paise: number) {
  return `₹${(paise / 100).toLocaleString('en-IN')}`;
}

export function ServiceBookingDialog({ service, open, onClose }: Props) {
  const bookService = useBookService();
  const [preferredDate, setPreferredDate] = useState('');
  const [notes, setNotes] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!open || !service) return null;

  const needsLinkedIn = service.type === 'LINKEDIN_REVIEW';
  const needsResume = service.type === 'RESUME_REVIEW';
  const needsDate =
    service.type === 'MOCK_INTERVIEW' ||
    service.type === 'CAREER_CALL' ||
    service.type === 'RESUME_REVIEW';

  const resetAndClose = () => {
    setPreferredDate('');
    setNotes('');
    setLinkedinUrl('');
    setResumeUrl('');
    setError(null);
    setSuccess(false);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (needsLinkedIn && !linkedinUrl.trim()) {
      setError('LinkedIn profile URL is required.');
      return;
    }
    if (needsResume && !resumeUrl.trim()) {
      setError('Resume link is required.');
      return;
    }
    if (needsDate && !preferredDate) {
      setError('Please pick a preferred date.');
      return;
    }

    bookService.mutate(
      {
        type: service.type,
        preferredDate: preferredDate || undefined,
        notes: notes.trim() || undefined,
        linkedinUrl: linkedinUrl.trim() || undefined,
        resumeUrl: resumeUrl.trim() || undefined,
      },
      {
        onSuccess: () => setSuccess(true),
        onError: () => setError('Booking failed. Please try again.'),
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Close dialog"
        onClick={resetAndClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-title"
        className="relative z-10 w-full max-w-md rounded-lg border bg-background p-6 shadow-xl"
      >
        {success ? (
          <div className="space-y-4 text-center">
            <p className="text-lg font-semibold text-green-600">
              Booking confirmed
            </p>
            <p className="text-sm text-muted-foreground">
              Your {service.title} session has been booked for{' '}
              {formatPrice(service.amount)}. A mentor will reach out shortly.
            </p>
            <div className="flex justify-center gap-2">
              <Link href="/services/bookings">
                <Button onClick={resetAndClose}>View bookings</Button>
              </Link>
              <Button variant="outline" onClick={resetAndClose}>
                Close
              </Button>
            </div>
          </div>
        ) : (
          <>
            <h2 id="booking-title" className="text-lg font-semibold">
              Book {service.title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {service.description}
            </p>
            <p className="mt-2 font-semibold">
              {formatPrice(service.amount)}
              {service.durationMinutes
                ? ` · ${service.durationMinutes} min`
                : ''}
            </p>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {needsResume && (
                <div className="space-y-2">
                  <Label htmlFor="resumeUrl">Resume link</Label>
                  <Input
                    id="resumeUrl"
                    type="url"
                    placeholder="https://drive.google.com/..."
                    value={resumeUrl}
                    onChange={(e) => setResumeUrl(e.target.value)}
                    required
                  />
                </div>
              )}

              {needsLinkedIn && (
                <div className="space-y-2">
                  <Label htmlFor="linkedinUrl">LinkedIn profile URL</Label>
                  <Input
                    id="linkedinUrl"
                    type="url"
                    placeholder="https://linkedin.com/in/your-profile"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    required
                  />
                </div>
              )}

              {needsDate && (
                <div className="space-y-2">
                  <Label htmlFor="preferredDate">Preferred date</Label>
                  <Input
                    id="preferredDate"
                    type="date"
                    value={preferredDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <textarea
                  id="notes"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Goals, experience level, or questions for your mentor..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="flex gap-2 pt-2">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={bookService.isPending}
                >
                  {bookService.isPending
                    ? 'Processing payment...'
                    : `Pay ${formatPrice(service.amount)} & book`}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetAndClose}
                  disabled={bookService.isPending}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
