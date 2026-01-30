type LogLevel = 'info' | 'warn' | 'error';

type EmailLogEntry = {
  level: LogLevel;
  message: string;
  to?: string;
  messageId?: string;
  error?: string;
  scheduledAt?: string;
  timestamp: string;
};

const IS_DEV = process.env.NODE_ENV === 'development';
const IS_TEST = process.env.NODE_ENV === 'test';

function formatLog(entry: EmailLogEntry): string {
  const parts = [`[Email] ${entry.message}`];
  if (entry.to) parts.push(`to=${entry.to}`);
  if (entry.messageId) parts.push(`id=${entry.messageId}`);
  if (entry.scheduledAt) parts.push(`scheduled=${entry.scheduledAt}`);
  if (entry.error) parts.push(`error=${entry.error}`);
  return parts.join(' ');
}

export const emailLogger = {
  info(message: string, meta?: Omit<EmailLogEntry, 'level' | 'message' | 'timestamp'>) {
    if (IS_TEST) return;
    const entry: EmailLogEntry = { level: 'info', message, timestamp: new Date().toISOString(), ...meta };
    console.log(formatLog(entry));
  },
  warn(message: string, meta?: Omit<EmailLogEntry, 'level' | 'message' | 'timestamp'>) {
    if (IS_TEST) return;
    const entry: EmailLogEntry = { level: 'warn', message, timestamp: new Date().toISOString(), ...meta };
    console.warn(formatLog(entry));
  },
  error(message: string, meta?: Omit<EmailLogEntry, 'level' | 'message' | 'timestamp'>) {
    const entry: EmailLogEntry = { level: 'error', message, timestamp: new Date().toISOString(), ...meta };
    console.error(formatLog(entry));
  },
  devSkip(action: string, meta?: { to?: string; scheduledAt?: string }) {
    if (IS_TEST) return;
    if (IS_DEV) {
      const entry: EmailLogEntry = { level: 'warn', message: `Resend not configured. Skipping: ${action}`, timestamp: new Date().toISOString(), ...meta };
      console.warn(formatLog(entry));
    }
  },
};
