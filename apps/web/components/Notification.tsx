import React from "react";

interface NotificationProps {
  message: string;
}

const Notification: React.FC<NotificationProps> = ({ message }) => {
  return (
    <div className="fixed left-1/2 top-6 -translate-x-1/2 transform rounded-lg bg-green-500 px-6 py-3 text-white shadow-lg">
      {message}
    </div>
  );
};

export default Notification;
