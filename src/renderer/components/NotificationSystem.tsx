import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";

// Types from your notification system
interface BaseNotification {
  id: string;
  title: string;
  message: string;
  type?: "info" | "success" | "warning" | "error" | "progress";
  useToast?: boolean;
  duration?: number;
}

interface ProgressNotification extends BaseNotification {
  type: "progress";
  total: number;
  current: number;
  autoClose?: boolean;
}

declare global {
  interface Window {
    electron: {
      on: (channel: string, callback: (data: any) => void) => void;
      removeAllListeners: (channel: string) => void;
    };
  }
}

type Notification = BaseNotification | ProgressNotification;

// Create context for notification management
interface NotificationContextType {
  notifications: Notification[];
  addNotification: (
    notification:
      | Omit<BaseNotification, "id">
      | Omit<ProgressNotification, "id">,
  ) => string;
  updateNotification: (
    id: string,
    updates: Partial<Omit<Notification, "id">>,
  ) => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

// Provider component
export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Setup electron listeners (same as your existing component)
  useEffect(() => {
    if (window.electron) {
      // Listen for new notifications
      window.electron.on("notification", (notification: Notification) => {
        setNotifications((prev) => [...prev, notification]);
      });

      // Listen for notification updates (progress)
      window.electron.on(
        "notification-update",
        (update: { id: string; current: number; message?: string }) => {
          setNotifications((prev) =>
            prev.map((notif) =>
              notif.id === update.id && isProgressNotification(notif)
                ? ({
                    ...notif,
                    current: update.current,
                    message: update.message || notif.message,
                  } as ProgressNotification)
                : notif,
            ),
          );
        },
      );

      // Listen for notification close
      window.electron.on("notification-close", (id: string) => {
        setNotifications((prev) => prev.filter((notif) => notif.id !== id));
      });

      // Listen for clear all notifications
      window.electron.on("clear-notifications", () => {
        setNotifications([]);
      });

      return () => {
        // Cleanup listeners
        window.electron.removeAllListeners("notification");
        window.electron.removeAllListeners("notification-update");
        window.electron.removeAllListeners("notification-close");
        window.electron.removeAllListeners("clear-notifications");
      };
    }
  }, []);

  // Function to generate unique ID
  const generateId = () =>
    `notification-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  // Add a new notification directly from a component
  const addNotification = useCallback(
    (
      notificationData:
        | Omit<BaseNotification, "id">
        | Omit<ProgressNotification, "id">,
    ): string => {
      const id = generateId();
      const newNotification = { ...notificationData, id } as Notification;

      setNotifications((prev) => [...prev, newNotification]);

      // Auto-remove notification after duration (if specified)
      if (newNotification.duration && newNotification.duration > 0) {
        setTimeout(() => {
          setNotifications((prev) => prev.filter((n) => n.id !== id));
        }, newNotification.duration);
      }

      return id;
    },
    [],
  );

  // Update an existing notification (useful for progress updates)
  const updateNotification = useCallback(
    (id: string, updates: Partial<Omit<Notification, "id">>) => {
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === id ? { ...notif, ...updates } : notif,
        ),
      );

      // Handle auto-close for completed progress notifications if configured
      if (
        updates.type === "progress" &&
        "current" in updates &&
        "total" in updates &&
        updates.current! >= updates.total!
      ) {
        const notification = notifications.find((n) => n.id === id);
        if (isProgressNotification(notification) && notification.autoClose) {
          setTimeout(() => {
            setNotifications((prev) => prev.filter((n) => n.id !== id));
          }, 1000); // Wait a second to show 100% before closing
        }
      }
    },
    [notifications],
  );

  // Remove a notification
  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        updateNotification,
        removeNotification,
        clearAllNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// Helper function for type checking
function isProgressNotification(
  notification?: Notification,
): notification is ProgressNotification {
  return (
    !!notification &&
    notification.type === "progress" &&
    "current" in notification &&
    "total" in notification
  );
}

// Custom hook for using notifications in any component
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider",
    );
  }
  return context;
};

// Convenience hooks for different notification types
export const useToast = () => {
  const { addNotification } = useNotifications();

  return {
    success: (title: string, message: string, duration = 5000) =>
      addNotification({
        title,
        message,
        type: "success",
        useToast: true,
        duration,
      }),

    error: (title: string, message: string, duration = 5000) =>
      addNotification({
        title,
        message,
        type: "error",
        useToast: true,
        duration,
      }),

    info: (title: string, message: string, duration = 5000) =>
      addNotification({
        title,
        message,
        type: "info",
        useToast: true,
        duration,
      }),

    warning: (title: string, message: string, duration = 5000) =>
      addNotification({
        title,
        message,
        type: "warning",
        useToast: true,
        duration,
      }),

    progress: (
      title: string,
      message: string,
      options?: { total?: number; current?: number; autoClose?: boolean },
    ) =>
      addNotification({
        title,
        message,
        type: "progress",
        useToast: true,
        total: options?.total || 100,
        current: options?.current || 0,
        autoClose: options?.autoClose || true,
      }),
  };
};
