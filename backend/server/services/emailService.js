import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class EmailService {
  constructor() {
    this.transporter = null;
    this.isConfigured = false;
    this.setupTransporter();
  }

  setupTransporter() {
    try {
      const emailConfig = {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      };

      // Validate email configuration
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('⚠️ Email configuration incomplete. Set EMAIL_USER and EMAIL_PASS in .env');
        return;
      }

      this.transporter = nodemailer.createTransporter(emailConfig);
      this.isConfigured = true;
      console.log('✅ Email service configured successfully');
    } catch (error) {
      console.error('❌ Email service configuration error:', error);
      this.isConfigured = false;
    }
  }

  // Verify email configuration
  async verifyConnection() {
    if (!this.isConfigured) {
      return { success: false, error: 'Email service not configured' };
    }

    try {
      await this.transporter.verify();
      return { success: true };
    } catch (error) {
      console.error('Email verification failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Send welcome email
  async sendWelcomeEmail(user) {
    if (!this.isConfigured) {
      console.warn('Email service not configured, skipping welcome email');
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'Influencore'}" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'Welcome to Influencore! 🎉',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 28px;">🎯 Welcome to Influencore!</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Your AI-powered content creation journey starts now</p>
            </div>
            
            <div style="padding: 30px; background: #f9f9f9;">
              <h2 style="color: #333; margin-top: 0;">Hi ${user.firstName || 'there'}!</h2>
              
              <p style="color: #666; line-height: 1.6;">
                Welcome to Influencore! You're now part of a community of creators who are revolutionizing 
                content creation with AI-powered tools.
              </p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #333; margin-top: 0;">🚀 What you can do now:</h3>
                <ul style="color: #666; line-height: 1.8;">
                  <li>Generate viral social media content</li>
                  <li>Create AI-powered videos</li>
                  <li>Connect your social media accounts</li>
                  <li>Access your content library</li>
                  <li>Track your content performance</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" 
                   style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  🎬 Start Creating
                </a>
              </div>
              
              <p style="color: #666; font-size: 14px;">
                You're currently on the <strong>Free plan</strong> with 2 free generations. 
                Upgrade anytime to unlock unlimited content creation!
              </p>
            </div>
            
            <div style="background: #333; padding: 20px; text-align: center; color: white;">
              <p style="margin: 0; font-size: 14px;">
                © 2024 Influencore. All rights reserved.
              </p>
            </div>
          </div>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Welcome email sent to:', user.email);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('❌ Welcome email error:', error);
      return { success: false, error: error.message };
    }
  }

  // Send password reset email
  async sendPasswordResetEmail(user, resetToken) {
    if (!this.isConfigured) {
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
      
      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'Influencore'}" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'Reset Your Influencore Password',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 28px;">🔐 Password Reset</h1>
            </div>
            
            <div style="padding: 30px; background: #f9f9f9;">
              <h2 style="color: #333; margin-top: 0;">Hi ${user.firstName || 'there'}!</h2>
              
              <p style="color: #666; line-height: 1.6;">
                We received a request to reset your password. Click the button below to create a new password:
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" 
                   style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  🔑 Reset Password
                </a>
              </div>
              
              <p style="color: #666; font-size: 14px;">
                If you didn't request this password reset, you can safely ignore this email.
                This link will expire in 1 hour.
              </p>
            </div>
            
            <div style="background: #333; padding: 20px; text-align: center; color: white;">
              <p style="margin: 0; font-size: 14px;">
                © 2024 Influencore. All rights reserved.
              </p>
            </div>
          </div>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Password reset email sent to:', user.email);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('❌ Password reset email error:', error);
      return { success: false, error: error.message };
    }
  }

  // Send upgrade notification
  async sendUpgradeNotification(user, plan) {
    if (!this.isConfigured) {
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'Influencore'}" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: `🎉 Welcome to ${plan} Plan!`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 28px;">🎉 Upgrade Complete!</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">You're now on the ${plan} plan</p>
            </div>
            
            <div style="padding: 30px; background: #f9f9f9;">
              <h2 style="color: #333; margin-top: 0;">Congratulations ${user.firstName || 'there'}!</h2>
              
              <p style="color: #666; line-height: 1.6;">
                Your account has been successfully upgraded to the <strong>${plan}</strong> plan. 
                You now have access to unlimited content generation and premium features!
              </p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #333; margin-top: 0;">✨ New Features Unlocked:</h3>
                <ul style="color: #666; line-height: 1.8;">
                  <li>Unlimited AI content generation</li>
                  <li>Advanced video creation tools</li>
                  <li>Priority customer support</li>
                  <li>Advanced analytics</li>
                  <li>Custom branding options</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" 
                   style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  🚀 Start Creating
                </a>
              </div>
            </div>
            
            <div style="background: #333; padding: 20px; text-align: center; color: white;">
              <p style="margin: 0; font-size: 14px;">
                © 2024 Influencore. All rights reserved.
              </p>
            </div>
          </div>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Upgrade notification sent to:', user.email);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('❌ Upgrade notification error:', error);
      return { success: false, error: error.message };
    }
  }

  // Send usage limit notification
  async sendUsageLimitNotification(user, usage) {
    if (!this.isConfigured) {
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'Influencore'}" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: '⚠️ Usage Limit Reached',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); padding: 30px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 28px;">⚠️ Usage Limit Reached</h1>
            </div>
            
            <div style="padding: 30px; background: #f9f9f9;">
              <h2 style="color: #333; margin-top: 0;">Hi ${user.firstName || 'there'}!</h2>
              
              <p style="color: #666; line-height: 1.6;">
                You've reached your current plan's usage limit. To continue creating amazing content, 
                consider upgrading to a higher plan.
              </p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #333; margin-top: 0;">📊 Current Usage:</h3>
                <p style="color: #666; margin: 5px 0;">
                  <strong>AI Generations:</strong> ${usage.aiGenerations || 0}
                </p>
                <p style="color: #666; margin: 5px 0;">
                  <strong>Social Posts:</strong> ${usage.socialPosts || 0}
                </p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/pricing" 
                   style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  💎 Upgrade Now
                </a>
              </div>
            </div>
            
            <div style="background: #333; padding: 20px; text-align: center; color: white;">
              <p style="margin: 0; font-size: 14px;">
                © 2024 Influencore. All rights reserved.
              </p>
            </div>
          </div>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Usage limit notification sent to:', user.email);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('❌ Usage limit notification error:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new EmailService(); 