import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Toast, ToastProvider, ToastViewport } from '@/components/ui/toast';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

// Types from our notification manager
interface BaseNotification {
  id: string;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error' | 'progress';
  useToast?: boolean;
  duration?: number;
}

interface ProgressNotification extends BaseNotification {
  type: 'progress';
  total: number;
  current: number;
  autoClose?: boolean;
}

type Notification = BaseNotification | ProgressNotification;

const NotificationItem = ({ notification, onClose }) => {
  const [progress, setProgress] = useState(
    notification.type === 'progress' ? (notification.current / notification.total) * 100 : 0
  );

  useEffect(() => {
    if (notification.type === 'progress') {
      setProgress((notification.current / notification.total) * 100);
    }
  }, [notification.current, notification.total]);

  const getAlertVariant = () => {
    switch (notification.type) {
      case 'success': return 'success';
      case 'error': return 'destructive';
      case 'warning': return 'warning';
      default: return 'default';
    }
  };

  if (notification.useToast) {
    return (
      <Toast className="w-full">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1">
            <h3 className="font-semibold">{notification.title}</h3>
            <p className="text-sm text-muted-foreground">{notification.message}</p>
            {notification.type === 'progress' && (
              <div className="mt-2">
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
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
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <AlertTitle>{notification.title}</AlertTitle>
          <AlertDescription>{notification.message}</AlertDescription>
          {notification.type === 'progress' && (
            <div className="mt-3">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
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

const NotificationSystem = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Listen for new notifications
    window.electron.on('notification', (notification: Notification) => {
      setNotifications(prev => [...prev, notification]);
    });

    // Listen for notification updates (progress)
    window.electron.on('notification-update', (update: { id: string; current: number; message?: string }) => {
      setNotifications(prev => prev.map(notif => 
        notif.id === update.id && notif.type === 'progress'
          ? { ...notif, current: update.current, message: update.message || notif.message }
          : notif
      ));
    });

    // Listen for notification close
    window.electron.on('notification-close', (id: string) => {
      setNotifications(prev => prev.filter(notif => notif.id !== id));
    });

    // Listen for clear all notifications
    window.electron.on('clear-notifications', () => {
      setNotifications([]);
    });

    return () => {
      // Cleanup listeners
      window.electron.removeAllListeners('notification');
      window.electron.removeAllListeners('notification-update');
      window.electron.removeAllListeners('notification-close');
      window.electron.removeAllListeners('clear-notifications');
    };
  }, []);

  const handleClose = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  return (
    <ToastProvider>
      <div className="fixed bottom-0 right-0 flex flex-col p-4 space-y-4 w-full max-w-md z-50">
        {notifications.map(notification => (
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
