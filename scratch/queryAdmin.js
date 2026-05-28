const https = require('https');
const url = 'https://rthdnwkwocojijyfcrtr.supabase.co/rest/v1/admin_users?select=*';
const opts = new URL(url);
opts.headers = {
  apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0aGRud2t3b2NvamlqeWZjcnRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3MTY3NDAsImV4cCI6MjA4MTI5Mjc0MH0.zTrbAG5B5SWlFBW__qJgJhOZcRQrmfxsryyiixQI0LI',
  Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0aGRud2t3b2NvamlqeWZjcnRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3MTY3NDAsImV4cCI6MjA4MTI5Mjc0MH0.zTrbAG5B5SWlFBW__qJgJhOZcRQrmfxsryyiixQI0LI'
};
https.get(opts, res => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('STATUS', res.statusCode);
    console.log(body);
  });
}).on('error', err => {
  console.error('ERROR', err.message);
});
