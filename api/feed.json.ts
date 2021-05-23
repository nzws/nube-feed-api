import { VercelRequest, VercelResponse } from '@vercel/node';
import { getFeed } from '../services/feed';

export default async (
  req: VercelRequest,
  res: VercelResponse
): Promise<void> => {
  const feed = await getFeed();

  res.json(JSON.parse(feed.json1()));
};
