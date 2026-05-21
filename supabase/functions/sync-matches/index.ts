import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const API_SPORTS_KEY = Deno.env.get('API_SPORTS_KEY') || ''
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

serve(async (req) => {
  try {
    // 1. Fetch matches from API-Football
    const response = await fetch('https://v3.football.api-sports.io/fixtures?league=1&season=2026', {
      headers: {
        'x-apisports-key': API_SPORTS_KEY
      }
    });
    
    const data = await response.json();
    
    if (!data || !data.response) {
      throw new Error('Invalid response from API-Sports');
    }

    const fixtures = data.response;
    
    // 2. Init Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // 3. Process and upsert to database
    const matchesToUpsert = fixtures.map((item: any) => {
      // Map API status to our status
      let status = 'PENDING';
      const apiStatus = item.fixture.status.short;
      
      if (['1H', 'HT', '2H', 'ET', 'BT', 'P', 'LIVE'].includes(apiStatus)) {
        status = 'LIVE';
      } else if (['FT', 'AET', 'PEN'].includes(apiStatus)) {
        status = 'FINISHED';
      }

      // Map API rounds to our stages
      let stage = 'GROUP';
      const roundName = item.league.round || '';
      if (roundName.toLowerCase().includes('16')) stage = 'ROUND16';
      if (roundName.toLowerCase().includes('quarter')) stage = 'QUARTER';
      if (roundName.toLowerCase().includes('semi')) stage = 'SEMI';
      if (roundName.toLowerCase().includes('final')) stage = 'FINAL';

      return {
        id: item.fixture.id.toString(),
        date: item.fixture.date,
        home_team: item.teams.home.name || 'TBD',
        away_team: item.teams.away.name || 'TBD',
        home_logo: item.teams.home.logo,
        away_logo: item.teams.away.logo,
        stage: stage,
        group_name: roundName.replace('Group Stage - ', ''),
        home_goals: item.goals.home,
        away_goals: item.goals.away,
        status: status,
        updated_at: new Date().toISOString()
      };
    });

    // Upsert in batches of 50
    let successCount = 0;
    for (let i = 0; i < matchesToUpsert.length; i += 50) {
      const batch = matchesToUpsert.slice(i, i + 50);
      const { error } = await supabase
        .from('mundial_matches')
        .upsert(batch, { onConflict: 'id' });
        
      if (error) {
        console.error('Error upserting batch:', error);
        throw error;
      }
      successCount += batch.length;
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Synced ${successCount} matches successfully.` 
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Function error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
