import { notificationService } from './notificationService';

/**
 * Service for managing scheduled tasks in the system
 */
export const scheduledTasks = {
  /**
   * Initialize all scheduled tasks
   */
  init() {
    // Check for deadline reminders every hour
    this.startDeadlineReminderCheck();
  },

  /**
   * Start the deadline reminder check interval
   */
  startDeadlineReminderCheck() {
    // Check immediately on startup
    this.checkDeadlineReminders();
    
    // Then check every hour
    const ONE_HOUR = 60 * 60 * 1000;
    setInterval(() => this.checkDeadlineReminders(), ONE_HOUR);
  },

  /**
   * Check for approaching deadlines and send notifications
   */
  async checkDeadlineReminders() {
    try {
      const result = await notificationService.checkDeadlineReminders();
      if (result.success) {
        console.log(`Deadline check completed: ${result.count} notifications created`);
      } else {
        console.error('Deadline check failed:', result.error);
      }
    } catch (error) {
      console.error('Error in deadline reminder check:', error);
    }
  }
};
