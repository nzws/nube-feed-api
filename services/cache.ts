import { promises } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

export class Cache {
  private path: string;

  constructor(public id: string, public cacheSec: number) {
    this.path = join(tmpdir(), 'nube-' + id);
  }

  async get(): Promise<string | undefined> {
    try {
      const d = new Date();
      const { mtime } = await promises.stat(this.path);
      const updatedAt = new Date(mtime);

      if (d.getTime() - updatedAt.getTime() < 1000 * this.cacheSec) {
        return await promises.readFile(this.path, { encoding: 'utf-8' });
      }
    } catch (e) {
      //
    }

    return undefined;
  }

  async set(data: string): Promise<void> {
    await promises.writeFile(this.path, data);
  }
}
