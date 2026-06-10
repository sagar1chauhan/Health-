import cron from 'node-cron';

// Mock example of a cron job
export const initCronJobs = () => {
  // Run every day at 8:00 AM
  cron.schedule('0 8 * * *', async () => {
    console.log('⏰ Running daily health reminder job...');
    // In a real scenario, fetch users and send reminders via email or socket
  });

  // Run every hour to check for upcoming appointments
  cron.schedule('0 * * * *', async () => {
    console.log('⏰ Running hourly appointment check...');
  });
  
  console.log('✅ Cron jobs initialized');
};
