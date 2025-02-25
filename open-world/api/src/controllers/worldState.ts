import { Controller, Get, Route } from 'tsoa';
import { requirePool, getWorldStats } from '@game/db';
import type { WorldStats } from '@game/utils';

interface Response {
  stats: WorldStats[];
}

@Route('world_state')
export class WorldStateController extends Controller {
  @Get()
  public async get(): Promise<Response> {
    const pool = requirePool();
    const stats = await getWorldStats.run(undefined, pool);
    return { stats };
  }
}
