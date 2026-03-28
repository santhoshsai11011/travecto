const axios = require('axios');
const fetchWithFallback = require('../utils/fetchWithFallback');
const { mockNewsData } = require('../utils/mockData');
const { NEWSAPI_KEY } = require('../config/env');
const Parser = require('rss-parser');

const NEWSAPI_URL = 'https://newsapi.org/v2';
const CACHE_TTL = 1800; // 30 minutes

const parser = new Parser({
  customFields: {
    item: ['media:content', 'media:thumbnail']
  }
});

function formatNewsArticles(articles) {
  return articles
    .filter(a => a.title && a.title !== '[Removed]')
    .map(article => ({
      title: article.title,
      description: article.description || 'No description available',
      url: article.url || article.link,
      source: article.source?.name || article.creator || 'Unknown',
      publishedAt: article.publishedAt || article.pubDate || new Date().toISOString(),
      urlToImage: article.urlToImage || null
    }))
    .slice(0, 5);
}

const getNewsByCity = async (city) => {
  const cacheKey = `news:${city.toLowerCase().trim()}`;

  return fetchWithFallback(
    cacheKey,
    CACHE_TTL,
    async () => {
      // Try NewsAPI first
      try {
        const response = await axios.get(`${NEWSAPI_URL}/everything`, {
          params: {
            q: `${city} news today`,
            apiKey: NEWSAPI_KEY,
            language: 'en',
            sortBy: 'publishedAt',
            pageSize: 10
          }
        });

        if (!response.data?.articles?.length) {
          throw new Error('No articles from NewsAPI');
        }

        const articles = formatNewsArticles(response.data.articles);

        if (articles.length === 0) {
          throw new Error('All articles filtered out');
        }

        return {
          city,
          articles,
          total: articles.length,
          provider: 'newsapi',
          isMock: false
        };

      } catch (newsApiError) {
        console.warn('NewsAPI failed, trying Google RSS:', newsApiError.message);

        // Fallback to Google News RSS using rss-parser
        const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(city + ' India')}&hl=en-IN&gl=IN&ceid=IN:en`;

        const feed = await parser.parseURL(rssUrl);

        if (!feed.items || feed.items.length === 0) {
          throw new Error('RSS feed returned no items');
        }

        const articles = feed.items.slice(0, 5).map(item => ({
          title: item.title || 'No title',
          description: item.contentSnippet || 'Click to read full article.',
          url: item.link || '#',
          source: item.creator || 'Google News',
          publishedAt: item.pubDate
            ? new Date(item.pubDate).toISOString()
            : new Date().toISOString(),
          urlToImage: null
        }));

        return {
          city,
          articles,
          total: articles.length,
          provider: 'google-rss',
          isMock: false
        };
      }
    },
    () => mockNewsData(city)
  );
};

const getNewsByTopic = async (topic) => {
  const cacheKey = `news:topic:${topic.toLowerCase().trim()}`;

  return fetchWithFallback(
    cacheKey,
    CACHE_TTL,
    async () => {
      const response = await axios.get(`${NEWSAPI_URL}/everything`, {
        params: {
          q: topic,
          apiKey: NEWSAPI_KEY,
          language: 'en',
          sortBy: 'publishedAt',
          pageSize: 10
        }
      });

      if (!response.data?.articles?.length) {
        throw new Error('No articles found for topic');
      }

      const articles = formatNewsArticles(response.data.articles);

      return {
        topic,
        articles,
        total: articles.length,
        provider: 'newsapi',
        isMock: false
      };
    },
    () => mockNewsData(topic)
  );
};

module.exports = { getNewsByCity, getNewsByTopic };
