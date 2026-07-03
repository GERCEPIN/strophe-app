/**
 * Best-effort local reminders.
 *
 * READ BEFORE CHANGING THIS FILE: a PWA on Android cannot guarantee
 * precise-time notifications the way a native app's AlarmManager can.
 * Chrome's Notification Triggers API (`showTrigger`) exists in some
 * versions but its support has been inconsistent over the years, and nothing
 * here should be treated as reliable enough for something time-critical on
 * its own (e.g. sholat times). This module always degrades gracefully —
 * it tries the best mechanism available and silently returns false if it
 * isn't there — and, more importantly, the Dashboard ALSO computes
 * "what's due today" from stored data every time the app is opened, so a
 * missed push notification never means a missed check-in.
 *
 * If reminder timing turns out to matter more than this can deliver, the
 * documented upgrade path (see TECHNICAL_SPEC.md §6) is wrapping this same
 * codebase with Capacitor to get real OS-level scheduling — not rewriting
 * the app.
 *
 * Practical mitigation available today: ask the user to exempt the
 * installed PWA / Chrome from battery optimization in Android system
 * settings, the same fix Anthropic documents for its own Claude Code
 * mobile push notifications.
 */

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied';
  if (Notification.permission !== 'default') return Notification.permission;
  return Notification.requestPermission();
}

export interface SchedulableNotification {
  tag: string;
  title: string;
  body: string;
  timestamp: number; // epoch ms
}

interface TimestampTriggerLike {
  new (timestamp: number): unknown;
}

/** Returns true only if the browser's own scheduling mechanism accepted the request. */
export async function tryScheduleWithTrigger(n: SchedulableNotification): Promise<boolean> {
  if (!('serviceWorker' in navigator)) return false;
  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) return false;

  const TriggerCtor = (window as unknown as { TimestampTrigger?: TimestampTriggerLike })
    .TimestampTrigger;
  if (!TriggerCtor) return false; // feature not available — caller should fall back gracefully

  try {
    await registration.showNotification(n.title, {
      tag: n.tag,
      body: n.body,
      // showTrigger is not yet in the standard lib.dom typings.
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error -- see comment above
      showTrigger: new TriggerCtor(n.timestamp),
    });
    return true;
  } catch {
    return false;
  }
}
