import React, { useEffect } from "react";
import {
  Notification,
  useNotification,
} from "../../context/NotificationContext";
import { useToast } from "@/hooks/use-toast";

type ExtendedNotification = Notification & {
  id: string;
  isShown?: boolean;
};

const NotificationList: React.FC = () => {
  const { notifications, setNotifications, removeNotification } =
    useNotification(); // Use context
  const { toast } = useToast();

  useEffect(() => {
    notifications.forEach((notification) => {
      const extendedNotification = notification as ExtendedNotification;

      if (extendedNotification.useToast && !extendedNotification.isShown) {
        // Show the toast
        toast({
          title: extendedNotification.title,
          description: extendedNotification.message,
          duration: 5000, // Toast duration
        });

        // Mark the notification as shown
        setNotifications((prevNotifications) =>
          prevNotifications.map((n:any) =>
            n.id === extendedNotification.id ? { ...n, isShown: true } : n,
          ),
        );

        // Remove the notification after the toast duration
        setTimeout(() => {
          removeNotification(extendedNotification.id);
        }, 5000);
      }
    });
  }, [notifications, toast, setNotifications, removeNotification]);

  const showBanner = (notification: Notification, index: number) => {
    return (
      <div key={index}>
        <h4>{notification.title}</h4>
        <p>{notification.message}</p>
      </div>
    );
  };

  return (
    <div>
      {notifications.map((notification, index) =>
        notification.useToast ? null : showBanner(notification, index),
      )}
    </div>
  );
};

export default NotificationList;
