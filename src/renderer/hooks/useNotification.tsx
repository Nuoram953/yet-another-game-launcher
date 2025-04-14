import { useCallback } from "react";

export function useNotification() {
  /**
   * Create and send a notification
   * @param {Object} options - The notification options
   * @param {string} options.title - The notification title
   * @param {string} options.message - The notification message
   * @param {'info' | 'success' | 'warning' | 'error' | 'progress'} [options.type='info'] - The notification type
   * @param {boolean} [options.useToast=true] - Whether to use toast or alert component
   * @param {number} [options.duration=5000] - Auto-close duration in ms (0 for no auto-close)
   * @param {number} [options.total] - Total value for progress notifications
   * @param {number} [options.current] - Current value for progress notifications
   * @param {boolean} [options.autoClose] - Whether progress notifications should auto-close when complete
   * @returns {string} The notification ID
   */
  const sendNotification = useCallback((options) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const notification = {
      id,
      title: options.title,
      message: options.message,
      type: options.type || "info",
      useToast: options.useToast !== undefined ? options.useToast : true,
      duration: options.duration !== undefined ? options.duration : 5000,
      ...(options.type === "progress" && {
        total: options.total || 100,
        current: options.current || 0,
        autoClose: options.autoClose,
      }),
    };

    // Send to the main process through electron
    if (window.electron) {
      window.electron.send("create-notification", notification);
    } else {
      console.warn("Electron is not available, notification would not be sent");
      // For debugging in browser or when electron is not available
      console.log("Notification:", notification);
    }

    return id;
  }, []);

  /**
   * Update a progress notification
   * @param {string} id - The notification ID to update
   * @param {number} current - The current progress value
   * @param {string} [message] - Optional updated message
   */
  const updateProgress = useCallback((id, current, message) => {
    if (window.electron) {
      window.electron.send("update-notification", { id, current, message });
    } else {
      console.warn(
        "Electron is not available, notification update would not be sent",
      );
    }
  }, []);

  /**
   * Close a specific notification
   * @param {string} id - The notification ID to close
   */
  const closeNotification = useCallback((id) => {
    if (window.electron) {
      window.electron.send("close-notification", id);
    } else {
      console.warn(
        "Electron is not available, notification close would not be sent",
      );
    }
  }, []);

  /**
   * Clear all notifications
   */
  const clearAllNotifications = useCallback(() => {
    if (window.electron) {
      window.electron.send("clear-all-notifications");
    } else {
      console.warn(
        "Electron is not available, notifications clear would not be sent",
      );
    }
  }, []);

  return {
    sendNotification,
    updateProgress,
    closeNotification,
    clearAllNotifications,
  };
}
