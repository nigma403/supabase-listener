import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const VERCEL_WEBHOOK_URL = process.env.VERCEL_WEBHOOK_URL;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const channel = supabase
  .channel('service_requests_ezstep_listener')
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'Service_Requests_EZSTEP' },
    async (payload) => {
      console.log('New row detected:', payload.new);
      try {
        const res = await fetch(VERCEL_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ new: payload.new }),
        });

        const data = await res.json();
        if (!res.ok) {
          console.error('Vercel webhook failed:', data);
        } else {
          console.log('Successfully sent to Vercel:', data);
        }
      } catch (err) {
        console.error('Error sending to Vercel:', err.message);
      }
    }
  )
  .subscribe();

console.log('Listener running...');
