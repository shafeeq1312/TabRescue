import mongoose from 'mongoose';
import Session from '../models/Session.js';
import { sanitizeAndDeduplicateTabs } from '../utils/urlValidator.js';

/**
 * @desc    Create a new browser session
 * @route   POST /api/sessions
 * @access  Private
 */
export const createSession = async (req, res, next) => {
  try {
    const { name, description, category, tabs } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid session name',
      });
    }

    if (!tabs || !Array.isArray(tabs) || tabs.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'A session must contain at least one valid browser tab',
      });
    }

    // Sanitize and deduplicate URLs
    const { validTabs, duplicateCount, removedCount } = sanitizeAndDeduplicateTabs(tabs);

    if (validTabs.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No restorable URLs found. Chrome internal pages (chrome://) cannot be saved.',
      });
    }

    const session = await Session.create({
      userId: req.user._id,
      name: name.trim(),
      description: (description || '').trim(),
      category: category || 'Others',
      tabs: validTabs,
    });

    res.status(201).json({
      success: true,
      message: 'Session saved successfully',
      data: session,
      meta: {
        totalTabs: validTabs.length,
        duplicateCount,
        removedCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all sessions for the authenticated user
 * @route   GET /api/sessions
 * @access  Private
 */
export const getSessions = async (req, res, next) => {
  try {
    const { category, sort, q, search } = req.query;
    const searchQuery = q || search;

    // Base filter: only this user's sessions
    const query = { userId: req.user._id };

    // Filter by Category
    if (category && category !== 'All') {
      query.category = category;
    }

    // Search by text across name, description, tab titles and tab URLs
    if (searchQuery && searchQuery.trim()) {
      const regex = new RegExp(searchQuery.trim(), 'i');
      query.$or = [
        { name: regex },
        { description: regex },
        { 'tabs.title': regex },
        { 'tabs.url': regex },
      ];
    }

    // Sort order
    let sortOptions = { isAutoSaved: -1, updatedAt: -1, createdAt: -1 }; // Default: Live auto-saved and recently updated first
    if (sort === 'oldest') {
      sortOptions = { isAutoSaved: -1, createdAt: 1 };
    } else if (sort === 'nameAsc') {
      sortOptions = { isAutoSaved: -1, name: 1 };
    } else if (sort === 'nameDesc') {
      sortOptions = { isAutoSaved: -1, name: -1 };
    } else if (sort === 'lastRestored') {
      sortOptions = { lastRestoredAt: -1, updatedAt: -1 };
    }

    const sessions = await Session.find(query).sort(sortOptions);

    res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Search sessions by name, title, or URL
 * @route   GET /api/sessions/search
 * @access  Private
 */
export const searchSessions = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || !q.trim()) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
      });
    }

    const regex = new RegExp(q.trim(), 'i');
    const sessions = await Session.find({
      userId: req.user._id,
      $or: [
        { name: regex },
        { description: regex },
        { 'tabs.title': regex },
        { 'tabs.url': regex },
      ],
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single session details
 * @route   GET /api/sessions/:id
 * @access  Private
 */
export const getSessionById = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({
        success: false,
        message: 'Invalid session ID format',
      });
    }

    const session = await Session.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found or you do not have permission to view it',
      });
    }

    res.status(200).json({
      success: true,
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update session details (name, description, category, tabs)
 * @route   PUT /api/sessions/:id
 * @access  Private
 */
export const updateSession = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({
        success: false,
        message: 'Invalid session ID format',
      });
    }

    const session = await Session.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found or you do not have permission to edit it',
      });
    }

    const { name, description, category, tabs } = req.body;

    if (name !== undefined) session.name = name.trim();
    if (description !== undefined) session.description = description.trim();
    if (category !== undefined) session.category = category;

    if (tabs !== undefined) {
      if (!Array.isArray(tabs) || tabs.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Session must contain at least one tab',
        });
      }
      const { validTabs } = sanitizeAndDeduplicateTabs(tabs);
      if (validTabs.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No valid URLs provided in tab list',
        });
      }
      session.tabs = validTabs;
    }

    await session.save();

    res.status(200).json({
      success: true,
      message: 'Session updated successfully',
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a session
 * @route   DELETE /api/sessions/:id
 * @access  Private
 */
export const deleteSession = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({
        success: false,
        message: 'Invalid session ID format',
      });
    }

    const session = await Session.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found or you do not have permission to delete it',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Session deleted successfully',
      id: req.params.id,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark session as restored and retrieve tabs
 * @route   POST /api/sessions/:id/restore
 * @access  Private
 */
export const restoreSession = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({
        success: false,
        message: 'Invalid session ID format',
      });
    }

    const session = await Session.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    // Update last restored timestamp
    session.lastRestoredAt = new Date();
    await session.save();

    res.status(200).json({
      success: true,
      message: `Restoring ${session.tabs.length} tabs from session "${session.name}"`,
      data: {
        sessionId: session._id,
        name: session.name,
        tabs: session.tabs,
        lastRestoredAt: session.lastRestoredAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Bulk delete selected sessions
 * @route   POST /api/sessions/bulk-delete
 * @access  Private
 */
export const bulkDeleteSessions = async (req, res, next) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of session IDs to delete',
      });
    }

    const result = await Session.deleteMany({
      _id: { $in: ids },
      userId: req.user._id,
    });

    res.status(200).json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} sessions`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get dashboard metrics & statistics
 * @route   GET /api/sessions/stats/summary
 * @access  Private
 */
export const getStatsSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Aggregate total sessions and total tabs count
    const totalStats = await Session.aggregate([
      { $match: { userId } },
      {
        $project: {
          category: 1,
          tabCount: { $size: '$tabs' },
          lastRestoredAt: 1,
          createdAt: 1,
        },
      },
    ]);

    const totalSessions = totalStats.length;
    const totalTabs = totalStats.reduce((acc, curr) => acc + curr.tabCount, 0);

    // Category distribution
    const categoryMap = {
      Development: 0,
      Learning: 0,
      Research: 0,
      Work: 0,
      Entertainment: 0,
      Personal: 0,
      Others: 0,
    };

    totalStats.forEach((s) => {
      if (categoryMap[s.category] !== undefined) {
        categoryMap[s.category]++;
      } else {
        categoryMap['Others']++;
      }
    });

    const categoryDistribution = Object.keys(categoryMap).map((key) => ({
      name: key,
      count: categoryMap[key],
    }));

    // Find most recently restored session
    const lastRestoredSession = await Session.findOne({
      userId,
      lastRestoredAt: { $ne: null },
    })
      .sort({ lastRestoredAt: -1 })
      .select('name category lastRestoredAt tabs');

    // Recent 5 sessions
    const recentSessions = await Session.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        totalSessions,
        totalTabs,
        categoryDistribution,
        lastRestoredSession: lastRestoredSession
          ? {
              id: lastRestoredSession._id,
              name: lastRestoredSession.name,
              category: lastRestoredSession.category,
              tabCount: lastRestoredSession.tabs.length,
              lastRestoredAt: lastRestoredSession.lastRestoredAt,
            }
          : null,
        recentSessions,
      },
    });
  } catch (error) {
    next(error);
  }
};
