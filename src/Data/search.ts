import Fuse from 'fuse.js';
import { Activities } from '../types/activities';
import { NetFetch } from './netFetch';
import { readFileSync, existsSync, writeFileSync } from 'fs';

interface FuseItem {
  item: Activities.Activity;
}

export class SearchManager {
  private fuse: Fuse<FuseItem>;
  private dataPath: string = __dirname;
  private readonly config = {
    threshold: 0.3,
    ignoreLocation: true,
    keys: ['name', 'applicationId'],
  };

  constructor() {
    this.initData();
  }

  /* Creates a file with Discord verified IDs and saves it locally */
  private async cacheData(titles: Array<FuseItem>): Promise<void> {
    this.writeFile(this.dataPath + '/titles.json', titles);
  }

  /* Merges verified IDs with the ones set by the user*/
  private async initData(): Promise<void> {
    const titles: Array<FuseItem> = existsSync(this.dataPath + '/titles.json')
      ? this.readFile(this.dataPath + '/titles.json')
      : await NetFetch.fetch();
    this.cacheData(titles);

    const customTitles: Array<FuseItem> = existsSync('./custom.json')
      ? this.readFile('./custom.json')
      : [];

    this.updateList(Object.assign(titles, customTitles));
  }

  private readFile(path: string): Array<FuseItem> {
    const data = readFileSync(path, { encoding: 'utf-8' });
    return JSON.parse(data) || [];
  }

  private writeFile(path: string, data: Array<FuseItem>): void {
    console.log('Writing to: ' + path);
    writeFileSync(path, JSON.stringify(data), { encoding: 'utf-8' });
  }

  public updateList(data: Array<FuseItem>): void {
    this.fuse = new Fuse(data, this.config);
  }

  public async searchList(query: string): Promise<Array<FuseItem>> {
    return this.fuse.search(query) || [];
  }
}
