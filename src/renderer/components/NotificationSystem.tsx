import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Toast, ToastProvider, ToastViewport } from "@/components/ui/toast";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

// Types from our notification manager
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

type Notification = BaseNotification | ProgressNotification;

declare global {
  interface Window {
    electron: {
      on: (channel: string, callback: (data: any) => void) => void;
      removeAllListeners: (channel: string) => void;
    };
  }
}

interface NotificationItemProps {
  notification: Notification;
  onClose: (id: string) => void;
}

function isProgressNotification(
  notification: Notification,
): notification is ProgressNotification {
  return (
    notification.type === "progress" &&
    "current" in notification &&
    "total" in notification
  );
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onClose,
}) => {
  const [progress, setProgress] = useState(
    isProgressNotification(notification)
      ? (notification.current / notification.total) * 100
      : 0,
  );

  useEffect(() => {
    if (isProgressNotification(notification)) {
      setProgress((notification.current / notification.total) * 100);
    }
    //@ts-ignore
  }, [notification.current, notification.total]);

  const getAlertVariant = (): "default" | "destructive" | null | undefined => {
    switch (notification.type) {
      case "success":
        return "default"; // Adjust as needed based on your Alert component variants
      case "error":
        return "destructive";
      case "warning":
        return undefined; // Assuming 'warning' is not a valid variant, using default
      default:
        return "default";
    }
  };

  if (notification.useToast) {
    return (
      <Toast className="w-full">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="font-semibold">{notification.title}</h3>
            <p className="text-sm text-muted-foreground">
              {notification.message}
            </p>
            {notification.type === "progress" && (
              <div className="mt-2">
                <Progress value={progress} className="h-2" />
                <p className="mt-1 text-xs text-muted-foreground">
                  {Math.round(progress)}% Complete
                </p>
              </div>
            )}
          </div>
          <button
            onClick={() => onClose(notification.id)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </Toast>
    );
  }

  return (
    <Alert variant={getAlertVariant()} className="mb-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <AlertTitle>{notification.title}</AlertTitle>
          <AlertDescription>{notification.message}</AlertDescription>
          {notification.type === "progress" && (
            <div className="mt-3">
              <Progress value={progress} className="h-2" />
              <p className="mt-1 text-xs text-muted-foreground">
                {Math.round(progress)}% Complete
              </p>
            </div>
          )}
        </div>
        <button
          onClick={() => onClose(notification.id)}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </Alert>
  );
};

const NotificationSystem: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
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
            notif.id === update.id &&
            "type" in notif &&
            notif.type === "progress"
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
  }, []);

  const handleClose = (id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  return (
    <ToastProvider>
      <div className="fixed bottom-0 right-0 z-50 flex w-full max-w-md flex-col space-y-4 p-4">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onClose={handleClose}
          />
        ))}
      </div>
      <ToastViewport />
    </ToastProvider>
  );
};

export default NotificationSystem;
