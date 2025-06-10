import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import Redis from 'redis';
import { MongoClient } from 'mongodb';
import OpenAI from 'openai';
import Anthropic from 'anthropic';
import WebSocket from 'ws';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import Joi from 'joi';
import winston from 'winston';
import cron from 'node-cron';
import { ethers } from 'ethers';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

// Configuration
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/swarmnode';
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const FUJI_RPC_URL = process.env.FUJI_RPC_URL || 'https://api.avax-test.network/ext/bc/C/rpc';

// Contract addresses (should be updated with real deployed addresses)
const CONTRACT_ADDRESSES = {
  SwarmToken: process.env.SWARM_TOKEN_ADDRESS || '0x742d35Cc6634C0532925a3b8D4e01C3F21460000',
  AgentRegistry: process.env.AGENT_REGISTRY_ADDRESS || '0x742d35Cc6634C0532925a3b8D4e01C3F21460001',
  TaskManager: process.env.TASK_MANAGER_ADDRESS || '0x742d35Cc6634C0532925a3b8D4e01C3F21460002',
  CrossSubnetBridge: process.env.CROSS_SUBNET_BRIDGE_ADDRESS || '0x742d35Cc6634C0532925a3b8D4e01C3F21460003'
};

// Initialize services
const app = express();
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Initialize external services
let mongoClient: MongoClient;
let redisClient: any;
let openai: OpenAI | null = null;
let anthropic: Anthropic | null = null;
let ethersProvider: ethers.JsonRpcProvider;

// Initialize AI services if API keys are provided
if (OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: OPENAI_API_KEY
  });
}

if (ANTHROPIC_API_KEY) {
  anthropic = new Anthropic({
    apiKey: ANTHROPIC_API_KEY
  });
}

// Initialize blockchain provider
ethersProvider = new ethers.JsonRpcProvider(FUJI_RPC_URL);

// Rate limiting
const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyGenerator: (req: any) => req.ip,
  points: 100, // Number of requests
  duration: 60, // Per 60 seconds
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting middleware
app.use(async (req, res, next) => {
  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch {
    res.status(429).json({ error: 'Too Many Requests' });
  }
});

// Authentication middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Validation schemas
const agentSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  capabilities: Joi.array().items(Joi.string()).min(1).required(),
  autonomyLevel: Joi.number().min(0).max(1000).required(),
  stakeAmount: Joi.string().required(),
  description: Joi.string().max(1000),
  aiModel: Joi.string().valid('gpt-4', 'gpt-3.5-turbo', 'claude-3', 'claude-2'),
  maxTasksPerDay: Joi.number().min(1).max(1000).default(10)
});

const taskSchema = Joi.object({
  description: Joi.string().min(1).max(1000).required(),
  reward: Joi.string().required(),
  deadline: Joi.number().min(Date.now()).required(),
  requiredCapabilities: Joi.array().items(Joi.string()),
  maxAttempts: Joi.number().min(1).max(5).default(3),
  priority: Joi.string().valid('low', 'medium', 'high').default('medium')
});

// Database collections
let db: any;
let agentsCollection: any;
let tasksCollection: any;
let usersCollection: any;
let analyticsCollection: any;

// API Routes

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      mongodb: !!mongoClient,
      redis: !!redisClient,
      openai: !!openai,
      anthropic: !!anthropic,
      blockchain: !!ethersProvider
    }
  });
});

// Authentication routes
app.post('/auth/register', async (req, res) => {
  try {
    const { address, signature, message } = req.body;
    
    // Verify signature
    const recoveredAddress = ethers.verifyMessage(message, signature);
    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    // Check if user exists
    const existingUser = await usersCollection.findOne({ address: address.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create user
    const user = {
      id: uuidv4(),
      address: address.toLowerCase(),
      createdAt: new Date(),
      lastLogin: new Date(),
      isActive: true
    };

    await usersCollection.insertOne(user);

    const token = jwt.sign({ userId: user.id, address }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        address: user.address,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { address, signature, message } = req.body;
    
    // Verify signature
    const recoveredAddress = ethers.verifyMessage(message, signature);
    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    // Find user
    const user = await usersCollection.findOne({ address: address.toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update last login
    await usersCollection.updateOne(
      { _id: user._id },
      { $set: { lastLogin: new Date() } }
    );

    const token = jwt.sign({ userId: user.id, address }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        address: user.address,
        lastLogin: new Date()
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Agent management routes
app.get('/agents', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, capability } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    let filter: any = {};
    if (status) filter.status = status;
    if (capability) filter.capabilities = { $in: [capability] };

    const agents = await agentsCollection
      .find(filter)
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 })
      .toArray();

    const total = await agentsCollection.countDocuments(filter);

    res.json({
      success: true,
      data: agents,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    logger.error('Get agents error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/agents/:id', async (req, res) => {
  try {
    const agent = await agentsCollection.findOne({ 
      $or: [
        { id: Number(req.params.id) },
        { _id: req.params.id }
      ]
    });

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    res.json({ success: true, data: agent });
  } catch (error) {
    logger.error('Get agent error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/agents', authenticateToken, async (req, res) => {
  try {
    const { error, value } = agentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Check if agent name is unique
    const existingAgent = await agentsCollection.findOne({ name: value.name });
    if (existingAgent) {
      return res.status(400).json({ error: 'Agent name already exists' });
    }

    const agent = {
      id: Date.now(), // Temporary ID, should be from blockchain
      owner: req.user.address,
      ...value,
      status: 'pending_deployment',
      createdAt: new Date(),
      lastActiveAt: new Date(),
      reputationScore: 100,
      tasksCompleted: 0,
      totalEarnings: '0'
    };

    await agentsCollection.insertOne(agent);

    // TODO: Trigger blockchain deployment
    
    res.json({
      success: true,
      data: agent,
      message: 'Agent deployment initiated'
    });
  } catch (error) {
    logger.error('Create agent error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Task management routes
app.get('/tasks', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, assignedAgent } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    let filter: any = {};
    if (status) filter.status = status;
    if (assignedAgent) filter.assignedAgentId = Number(assignedAgent);

    const tasks = await tasksCollection
      .find(filter)
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 })
      .toArray();

    const total = await tasksCollection.countDocuments(filter);

    res.json({
      success: true,
      data: tasks,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    logger.error('Get tasks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/tasks', authenticateToken, async (req, res) => {
  try {
    const { error, value } = taskSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const task = {
      id: Date.now(), // Temporary ID, should be from blockchain
      creator: req.user.address,
      ...value,
      status: 'pending',
      createdAt: new Date(),
      assignedAgentId: null,
      completedAt: null,
      resultHash: null
    };

    await tasksCollection.insertOne(task);

    res.json({
      success: true,
      data: task,
      message: 'Task created successfully'
    });
  } catch (error) {
    logger.error('Create task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// AI Integration routes
app.post('/ai/analyze', authenticateToken, async (req, res) => {
  try {
    const { prompt, model = 'gpt-3.5-turbo', agentId } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    let result;

    if (model.startsWith('gpt') && openai) {
      const completion = await openai.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI assistant for the SwarmNode protocol, specialized in DeFi and blockchain analysis.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      });

      result = {
        model,
        response: completion.choices[0].message.content,
        usage: completion.usage
      };
    } else if (model.startsWith('claude') && anthropic) {
      const message = await anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      result = {
        model,
        response: message.content[0].type === 'text' ? message.content[0].text : 'No text response',
        usage: message.usage
      };
    } else {
      return res.status(400).json({ error: 'AI service not available or invalid model' });
    }

    // Log the analysis for agent if provided
    if (agentId) {
      await analyticsCollection.insertOne({
        agentId: Number(agentId),
        type: 'ai_analysis',
        model,
        prompt: prompt.substring(0, 100) + '...', // Truncate for privacy
        timestamp: new Date(),
        userId: req.user.userId
      });
    }

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('AI analysis error:', error);
    res.status(500).json({ error: 'AI analysis failed' });
  }
});

// Analytics and monitoring routes
app.get('/analytics/overview', authenticateToken, async (req, res) => {
  try {
    const totalAgents = await agentsCollection.countDocuments();
    const activeAgents = await agentsCollection.countDocuments({ status: 'active' });
    const totalTasks = await tasksCollection.countDocuments();
    const completedTasks = await tasksCollection.countDocuments({ status: 'completed' });

    const recentActivity = await analyticsCollection
      .find({})
      .sort({ timestamp: -1 })
      .limit(10)
      .toArray();

    res.json({
      success: true,
      data: {
        totalAgents,
        activeAgents,
        totalTasks,
        completedTasks,
        successRate: totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(2) : 0,
        recentActivity
      }
    });
  } catch (error) {
    logger.error('Analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// WebSocket server for real-time updates
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  logger.info('New WebSocket connection');

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      
      // Handle different message types
      switch (data.type) {
        case 'subscribe_agent':
          // Subscribe to agent updates
          ws.agentId = data.agentId;
          ws.send(JSON.stringify({
            type: 'subscription_confirmed',
            agentId: data.agentId
          }));
          break;
          
        case 'ping':
          ws.send(JSON.stringify({ type: 'pong' }));
          break;
      }
    } catch (error) {
      logger.error('WebSocket message error:', error);
    }
  });

  ws.on('close', () => {
    logger.info('WebSocket connection closed');
  });
});

// Cron jobs for monitoring and maintenance
cron.schedule('*/5 * * * *', async () => {
  // Update agent statuses every 5 minutes
  try {
    // TODO: Check blockchain for agent status updates
    logger.info('Agent status check completed');
  } catch (error) {
    logger.error('Agent status check error:', error);
  }
});

cron.schedule('0 * * * *', async () => {
  // Cleanup old analytics data every hour
  try {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    await analyticsCollection.deleteMany({ timestamp: { $lt: oneWeekAgo } });
    logger.info('Analytics cleanup completed');
  } catch (error) {
    logger.error('Analytics cleanup error:', error);
  }
});

// Error handling
app.use((error: any, req: any, res: any, next: any) => {
  logger.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Initialize and start server
async function startServer() {
  try {
    // Connect to MongoDB
    mongoClient = new MongoClient(MONGODB_URI);
    await mongoClient.connect();
    db = mongoClient.db();
    agentsCollection = db.collection('agents');
    tasksCollection = db.collection('tasks');
    usersCollection = db.collection('users');
    analyticsCollection = db.collection('analytics');
    
    // Create indexes
    await agentsCollection.createIndex({ name: 1 }, { unique: true });
    await agentsCollection.createIndex({ owner: 1 });
    await tasksCollection.createIndex({ creator: 1 });
    await tasksCollection.createIndex({ assignedAgentId: 1 });
    await usersCollection.createIndex({ address: 1 }, { unique: true });
    
    logger.info('MongoDB connected and indexes created');

    // Connect to Redis
    redisClient = Redis.createClient({ url: REDIS_URL });
    await redisClient.connect();
    logger.info('Redis connected');

    // Start HTTP server
    app.listen(PORT, () => {
      logger.info(`SwarmNode API Server running on port ${PORT}`);
      logger.info(`WebSocket server running on port 8080`);
      logger.info('API Documentation: http://localhost:3000/docs');
    });

  } catch (error) {
    logger.error('Server startup error:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  
  if (mongoClient) {
    await mongoClient.close();
  }
  
  if (redisClient) {
    await redisClient.quit();
  }
  
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  
  if (mongoClient) {
    await mongoClient.close();
  }
  
  if (redisClient) {
    await redisClient.quit();
  }
  
  process.exit(0);
});

startServer();

export default app;
