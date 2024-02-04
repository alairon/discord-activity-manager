import { get } from 'https';
import { Activities } from '../types/activities';

interface FuseItem {
  item: Activities.Activity;
}

export class NetFetch {
  // Discord's official source of games it officially detects
  private static readonly dataSource =
    'https://discord.com/api/v8/applications/detectable';
  public data: any;

  public static async fetch(): Promise<Array<FuseItem>> {
    console.log('Collecting Application IDs from Discord...');
    return new Promise((resolve, reject) => {
      get(this.dataSource, (res) => {
        let body = '';

        res.on('data', (ch) => {
          body += ch;
        });

        res.on('end', () => {
          console.log('Finished collecting data');
          try {
            const buffer: Array<string> = JSON.parse(body);
            const data: Array<FuseItem> = this.minimizeData(buffer);
            resolve(data);
          } catch (e) {
            console.log('Failed to obtain data');
            reject(e);
          }
        });
      });
    });
  }

  private static minimizeData(buffer: Array<string>): Array<FuseItem> {
    const data: Array<any> = [];
    buffer.forEach((x: any) => {
      data.push({ name: x.name, applicationId: x.id });
    });
    return data;
  }
}
