import React, { useEffect, useState } from 'react';
import { NotificationItem } from '../types';
import { BackArrowIcon } from './Icons';
import { subscribeToNotifications, sendNotificationInFirestore } from '../services/firebase';

interface NotificationsViewProps {
  notifications: NotificationItem[];
  setActiveTab: (tab: string) => void;
  setActiveReelIndex?: (index: number) => void;
  onDirectMessageUser: (username: string) => void;
  triggerAlertNotification: (msg: string) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  notifications: propsNotifications,
  setActiveTab,
  setActiveReelIndex,
  onDirectMessageUser,
  triggerAlertNotification
}) => {
  const [liveNotifs, setLiveNotifs] = useState<NotificationItem[]>(propsNotifications);

  useEffect(() => {
    setLiveNotifs(propsNotifications);
  }, [propsNotifications]);

  useEffect(() => {
    const unsub = subscribeToNotifications((realtimeList) => {
      if (realtimeList && realtimeList.length > 0) {
        setLiveNotifs(realtimeList);
      }
    });

    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  const handleNotificationClick = (n: NotificationItem) => {
    if (n.targetTab) {
      setActiveTab(n.targetTab);
      if (n.targetTab === 'home' && typeof n.targetId === 'number' && setActiveReelIndex) {
        setActiveReelIndex(0);
      }
      triggerAlertNotification(`Navigating to ${n.targetTab}...`);
    } else if (n.type === 'chat') {
      onDirectMessageUser(n.user);
    } else {
      setActiveTab('home');
    }
  };

  const handleSendTestNotification = async () => {
    const testNotif: NotificationItem = {
      id: 'notif_' + Date.now(),
      user: 'VibeBot',
      desc: 'sent a real-time high priority Spark Alert! ⚡',
      time: 'Just now',
      type: 'vibe',
      targetTab: 'home'
    };
    await sendNotificationInFirestore(testNotif);
    triggerAlertNotification("⚡ Live Real-time Notification pushed to Firestore!");
  };

  return (
    <div className="p-4 space-y-3 fade-in text-left">
      <div className="flex items-center justify-between border-b pb-2 themed-border mb-3">
        <div className="flex items-center space-x-2">
          <button onClick={() => setActiveTab('home')} className="text-slate-300 p-1">
            <BackArrowIcon />
          </button>
          <div>
            <h3 className="text-sm font-black themed-text">Notifications</h3>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {liveNotifs.map(n => (
          <div 
            key={n.id} 
            onClick={() => handleNotificationClick(n)}
            className="p-3 bg-slate-900 border rounded-2xl text-xs flex items-center justify-between cursor-pointer hover:border-orange-500/50 active:scale-98 transition-all themed-card"
          >
            <div className="flex items-center space-x-2.5">
              <span className="text-base">
                {n.type === 'vibe' ? '⚡' : n.type === 'xp' ? '🚀' : n.type === 'chat' ? '✉️' : '🧪'}
              </span>
              <div>
                <p className="themed-text"><span className="font-extrabold text-orange-400">@{n.user}</span> {n.desc}</p>
                <span className="text-[9px] themed-subtext block font-mono mt-0.5">{n.time}</span>
              </div>
            </div>

            <span className="text-[9px] text-sky-400 font-bold">View ➔</span>
          </div>
        ))}
      </div>
    </div>
  );
};
