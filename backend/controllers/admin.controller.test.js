import { afterEach, describe, expect, it, vi } from 'vitest';
import { User } from '../models/User.js';
import { getAdminDashboard } from './admin.controller.js';

const createFindChain = (result) => {
  const chain = {};
  for (const method of ['select', 'sort', 'skip', 'limit', 'lean']) {
    chain[method] = vi.fn(() => chain);
  }
  chain.exec = vi.fn().mockResolvedValue(result);
  return chain;
};

describe('getAdminDashboard', () => {
  afterEach(() => vi.restoreAllMocks());

  it('reaproveita uma Promise real para os totais quando não existe busca', async () => {
    const countExecs = [];
    vi.spyOn(User, 'countDocuments').mockImplementation((filter) => {
      const value = filter.progress ? 2 : 4;
      const exec = vi.fn().mockResolvedValue(value);
      countExecs.push(exec);
      return { exec };
    });
    vi.spyOn(User, 'find').mockReturnValue(createFindChain([]));

    const json = vi.fn();
    const status = vi.fn(() => ({ json }));

    await getAdminDashboard({ query: {} }, { status });

    expect(User.countDocuments).toHaveBeenCalledTimes(2);
    expect(countExecs[0]).toHaveBeenCalledTimes(1);
    expect(countExecs[1]).toHaveBeenCalledTimes(1);
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({
      summary: { totalUsers: 4, usersWithProgress: 2 },
      pagination: expect.objectContaining({ totalItems: 4 }),
    }));
  });
});
