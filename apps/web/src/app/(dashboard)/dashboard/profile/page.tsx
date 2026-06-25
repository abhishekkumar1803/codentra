'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Skeleton,
} from '@codentra/ui';
import {
  useUpdateProfile,
  useUploadAvatar,
  useUserProfile,
  useUserStats,
  useRatingHistory,
  useContestHistory,
} from '@/features/users/hooks/use-users';
import { RatingChart } from '@/features/users/components/rating-chart';
import { ContestActivityChart } from '@/features/users/components/contest-activity-chart';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  bio: z.string().max(500).optional(),
  skills: z.string().optional(),
  githubUrl: z.string().optional(),
  linkedinUrl: z.string().optional(),
  twitterUrl: z.string().optional(),
  websiteUrl: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { data: profile, isLoading } = useUserProfile();
  const { data: stats } = useUserStats();
  const { data: dsaHistory } = useRatingHistory('DSA');
  const { data: cpHistory } = useRatingHistory('CP');
  const { data: contestHistory } = useContestHistory();
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name,
        bio: profile.bio ?? '',
        skills: profile.skills.join(', '),
        githubUrl: profile.githubUrl ?? '',
        linkedinUrl: profile.linkedinUrl ?? '',
        twitterUrl: profile.twitterUrl ?? '',
        websiteUrl: profile.websiteUrl ?? '',
      });
    }
  }, [profile, reset]);

  const onSubmit = (data: ProfileForm) => {
    updateProfile.mutate({
      name: data.name,
      bio: data.bio || undefined,
      skills: data.skills
        ? data.skills.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      githubUrl: data.githubUrl || undefined,
      linkedinUrl: data.linkedinUrl || undefined,
      twitterUrl: data.twitterUrl || undefined,
      websiteUrl: data.websiteUrl || undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-muted-foreground">
          Update your public profile and social links.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <RatingChart
          title="DSA Rating"
          type="DSA"
          currentRating={stats?.dsaRating ?? 1200}
          history={dsaHistory?.items ?? []}
        />
        <RatingChart
          title="CP Rating"
          type="CP"
          currentRating={stats?.cpRating ?? 1200}
          history={cpHistory?.items ?? []}
        />
      </div>

      <ContestActivityChart history={contestHistory?.items ?? []} />

      <Card>
        <CardHeader>
          <CardTitle>Avatar</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          {profile?.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatarUrl}
              alt=""
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
              {profile?.name?.charAt(0) ?? 'U'}
            </div>
          )}
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadAvatar.mutate(file);
              }}
            />
            <span className="inline-flex h-9 items-center rounded-md border px-3 text-sm">
              {uploadAvatar.isPending ? 'Uploading...' : 'Upload photo'}
            </span>
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...register('name')} />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <textarea
                id="bio"
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                {...register('bio')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="skills">Skills (comma-separated)</Label>
              <Input
                id="skills"
                placeholder="TypeScript, React, Node.js"
                {...register('skills')}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="githubUrl">GitHub</Label>
                <Input id="githubUrl" {...register('githubUrl')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedinUrl">LinkedIn</Label>
                <Input id="linkedinUrl" {...register('linkedinUrl')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitterUrl">Twitter / X</Label>
                <Input id="twitterUrl" {...register('twitterUrl')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="websiteUrl">Website</Label>
                <Input id="websiteUrl" {...register('websiteUrl')} />
              </div>
            </div>

            <Button
              type="submit"
              disabled={!isDirty || updateProfile.isPending}
            >
              {updateProfile.isPending ? 'Saving...' : 'Save changes'}
            </Button>

            {updateProfile.isSuccess && (
              <p className="text-sm text-green-600">Profile updated.</p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
