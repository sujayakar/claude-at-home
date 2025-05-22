import { describe, test, expect } from 'vitest';
import { z } from 'zod';
import { ToolRegistry, Tool } from '../convex/lib/tools';

describe('ToolRegistry', () => {
  const registry = new ToolRegistry();

  const echoTool: Tool<{ message: string }, { echo: string }> = {
    name: 'echo',
    description: 'Echo a message',
    parameters: z.object({ message: z.string() }),
    execute: async (_ctx, args) => ({ echo: args.message }),
  };

  registry.register(echoTool);

  test('executes a registered tool and returns JSON string', async () => {
    const result = await registry.executeTool(
      {} as any,
      'echo',
      JSON.stringify({ message: 'hello' })
    );
    expect(result).toBe(JSON.stringify({ echo: 'hello' }));
  });

  test('throws when executing an unknown tool', async () => {
    await expect(registry.executeTool({} as any, 'missingTool', '{}')).rejects.toThrow();
  });
});