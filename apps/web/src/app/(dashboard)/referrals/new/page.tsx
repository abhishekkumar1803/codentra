'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from '@codentra/ui';
import { useCreateReferral } from '@/features/referrals/hooks/use-referrals';

export default function NewReferralPage() {
  const router = useRouter();
  const createReferral = useCreateReferral();
  const [company, setCompany] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createReferral.mutate(
      {
        company,
        roleTitle,
        description,
        requirements: requirements || undefined,
        contactEmail: contactEmail || undefined,
      },
      { onSuccess: () => router.push('/referrals') },
    );
  };

  return (
    <div className="space-y-6">
      <Link
        href="/referrals"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back to referrals
      </Link>
      <h1 className="text-2xl font-bold tracking-tight">Post a referral</h1>

      <Card>
        <CardHeader>
          <CardTitle>Referral details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="roleTitle">Role title</Label>
              <Input
                id="roleTitle"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                className="flex min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                minLength={20}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="requirements">Requirements (optional)</Label>
              <textarea
                id="requirements"
                className="flex min-h-16 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact email (optional)</Label>
              <Input
                id="contactEmail"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={createReferral.isPending}>
              {createReferral.isPending ? 'Posting...' : 'Post referral'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
