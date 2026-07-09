import UserStats from "../db/models/userStatsSchema.js";
import User from "../db/models/User.js";

// Helper to check if two dates are consecutive days
const isNextDay = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  
  const nextDayOfD1 = new Date(d1);
  nextDayOfD1.setDate(d1.getDate() + 1);
  return nextDayOfD1.toDateString() === d2.toDateString();
};

// Helper to check if two dates are same day
const isSameDay = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return d1.toDateString() === d2.toDateString();
};

export const updateAppStreak = async (userId) => {
  try {
    let stats = await UserStats.findOne({ userId });
    if (!stats) {
      stats = await UserStats.create({ userId });
    }

    const user = await User.findById(userId);
    if (!user) return;

    const lastActive = user.lastActive || new Date(0);
    const now = new Date();

    if (isSameDay(lastActive, now)) {
      // Already active today, no change
      return;
    }

    // Increment total active days (since we passed isSameDay check)
    stats.totalActiveDays = (stats.totalActiveDays || 0) + 1;

    if (isNextDay(lastActive, now)) {
      stats.appStreak += 1;
    } else {
      stats.appStreak = 1; // Reset or start new
    }

    if (stats.appStreak > stats.longestStreak) {
        stats.longestStreak = stats.appStreak;
    }
    
    // Update user's lastActive timestamp so they aren't processed again today
    user.lastActive = now;
    await user.save();
    
    await stats.save();
    return stats;
  } catch (error) {
    console.error("Error updating app streak:", error);
  }
};

export const updateChatStreak = async (userId1, userId2) => {
  try {
    // Ensure order doesn't matter for valid logic, but here we update for BOTH users
    await updateSingleChatStreak(userId1, userId2);
    await updateSingleChatStreak(userId2, userId1);
  } catch (error) {
    console.error("Error updating chat streak:", error);
  }
};

const updateSingleChatStreak = async (ownerId, partnerId) => {
  let stats = await UserStats.findOne({ userId: ownerId });
  if (!stats) {
    stats = await UserStats.create({ userId: ownerId });
  }

  const pid = partnerId.toString();
  const lastInteraction = stats.chatStreakDates.get(pid);
  const currentStreak = stats.chatStreaks.get(pid) || 0;
  
  const now = new Date();

  if (lastInteraction) {
    if (isSameDay(lastInteraction, now)) {
      // Already interacted today, do nothing
      return;
    }
    
    if (isNextDay(lastInteraction, now)) {
      stats.chatStreaks.set(pid, currentStreak + 1);
    } else {
      stats.chatStreaks.set(pid, 1); // Reset
    }
  } else {
    stats.chatStreaks.set(pid, 1); // First interaction
  }

  stats.chatStreakDates.set(pid, now);
  await stats.save();
};
