import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { PrismaClient } from 'https://esm.sh/@prisma/client'

const prisma = new PrismaClient()
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )
    
    // Get the user from the request
    const { data: { user } } = await supabaseClient.auth.getUser()
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    const url = new URL(req.url)
    const path = url.pathname.split('/')
    const id = path[path.length - 1]

    // GET /vibes - Get all vibes with pagination
    if (req.method === 'GET' && path.length === 2) {
      const page = Number(url.searchParams.get('page') || '1')
      const limit = Number(url.searchParams.get('limit') || '10')
      const skip = (page - 1) * limit
      
      const vibes = await prisma.vibes.findMany({
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: { user: { select: { username: true, avatar_url: true } } },
      })
      
      return new Response(JSON.stringify(vibes), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }
    
    // GET /vibes/:id - Get a specific vibe
    if (req.method === 'GET' && id) {
      const vibe = await prisma.vibes.findUnique({
        where: { id },
        include: { user: { select: { username: true, avatar_url: true } } },
      })
      
      if (!vibe) {
        return new Response(JSON.stringify({ error: 'Vibe not found' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        })
      }
      
      return new Response(JSON.stringify(vibe), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }
    
    // POST /vibes - Create a new vibe
    if (req.method === 'POST') {
      const { content } = await req.json()
      
      const vibe = await prisma.vibes.create({
        data: {
          content,
          user_id: user.id,
        },
      })
      
      return new Response(JSON.stringify(vibe), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201,
      })
    }
    
    // PUT /vibes/:id - Update a vibe
    if (req.method === 'PUT' && id) {
      const { content } = await req.json()
      
      // Check if the vibe belongs to the user
      const existingVibe = await prisma.vibes.findUnique({
        where: { id },
      })
      
      if (!existingVibe) {
        return new Response(JSON.stringify({ error: 'Vibe not found' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        })
      }
      
      if (existingVibe.user_id !== user.id) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        })
      }
      
      const vibe = await prisma.vibes.update({
        where: { id },
        data: { content },
      })
      
      return new Response(JSON.stringify(vibe), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }
    
    // DELETE /vibes/:id - Delete a vibe
    if (req.method === 'DELETE' && id) {
      // Check if the vibe belongs to the user
      const existingVibe = await prisma.vibes.findUnique({
        where: { id },
      })
      
      if (!existingVibe) {
        return new Response(JSON.stringify({ error: 'Vibe not found' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        })
      }
      
      if (existingVibe.user_id !== user.id) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        })
      }
      
      await prisma.vibes.delete({
        where: { id },
      })
      
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }
    
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 405,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})