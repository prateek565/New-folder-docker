const redis = require('redis');

const redisClient = redis.createClient({
  // url: 'redis://localhost:6379',
  url: 'redis://redis:6379'
});

const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log('Connected to Redis');
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
  }
};

redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

module.exports = { redisClient, connectRedis };
