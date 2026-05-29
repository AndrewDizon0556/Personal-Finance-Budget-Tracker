export type NotificationType = 'BUDGET_WARNING' | 'SUBSCRIPTION_REMINDER' | 'GOAL_COMPLETE';
export type NotificationSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

export interface AppNotification {
  type: NotificationType;
  title: string;
  message: string;
  severity: NotificationSeverity;
}
