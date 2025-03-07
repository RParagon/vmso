
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types';

const supabaseUrl = 'https://xmbtnqlrkpfayltwprma.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtYnRucWxya3BmYXlsdHdwcm1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyODQ5NzQsImV4cCI6MjA1Njg2MDk3NH0.nXfn8rxBWOFel5w4bcQTmnAMQRIk_b3cMadrdqknPVE';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
