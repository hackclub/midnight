import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;

  async onModuleInit() {
    const redisConfig = this.getRedisConfig();
    this.client = new Redis(redisConfig);

    this.client.on('error', (err) => {
      console.error('Redis error:', err);
    });

    this.client.on('connect', () => {
      console.log('Connected to Redis');
    });

    // Test Redis connection and commands
    try {
      await this.testRedisCommands();
      await this.getRedisInfo();
    } catch (error) {
      console.error('Redis connection test failed:', error);
    }
  }

  private getRedisConfig() {
    const sentinelHosts = process.env.REDIS_SENTINEL_HOSTS;
    const sentinelName = process.env.REDIS_SENTINEL_NAME;
    const redisHost = process.env.REDIS_HOST || 'localhost';
    const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);
    
    // Auto-detect sentinel mode if connecting to sentinel port or if sentinel env vars are set
    const isSentinelMode = (sentinelHosts && sentinelName) || redisPort === 26379;
    
    if (isSentinelMode) {
      let hosts;
      
      if (sentinelHosts) {
        // Use explicit sentinel hosts
        hosts = sentinelHosts.split(',').map(host => {
          const [hostname, port] = host.trim().split(':');
          return { host: hostname, port: parseInt(port || '26379', 10) };
        });
      } else {
        // Auto-detect: use current host and port as sentinel
        hosts = [{ host: redisHost, port: redisPort }];
      }
      
      const masterName = sentinelName || 'mymaster';
      
      console.log('Using Redis Sentinel mode:', {
        sentinels: hosts,
        name: masterName,
        hasPassword: !!process.env.REDIS_PASSWORD
      });
      
      return {
        sentinels: hosts,
        name: masterName,
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB || '0', 10),
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        connectTimeout: 10000,
        commandTimeout: 5000,
      };
    }
    
    // Standard Redis configuration
    const config = {
      host: redisHost,
      port: redisPort,
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0', 10),
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      connectTimeout: 10000,
      commandTimeout: 5000,
    };

    console.log('Using standard Redis mode:', {
      host: config.host,
      port: config.port,
      db: config.db,
      hasPassword: !!config.password
    });

    return config;
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.client.setex(key, ttlSeconds, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  async acquireLock(key: string, value: string, ttlSeconds: number): Promise<boolean> {
    try {
      const result = await this.client.set(key, value, 'EX', ttlSeconds, 'NX');
      return result === 'OK';
    } catch (error) {
      console.error('Redis acquireLock error:', error);
      // Fallback to using SETNX + EXPIRE
      const setResult = await this.client.setnx(key, value);
      if (setResult === 1) {
        await this.client.expire(key, ttlSeconds);
        return true;
      }
      return false;
    }
  }

  async releaseLock(key: string, value: string): Promise<boolean> {
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;
    const result = await this.client.eval(script, 1, key, value);
    return result === 1;
  }

  async extendLock(key: string, value: string, ttlSeconds: number): Promise<boolean> {
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("expire", KEYS[1], ARGV[2])
      else
        return 0
      end
    `;
    const result = await this.client.eval(script, 1, key, value, ttlSeconds);
    return result === 1;
  }

  async getRedisInfo(): Promise<any> {
    try {
      const info = await this.client.info('server');
      console.log('Redis server info:', info);
      return info;
    } catch (error) {
      console.error('Failed to get Redis info:', error);
      return null;
    }
  }

  async testRedisCommands(): Promise<boolean> {
    try {
      // Test basic commands
      await this.client.ping();
      
      // Test SET command
      await this.client.set('test:basic', 'value');
      const value = await this.client.get('test:basic');
      await this.client.del('test:basic');
      
      if (value !== 'value') {
        throw new Error('Basic SET/GET failed');
      }
      
      // Test SET with EX
      const setExResult = await this.client.setex('test:ex', 10, 'value');
      if (setExResult !== 'OK') {
        throw new Error('SETEX command failed');
      }
      await this.client.del('test:ex');
      
      // Test SETNX
      const setNxResult = await this.client.setnx('test:nx', 'value');
      if (setNxResult !== 1) {
        throw new Error('SETNX command failed');
      }
      await this.client.del('test:nx');
      
      console.log('All Redis commands working correctly');
      return true;
    } catch (error) {
      console.error('Redis command test failed:', error);
      return false;
    }
  }
}
