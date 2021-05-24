import got from 'got';
import { unfurl } from 'unfurl.js';
import { Feed } from 'feed';
import { Content } from '../types/content';
import { Cache } from './cache';

type MetaData = {
  title: string;
  description: string;
};

const getSiteMetadata = async (): Promise<MetaData> => {
  const cache = new Cache('site', 60 * 60 * 24);

  const cacheData = await cache.get();
  if (cacheData) {
    return JSON.parse(cacheData);
  }

  const result = await unfurl('https://blog.0nu.be/');
  const body = {
    title: result.title,
    description: result.open_graph.description
  };
  await cache.set(JSON.stringify(body));

  return body;
};

const getJson = async (): Promise<Content[]> => {
  const cache = new Cache('content-json', 60 * 5);

  const cacheData = await cache.get();
  if (cacheData) {
    return JSON.parse(cacheData);
  }

  const { body } = await got<Content[]>('https://blog.0nu.be/content.json', {
    responseType: 'json'
  });
  body.unshift({
    title: 'test',
    description: 'test',
    date: new Date().toISOString(),
    category: []
  });
  await cache.set(JSON.stringify(body));

  return body;
};

const getDate = (date: string, required?: boolean): Date | undefined => {
  // 何処かの誰かさんが謎dateを返してくる時があるのでinvalidであれば弾く
  const d = new Date(date);

  return isNaN(d.getTime()) ? (required ? new Date(0) : undefined) : d;
};

export const getFeed = async (): Promise<Feed> => {
  const author = {
    name: 'おぬ的な何か',
    link: 'https://0nu.be/'
  };

  const [meta, json] = await Promise.all([getSiteMetadata(), getJson()]);

  const feed = new Feed({
    title: meta.title,
    description: meta.description,
    id: 'https://blog.0nu.be/',
    link: 'https://blog.0nu.be/',
    language: 'ja',
    copyright:
      '本サイトに掲載された情報・データの無断転載及び商用利用はクレジットの記載を条件に全て許可しているよ。',
    updated: getDate(json[0].date),
    feedLinks: {
      json: 'https://nube-feed-api.vercel.app/api/feed.json',
      atom: 'https://nube-feed-api.vercel.app/api/feed.atom'
    },
    author
  });

  const fixed = json.map((post, index) => {
    const id = (json.length - index - 1).toString().padStart(4, '0');
    const url = `https://blog.0nu.be/content/${id}.html`;

    return {
      title: post.title,
      id: url,
      link: url,
      description: post.description,
      author: [author],
      date: getDate(post.date, true)
    };
  });

  fixed.forEach(post => feed.addItem(post));

  return feed;
};
