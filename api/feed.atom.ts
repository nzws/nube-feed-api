import { VercelRequest, VercelResponse } from '@vercel/node';
import { getFeed } from '../services/feed';

export default async (
  req: VercelRequest,
  res: VercelResponse
): Promise<void> => {
  const feed = await getFeed();

  res.setHeader('Content-Type', 'application/atom+xml; charset=utf-8');
  res.send(feed.atom1());
};
