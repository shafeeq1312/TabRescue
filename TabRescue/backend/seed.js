import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Session from './models/Session.js';
import BrowserSnapshot from './models/BrowserSnapshot.js';
import connectDB from './config/db.js';

dotenv.config();

const sampleSessions = [
  {
    name: 'MERN Stack Production Architecture',
    description: 'Documentation, reference guides, and repos for building TabRescue.',
    category: 'Development',
    tabs: [
      {
        title: 'React 18 Documentation',
        url: 'https://react.dev',
        favicon: 'https://www.google.com/s2/favicons?domain=react.dev&sz=32',
        position: 0,
      },
      {
        title: 'Tailwind CSS Modern Docs',
        url: 'https://tailwindcss.com/docs',
        favicon: 'https://www.google.com/s2/favicons?domain=tailwindcss.com&sz=32',
        position: 1,
      },
      {
        title: 'MongoDB Mongoose Documentation',
        url: 'https://mongoosejs.com',
        favicon: 'https://www.google.com/s2/favicons?domain=mongoosejs.com&sz=32',
        position: 2,
      },
      {
        title: 'Chrome Extensions Manifest V3 Reference',
        url: 'https://developer.chrome.com/docs/extensions/mv3',
        favicon: 'https://www.google.com/s2/favicons?domain=developer.chrome.com&sz=32',
        position: 3,
      },
      {
        title: 'Vite Next Generation Frontend Tooling',
        url: 'https://vitejs.dev',
        favicon: 'https://www.google.com/s2/favicons?domain=vitejs.dev&sz=32',
        position: 4,
      },
    ],
  },
  {
    name: 'AI Agent & LLM Research Papers',
    description: 'Deep dives on multi-agent collaboration, chain of thought, and reasoning benchmarks.',
    category: 'Research',
    tabs: [
      {
        title: 'arXiv Computer Science / AI',
        url: 'https://arxiv.org/list/cs.AI/recent',
        favicon: 'https://www.google.com/s2/favicons?domain=arxiv.org&sz=32',
        position: 0,
      },
      {
        title: 'Hugging Face Papers & Models',
        url: 'https://huggingface.co/papers',
        favicon: 'https://www.google.com/s2/favicons?domain=huggingface.co&sz=32',
        position: 1,
      },
      {
        title: 'DeepMind Research Publications',
        url: 'https://deepmind.google/research',
        favicon: 'https://www.google.com/s2/favicons?domain=deepmind.google&sz=32',
        position: 2,
      },
    ],
  },
  {
    name: 'Frontend Performance & UI Polish',
    description: 'Design patterns, animation techniques, and web vitals optimization.',
    category: 'Learning',
    tabs: [
      {
        title: 'Web.dev Performance Metrics',
        url: 'https://web.dev/vitals',
        favicon: 'https://www.google.com/s2/favicons?domain=web.dev&sz=32',
        position: 0,
      },
      {
        title: 'Figma Community UI Kits',
        url: 'https://www.figma.com/community',
        favicon: 'https://www.google.com/s2/favicons?domain=figma.com&sz=32',
        position: 1,
      },
      {
        title: 'Lucide & React Icons Gallery',
        url: 'https://react-icons.github.io/react-icons',
        favicon: 'https://www.google.com/s2/favicons?domain=react-icons.github.io&sz=32',
        position: 2,
      },
    ],
  },
  {
    name: 'Weekly Sprint & Product Deliverables',
    description: 'Tasks, sprint board, and cloud monitoring.',
    category: 'Work',
    tabs: [
      {
        title: 'GitHub Issues & Pull Requests',
        url: 'https://github.com',
        favicon: 'https://www.google.com/s2/favicons?domain=github.com&sz=32',
        position: 0,
      },
      {
        title: 'Linear Issue Tracking',
        url: 'https://linear.app',
        favicon: 'https://www.google.com/s2/favicons?domain=linear.app&sz=32',
        position: 1,
      },
      {
        title: 'MongoDB Cloud Atlas Console',
        url: 'https://cloud.mongodb.com',
        favicon: 'https://www.google.com/s2/favicons?domain=mongodb.com&sz=32',
        position: 2,
      },
    ],
  },
];

const seedData = async () => {
  try {
    await connectDB();

    console.log('[TabRescue Seed] Connected to database.');

    // Clear existing sample user if already exists
    const demoEmail = 'demo@tabrescue.dev';
    await User.deleteOne({ email: demoEmail });
    console.log(`[TabRescue Seed] Cleaned previous demo user.`);

    // Create demo user
    const demoUser = await User.create({
      name: 'Alex Developer',
      email: demoEmail,
      password: 'TabRescue@2026',
    });

    console.log(`[TabRescue Seed] Demo user created: ${demoUser.email}`);

    // Remove demo user's previous sessions
    await Session.deleteMany({ userId: demoUser._id });

    // Insert sample sessions
    const sessionsWithUser = sampleSessions.map((s, idx) => ({
      ...s,
      userId: demoUser._id,
      lastRestoredAt: idx === 0 ? new Date(Date.now() - 3600000 * 2) : null,
    }));

    await Session.insertMany(sessionsWithUser);
    console.log(`[TabRescue Seed] Created ${sessionsWithUser.length} sample sessions.`);

    // Create sample browser snapshot
    await BrowserSnapshot.findOneAndUpdate(
      { userId: demoUser._id },
      {
        tabs: [
          {
            title: 'TabRescue Dashboard',
            url: 'http://localhost:5173/dashboard',
            favicon: 'https://www.google.com/s2/favicons?domain=localhost&sz=32',
            position: 0,
          },
          {
            title: 'React Documentation',
            url: 'https://react.dev',
            favicon: 'https://www.google.com/s2/favicons?domain=react.dev&sz=32',
            position: 1,
          },
          {
            title: 'GitHub Repositories',
            url: 'https://github.com',
            favicon: 'https://www.google.com/s2/favicons?domain=github.com&sz=32',
            position: 2,
          },
        ],
        windowCount: 1,
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    );
    console.log('[TabRescue Seed] Created sample Browser Snapshot.');

    console.log(`\n======================================================`);
    console.log(`  TabRescue Database Seeded Successfully!`);
    console.log(`  Demo Email:    demo@tabrescue.dev`);
    console.log(`  Demo Password: TabRescue@2026`);
    console.log(`======================================================\n`);

    process.exit(0);
  } catch (err) {
    console.error('[TabRescue Seed Error]:', err.message);
    process.exit(1);
  }
};

seedData();
