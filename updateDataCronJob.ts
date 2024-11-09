import cron from 'node-cron';
import fetch from 'node-fetch';

// Schedule a cron job to run every minute
cron.schedule('* * * * *', async () => {
  try {
    const response = await fetch('http://localhost:3000/api/cron');
    if (!response.ok) {
      console.error('Error updating data:', response.statusText);
    } else {
      console.log('Data updated successfully');
    }
  } catch (error) {
    console.error('Error triggering cron update:', error);
  }
});
