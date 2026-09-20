import { CronJob } from 'cron';
import https from 'https';
import http from 'http';

/**
 * Render.com free tier spins down after 15 minutes of inactivity.
 * This cron job runs every 14 minutes to keep the instance active.
 */
export const initCronJob = () => {
  // Only run cron keep-alive in production environment (disabled in local development)
  if (process.env.NODE_ENV !== 'production') {
    console.log(
      'Development mode detected. Keep-alive cron job is disabled for local environment.',
    );
    return;
  }

  const targetUrl =
    process.env.API_URL ||
    process.env.RENDER_EXTERNAL_URL ||
    process.env.CLIENT_URL;

  if (
    !targetUrl ||
    targetUrl.includes('localhost') ||
    targetUrl.includes('127.0.0.1')
  ) {
    console.log(
      'No valid external target URL specified for cron job. Keep-alive cron is paused.',
    );
    return;
  }

  // Cron schedule: every 14 minutes ("*/14 * * * *")
  const job = new CronJob('*/14 * * * *', () => {
    const healthUrl = targetUrl.endsWith('/')
      ? `${targetUrl}api/health`
      : `${targetUrl}/api/health`;

    const client = healthUrl.startsWith('https') ? https : http;

    client
      .get(healthUrl, (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(
            `[Cron] Keep-alive ping sent successfully to ${healthUrl} (${res.statusCode})`,
          );
        } else {
          console.warn(
            `[Cron] Keep-alive ping returned status code: ${res.statusCode}`,
          );
        }
      })
      .on('error', (err) => {
        console.error('[Cron] Error sending keep-alive ping:', err.message);
      });
  });

  job.start();
  console.log(
    `Keep-alive cron job scheduled every 14 minutes targeting: ${targetUrl}`,
  );
};
