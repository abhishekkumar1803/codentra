import { redirect } from 'next/navigation';

export default function SubscribeRedirectPage() {
  redirect('/dashboard/settings/subscription');
}
