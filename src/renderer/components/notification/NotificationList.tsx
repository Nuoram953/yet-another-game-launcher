import React, { useEffect } from "react";
import {
  Notification,
  useNotification,
} from "../../context/NotificationContext";
import { useToast } from "@/hooks/use-toast";

const NotificationList: React.FC = () => {
  const { notifications, setNotifications, removeNotification } =
    useNotification(); // Use context
  const { toast } = useToast();

  useEffect(() => {
    notifications.forEach((notification) => {
      if (notification.useToast && !notification.isShown) {
        // Show the toast
        toast({
          title: notification.title,
          description: notification.message,
          duration: 5000, // Toast duration
          onClose: () => {
            // Remove the notification from the list once the toast closes
            removeNotification(notification.id);
          },
        });

        // Mark the notification as shown
        setNotifications((prevNotifications) =>
          prevNotifications.map((n) =>
            n.id === notification.id ? { ...n, isShown: true } : n,
          ),
        );
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
