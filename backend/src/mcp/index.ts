import type { Request, Response, Router } from 'express';
import express from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { getUserFromOAuthHeader, type AuthUser } from '../auth';
import { User } from '../models/User';
import { logger } from '../utils/logger';
import { registerTools } from './tools';

/** Public origin of the app (nginx serves the frontend and /mcp on the same origin). */
const publicOrigin = () => (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');

/**
 * The Clerk Frontend API host, which is the OAuth authorization server. It is encoded in the
 * publishable key (base64 of "<host>$").
 */
function clerkIssuer(): string | null {
  const key = process.env.CLERK_PUBLISHABLE_KEY;
  if (!key) return null;
  const host = Buffer.from(key.split('_').slice(2).join('_'), 'base64').toString('utf8').replace(/\$$/, '');
  return host ? `https://${host}` : null;
}

async function authenticate(req: Request): Promise<AuthUser | null> {
  if (process.env.MOCK_MODE === 'true') {
    // Mock Mode has no Clerk: every request is the seeded mock user.
    const mockUser = await User.findOne({ email: 'mockuser@example.com' });
    return mockUser && { id: String(mockUser._id), email: mockUser.email };
  }
  return getUserFromOAuthHeader(req.headers.authorization);
}

export function createMcpRouter(): Router {
  const router = express.Router();
  const metadataUrl = `${publicOrigin()}/.well-known/oauth-protected-resource`;

  // RFC 9728: tells MCP clients which authorization server to use.
  const protectedResource = (_req: Request, res: Response) => {
    const issuer = clerkIssuer();
    res.json({
      resource: `${publicOrigin()}/mcp`,
      ...(issuer && { authorization_servers: [issuer] }),
      bearer_methods_supported: ['header'],
    });
  };
  router.get('/.well-known/oauth-protected-resource', protectedResource);
  router.get('/.well-known/oauth-protected-resource/mcp', protectedResource);

  const handle = async (req: Request, res: Response) => {
    const user = await authenticate(req);
    if (!user) {
      res
        .status(401)
        .set('WWW-Authenticate', `Bearer resource_metadata="${metadataUrl}"`)
        .json({ jsonrpc: '2.0', error: { code: -32001, message: 'Unauthorized' }, id: null });
      return;
    }

    // Stateless: a fresh server per request, so nothing is shared between users.
    const server = new McpServer({ name: 'journei', version: '1.0.0' });
    registerTools(server, user);
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    res.on('close', () => {
      void transport.close();
      void server.close();
    });
    try {
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      logger.error({ err: error }, 'MCP request failed');
      if (!res.headersSent) {
        res.status(500).json({ jsonrpc: '2.0', error: { code: -32603, message: 'Internal error' }, id: null });
      }
    }
  };

  router.post('/mcp', handle);
  // Stateless mode has no server-to-client stream or session to delete.
  const notAllowed = (_req: Request, res: Response) => {
    res
      .status(405)
      .json({ jsonrpc: '2.0', error: { code: -32000, message: 'Method not allowed' }, id: null });
  };
  router.get('/mcp', notAllowed);
  router.delete('/mcp', notAllowed);

  return router;
}
