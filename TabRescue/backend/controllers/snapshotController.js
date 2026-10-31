import BrowserSnapshot from '../models/BrowserSnapshot.js';
import Session from '../models/Session.js';
import { sanitizeAndDeduplicateTabs } from '../utils/urlValidator.js';

/**
 * @desc    Save/Upsert current browser snapshot (debounced auto-save)
 * @route   POST /api/snapshot
 * @access  Private
 */
export const saveSnapshot = async (req, res, next) => {
  try {
    const { tabs, windowCount } = req.body;

    if (!tabs || !Array.isArray(tabs)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid tabs payload for snapshot',
      });
    }

    const { validTabs } = sanitizeAndDeduplicateTabs(tabs);

    const snapshot = await BrowserSnapshot.findOneAndUpdate(
      { userId: req.user._id },
      {
        tabs: validTabs,
        windowCount: windowCount || 1,
        updatedAt: new Date(),
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    // Also maintain a live "⚡ Auto-Saved Live Session" in user's sessions list
    let autoSession = null;
    if (validTabs.length > 0) {
      autoSession = await Session.findOneAndUpdate(
        { userId: req.user._id, isAutoSaved: true },
        {
          userId: req.user._id,
          name: '⚡ Auto-Saved Live Session',
          description: 'Live session updated automatically in background as tabs change',
          category: 'Work',
          tabs: validTabs,
          isAutoSaved: true,
          updatedAt: new Date(),
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Browser snapshot and live auto-saved session updated',
      data: snapshot,
      session: autoSession,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's latest browser snapshot
 * @route   GET /api/snapshot
 * @access  Private
 */
export const getSnapshot = async (req, res, next) => {
  try {
    const snapshot = await BrowserSnapshot.findOne({ userId: req.user._id });

    res.status(200).json({
      success: true,
      data: snapshot || null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Clear user's browser snapshot
 * @route   DELETE /api/snapshot
 * @access  Private
 */
export const deleteSnapshot = async (req, res, next) => {
  try {
    await BrowserSnapshot.findOneAndDelete({ userId: req.user._id });

    res.status(200).json({
      success: true,
      message: 'Browser snapshot cleared successfully',
    });
  } catch (error) {
    next(error);
  }
};
