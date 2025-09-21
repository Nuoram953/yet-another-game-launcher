import React from "react";
import { X } from "lucide-react";
import { Toast, ToastProvider, ToastViewport } from "@render//components/ui/toast";
import { Progress } from "@render//components/ui/progress";
import { Alert, AlertTitle, AlertDescription } from "@render//components/ui/alert";
import { useNotifications } from "./NotificationSystem";
import Spinner from "./Spinner";

type NotificationType = "success" | "error" | "warning" | "info" | "progress";

interface BaseNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  useToast?: boolean;
}

interface ProgressNotification extends BaseNotification {
  type: "progress";
  current: number;
  total: number;
}

type Notification = BaseNotification | ProgressNotification;

interface NotificationItemProps {
  notification: Notification;
  onClose: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onClose }) => {
  const [progress, setProgress] = React.useState(
    isProgressNotification(notification) ? (notification.current / notification.total) * 100 : 0,
  );

  React.useEffect(() => {
    if (isProgressNotification(notification)) {
      setProgress((notification.current / notification.total) * 100);
    }
  }, [notification]);

  const getAlertVariant = (): "default" | "destructive" | null | undefined => {
    switch (notification.type) {
      case "success":
        return "default";
      case "error":
        return "destructive";
      case "warning":
        return undefined;
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
            <p className="text-design-text-notification-foreground text-sm">{notification.message}</p>
            {isProgressNotification(notification) && (
              <div className="mt-2">
                <Progress value={progress} className="h-2" />
                <p className="text-design-text-notification-foreground mt-1 text-xs">
                  {Math.round(progress)}% Complete
                </p>
              </div>
            )}
          </div>
          <button
            onClick={() => onClose(notification.id)}
            className="text-design-text-notification-foreground hover:text-design-notification-text"
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
          {isProgressNotification(notification) && (
            <div className="mt-3">
              <Progress value={progress} className="h-2" />
              <p className="text-design-text-notification-foreground mt-1 text-xs">{Math.round(progress)}% Complete</p>
            </div>
          )}
        </div>
        <button
          onClick={() => onClose(notification.id)}
          className="text-design-text-notification-foreground hover:text-design-notification-text"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </Alert>
  );
};

function isProgressNotification(notification: Notification): notification is ProgressNotification {
  return notification.type === "progress";
}

const NotificationSystem: React.FC = () => {
  const { notifications, removeNotification } = useNotifications();

  return (
    <ToastProvider>
      <div className="fixed bottom-0 right-0 z-50 flex w-full max-w-md flex-col space-y-4 p-4">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification as Notification}
            onClose={removeNotification}
          />
        ))}
      </div>
      <ToastViewport />
    </ToastProvider>
  );
};

export default NotificationSystem;
