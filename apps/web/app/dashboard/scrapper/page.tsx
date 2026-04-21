import React from 'react';
import { IndeedScrapper } from '../../../components/scrapper/IndeedScrapper';
import { createClient } from "@/lib/supabase/server";
import { redirect } from 'next/navigation';

export default async function ScrapperPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    return <IndeedScrapper userId={user.id} />;
}
