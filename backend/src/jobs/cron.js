import cron from 'node-cron';
import Appointment from '../models/Appointment.js';
import User from '../models/User.js';
import { sendNotification } from '../sockets/notification.socket.js';
import { sendEmail } from '../config/email.js';

export const initCronJobs = () => {

  // ──────────────────────────────────────────────────────────────────────
  // Job 1: Appointment Reminders — runs every hour
  // Finds confirmed appointments happening in the next 1 hour and notifies
  // ──────────────────────────────────────────────────────────────────────
  cron.schedule('0 * * * *', async () => {
    console.log('⏰ Running hourly appointment reminder job...');
    try {
      const now = new Date();
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

      // Find appointments starting within the next hour
      const upcomingAppointments = await Appointment.find({
        status: 'confirmed',
        date: {
          $gte: new Date(now.toISOString().split('T')[0]), // Today or later
          $lte: new Date(oneHourLater.toISOString().split('T')[0] + 'T23:59:59.999Z'),
        },
      })
        .populate('patientId', 'name email')
        .populate('doctorId', 'name email');

      let remindersCount = 0;

      for (const appointment of upcomingAppointments) {
        // Parse appointment time and check if it's within the next hour
        const appointmentDate = new Date(appointment.date);
        const [hours, minutes] = appointment.time.split(':').map(Number);
        appointmentDate.setHours(hours, minutes, 0, 0);

        if (appointmentDate > now && appointmentDate <= oneHourLater) {
          const timeStr = appointment.time;
          const dateStr = appointmentDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
          const typeLabel = appointment.type === 'telemedicine' ? '📹 Telemedicine' : '🏥 In-Person';

          // Notify Patient
          if (appointment.patientId?._id) {
            await sendNotification(appointment.patientId._id, {
              type: 'appointment_reminder',
              title: 'Upcoming Appointment Reminder',
              message: `Your ${typeLabel} appointment with Dr. ${appointment.doctorId?.name || 'Doctor'} is in less than 1 hour (${timeStr}, ${dateStr}).`,
              priority: 'high',
              data: { appointmentId: appointment._id },
            });
          }

          // Notify Doctor
          if (appointment.doctorId?._id) {
            await sendNotification(appointment.doctorId._id, {
              type: 'appointment_reminder',
              title: 'Upcoming Patient Appointment',
              message: `Your appointment with ${appointment.patientId?.name || 'Patient'} is in less than 1 hour (${timeStr}, ${dateStr}).`,
              priority: 'high',
              data: { appointmentId: appointment._id },
            });
          }

          // Send email reminders
          try {
            if (appointment.patientId?.email) {
              await sendEmail({
                to: appointment.patientId.email,
                subject: '⏰ HealthHub+ — Appointment Reminder',
                html: `
                  <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #0F172A; color: #E2E8F0; padding: 40px; border-radius: 16px;">
                    <h1 style="color: #3B82F6; text-align: center;">HealthHub+</h1>
                    <p>Hello ${appointment.patientId.name},</p>
                    <p>This is a reminder that your <strong>${typeLabel}</strong> appointment with <strong>Dr. ${appointment.doctorId?.name || 'Doctor'}</strong> is starting soon.</p>
                    <div style="background: #1E293B; padding: 20px; border-radius: 12px; margin: 20px 0; text-align: center;">
                      <p style="font-size: 24px; margin: 0; color: #3B82F6; font-weight: bold;">🕐 ${timeStr} — ${dateStr}</p>
                    </div>
                    ${appointment.meetingLink ? `<p style="text-align: center;"><a href="${appointment.meetingLink}" style="background: linear-gradient(135deg, #3B82F6, #8B5CF6); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">Join Meeting</a></p>` : ''}
                    <p style="color: #94A3B8; font-size: 14px;">Please be on time. If you need to cancel, please do so from your dashboard.</p>
                  </div>
                `,
              });
            }
          } catch (emailErr) {
            console.error('Email reminder failed:', emailErr.message);
          }

          remindersCount++;
        }
      }

      if (remindersCount > 0) {
        console.log(`✅ Sent ${remindersCount} appointment reminder(s)`);
      }
    } catch (error) {
      console.error('❌ Appointment reminder job failed:', error.message);
    }
  });

  // ──────────────────────────────────────────────────────────────────────
  // Job 2: Daily Health Reminder — runs every day at 8:00 AM
  // Sends a health check nudge to patients who haven't logged in for 3+ days
  // ──────────────────────────────────────────────────────────────────────
  cron.schedule('0 8 * * *', async () => {
    console.log('⏰ Running daily health reminder job...');
    try {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

      // Find patients who haven't logged in for 3+ days
      const inactivePatients = await User.find({
        role: 'patient',
        status: 'active',
        $or: [
          { lastLogin: { $lt: threeDaysAgo } },
          { lastLogin: { $exists: false } },
        ],
      }).select('_id name');

      let nudgesCount = 0;

      const healthTips = [
        'Regular health check-ups help detect issues early. Take a quick health risk analysis today!',
        'Staying active is key to good health. Have you tracked your exercise today?',
        'Remember to stay hydrated and maintain a balanced diet. Check your personalized recommendations!',
        'Mental health matters too. Take a moment to check in with yourself and manage stress.',
        'Your health data helps us give better recommendations. Log in and update your profile!',
      ];

      for (const patient of inactivePatients) {
        const tip = healthTips[Math.floor(Math.random() * healthTips.length)];
        await sendNotification(patient._id, {
          type: 'health_reminder',
          title: '💪 Daily Health Reminder',
          message: `Hi ${patient.name}! ${tip}`,
          priority: 'low',
        });
        nudgesCount++;
      }

      if (nudgesCount > 0) {
        console.log(`✅ Sent ${nudgesCount} daily health reminder(s)`);
      }
    } catch (error) {
      console.error('❌ Daily health reminder job failed:', error.message);
    }
  });

  // ──────────────────────────────────────────────────────────────────────
  // Job 3: Auto-cancel stale appointments — runs daily at midnight
  // Marks pending appointments that are past their date as 'no-show'
  // ──────────────────────────────────────────────────────────────────────
  cron.schedule('0 0 * * *', async () => {
    console.log('⏰ Running stale appointment cleanup...');
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(23, 59, 59, 999);

      const result = await Appointment.updateMany(
        {
          date: { $lt: yesterday },
          status: { $in: ['pending', 'confirmed'] },
        },
        { status: 'no-show' }
      );

      if (result.modifiedCount > 0) {
        console.log(`✅ Marked ${result.modifiedCount} stale appointment(s) as no-show`);
      }
    } catch (error) {
      console.error('❌ Stale appointment cleanup failed:', error.message);
    }
  });

  console.log('✅ Cron jobs initialized (appointment reminders, health nudges, stale cleanup)');
};
