import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zjnbyjmkjunvvesqwdsj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqbmJ5am1ranVudnZlc3F3ZHNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNzE2NjAsImV4cCI6MjA3MjY0NzY2MH0.4bwWZxkCMUycWGhafDpqDHO3xnezddJRst8DNs6CGFI';
export const supabase = createClient(supabaseUrl, supabaseKey);