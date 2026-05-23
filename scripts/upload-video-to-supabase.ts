import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = 'https://rthdnwkwocojijyfcrtr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0aGRud2t3b2NvamlqeWZjcnRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3MTY3NDAsImV4cCI6MjA4MTI5Mjc0MH0.zTrbAG5B5SWlFBW__qJgJhOZcRQrmfxsryyiixQI0LI';

// Try to get service role key from environment
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseKey;

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function uploadVideo() {
  try {
    console.log('🎬 Starting video upload to Supabase Storage...');

    // Try to create bucket using REST API
    try {
      console.log('📦 Creating "videos" bucket via REST API...');
      const createBucketResponse = await fetch(
        `${supabaseUrl}/storage/v1/bucket`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${serviceRoleKey}`,
          },
          body: JSON.stringify({
            name: 'videos',
            public: true,
          }),
        }
      );

      if (createBucketResponse.ok) {
        console.log('✅ Bucket created successfully');
      } else if (createBucketResponse.status === 409) {
        console.log('✅ Bucket "videos" already exists');
      } else {
        const error = await createBucketResponse.text();
        console.log('⚠️  Bucket creation response:', createBucketResponse.status, error);
      }
    } catch (e: any) {
      console.log('⚠️  Could not create bucket:', e.message);
    }

    // Read video file
    const videoPath = path.join(process.cwd(), 'public', 'videos', 'futbolm.mp4');
    
    if (!fs.existsSync(videoPath)) {
      console.error('❌ Video file not found at:', videoPath);
      return;
    }

    const fileBuffer = fs.readFileSync(videoPath);
    const fileName = 'futbolm.mp4';

    console.log(`📤 Uploading ${fileName} (${(fileBuffer.length / 1024 / 1024).toFixed(2)} MB)...`);

    // Upload file
    const { data, error } = await supabase.storage
      .from('videos')
      .upload(fileName, fileBuffer, {
        contentType: 'video/mp4',
        upsert: true,
      });

    if (error) {
      console.error('❌ Upload error:', error);
      return;
    }

    console.log('✅ File uploaded successfully:', data);

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('videos')
      .getPublicUrl(fileName);

    const publicUrl = publicUrlData?.publicUrl;
    console.log('\n🎥 Public Video URL:');
    console.log(publicUrl);

    // Save URL to .env.local
    const envPath = path.join(process.cwd(), '.env.local');
    let envContent = fs.readFileSync(envPath, 'utf-8');
    
    // Remove existing VITE_SUPABASE_VIDEO_URL if present
    envContent = envContent.replace(/VITE_SUPABASE_VIDEO_URL=.*\n?/g, '');
    
    // Add new URL
    envContent += `\n# Supabase Video URL\nVITE_SUPABASE_VIDEO_URL=${publicUrl}\n`;
    
    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ URL saved to .env.local as VITE_SUPABASE_VIDEO_URL');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

uploadVideo();
