import { PrismaClient } from '@prisma/client';

// Mock the Prisma client
jest.mock('@prisma/client', () => {
  const mockFindMany = jest.fn();
  const mockFindUnique = jest.fn();
  const mockCreate = jest.fn();
  const mockUpdate = jest.fn();
  const mockDelete = jest.fn();
  
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      vibes: {
        findMany: mockFindMany,
        findUnique: mockFindUnique,
        create: mockCreate,
        update: mockUpdate,
        delete: mockDelete,
      },
      $connect: jest.fn(),
      $disconnect: jest.fn(),
    })),
  };
});

// Mock the request and response objects
const mockRequest = (method: string, body: any = null, params: any = {}) => {
  const req: any = {
    method,
    headers: {
      get: jest.fn().mockReturnValue('Bearer token'),
    },
    url: 'http://localhost:8000/vibes',
  };
  
  if (body) {
    req.json = jest.fn().mockResolvedValue(body);
  }
  
  if (params.id) {
    req.url += `/${params.id}`;
  }
  
  if (params.page || params.limit) {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append('page', params.page);
    if (params.limit) searchParams.append('limit', params.limit);
    req.url += `?${searchParams.toString()}`;
  }
  
  return req;
};

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn().mockReturnValue({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: {
          user: { id: 'test-user-id' },
        },
      }),
    },
  }),
}));

// Mock Deno environment
global.Deno = {
  env: {
    get: jest.fn().mockImplementation((key) => {
      if (key === 'SUPABASE_URL') return 'https://example.supabase.co';
      if (key === 'SUPABASE_ANON_KEY') return 'test-anon-key';
      return null;
    }),
  },
} as any;

describe('Vibes Edge Function', () => {
  let prisma: any;
  
  beforeEach(() => {
    jest.clearAllMocks();
    prisma = new PrismaClient();
  });
  
  describe('GET /vibes', () => {
    it('should return paginated vibes', async () => {
      const mockVibes = [
        {
          id: 'vibe-1',
          content: 'Test vibe 1',
          user_id: 'test-user-id',
          created_at: new Date().toISOString(),
          user: { username: 'testuser', avatar_url: 'https://example.com/avatar.jpg' },
        },
      ];
      
      prisma.vibes.findMany.mockResolvedValue(mockVibes);
      
      const req = mockRequest('GET', null, { page: '1', limit: '10' });
      
      // Import the handler dynamically to avoid issues with Deno imports
      const { default: handler } = await import('../supabase/functions/vibes/index');
      const response = await handler(req);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toEqual(mockVibes);
      expect(prisma.vibes.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        orderBy: { created_at: 'desc' },
        include: { user: { select: { username: true, avatar_url: true } } },
      });
    });
  });
  
  describe('GET /vibes/:id', () => {
    it('should return a specific vibe', async () => {
      const mockVibe = {
        id: 'vibe-1',
        content: 'Test vibe 1',
        user_id: 'test-user-id',
        created_at: new Date().toISOString(),
        user: { username: 'testuser', avatar_url: 'https://example.com/avatar.jpg' },
      };
      
      prisma.vibes.findUnique.mockResolvedValue(mockVibe);
      
      const req = mockRequest('GET', null, { id: 'vibe-1' });
      
      const { default: handler } = await import('../supabase/functions/vibes/index');
      const response = await handler(req);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toEqual(mockVibe);
      expect(prisma.vibes.findUnique).toHaveBeenCalledWith({
        where: { id: 'vibe-1' },
        include: { user: { select: { username: true, avatar_url: true } } },
      });
    });
    
    it('should return 404 if vibe not found', async () => {
      prisma.vibes.findUnique.mockResolvedValue(null);
      
      const req = mockRequest('GET', null, { id: 'non-existent-vibe' });
      
      const { default: handler } = await import('../supabase/functions/vibes/index');
      const response = await handler(req);
      
      expect(response.status).toBe(404);
    });
  });
  
  describe('POST /vibes', () => {
    it('should create a new vibe', async () => {
      const mockVibe = {
        id: 'new-vibe-id',
        content: 'New vibe content',
        user_id: 'test-user-id',
        created_at: new Date().toISOString(),
      };
      
      prisma.vibes.create.mockResolvedValue(mockVibe);
      
      const req = mockRequest('POST', { content: 'New vibe content' });
      
      const { default: handler } = await import('../supabase/functions/vibes/index');
      const response = await handler(req);
      const data = await response.json();
      
      expect(response.status).toBe(201);
      expect(data).toEqual(mockVibe);
      expect(prisma.vibes.create).toHaveBeenCalledWith({
        data: {
          content: 'New vibe content',
          user_id: 'test-user-id',
        },
      });
    });
  });
});