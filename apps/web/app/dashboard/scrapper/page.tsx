import { getTenant } from '@/lib/tenant/server'
import MultiSourceScrapper from '../../../components/scrapper/MultiSourceScrapper';
import CommunityJobsBoard from '../../../components/scrapper/CommunityJobsBoard';
import { createClient } from "@/lib/supabase/server";
import { redirect } from 'next/navigation';

export default async function ScrapperPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const tenant = getTenant();

  // Community tenant: no external aggregators — show curated local jobs board
  if (!tenant.features.jobAggregators && tenant.features.localJobs) {
    return <CommunityJobsBoard userId={user.id} />;
  }

  return <MultiSourceScrapper userId={user.id} />;
}
