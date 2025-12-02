/**
 * Email Service Interface
 * 
 * Abstract interface for email sending
 * Implementation can be swapped (SendGrid, AWS SES, SMTP, etc.)
 */
export interface IEmailService {
  sendInviteEmail(params: {
    to: string;
    inviterName: string;
    organizationName: string;
    inviteUrl: string;
    role: string;
  }): Promise<void>;

  sendPasswordResetEmail(params: {
    to: string;
    userName: string;
    resetUrl: string;
  }): Promise<void>;

  sendWelcomeEmail(params: {
    to: string;
    userName: string;
    organizationName: string;
  }): Promise<void>;
}

/**
 * Console Email Service (Development)
 * 
 * Logs emails to console instead of sending
 * Useful for local development and testing
 */
export class ConsoleEmailService implements IEmailService {
  async sendInviteEmail(params: {
    to: string;
    inviterName: string;
    organizationName: string;
    inviteUrl: string;
    role: string;
  }): Promise<void> {
    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 INVITE EMAIL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
To: ${params.to}
From: ${params.inviterName}
Organization: ${params.organizationName}
Role: ${params.role}

You've been invited to join ${params.organizationName} as a ${params.role}.

Click here to accept: ${params.inviteUrl}

This invite expires in 7 days.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);
  }

  async sendPasswordResetEmail(params: {
    to: string;
    userName: string;
    resetUrl: string;
  }): Promise<void> {
    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔒 PASSWORD RESET EMAIL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
To: ${params.to}
Name: ${params.userName}

We received a request to reset your password.

Click here to reset: ${params.resetUrl}

This link expires in 24 hours.

If you didn't request this, you can safely ignore this email.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);
  }

  async sendWelcomeEmail(params: {
    to: string;
    userName: string;
    organizationName: string;
  }): Promise<void> {
    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👋 WELCOME EMAIL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
To: ${params.to}
Name: ${params.userName}

Welcome to ${params.organizationName}!

Your account is now active. You can sign in and start collaborating
with your team.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);
  }
}

/**
 * TODO: Production Email Service
 * 
 * Implement with your email provider:
 * - SendGrid
 * - AWS SES
 * - Mailgun
 * - Postmark
 * etc.
 */
export class ProductionEmailService implements IEmailService {
  constructor(private readonly apiKey: string, private readonly fromEmail: string) {}

  async sendInviteEmail(params: {
    to: string;
    inviterName: string;
    organizationName: string;
    inviteUrl: string;
    role: string;
  }): Promise<void> {
    // TODO: Implement with email provider
    throw new Error("Production email service not yet implemented");
  }

  async sendPasswordResetEmail(params: {
    to: string;
    userName: string;
    resetUrl: string;
  }): Promise<void> {
    // TODO: Implement with email provider
    throw new Error("Production email service not yet implemented");
  }

  async sendWelcomeEmail(params: {
    to: string;
    userName: string;
    organizationName: string;
  }): Promise<void> {
    // TODO: Implement with email provider
    throw new Error("Production email service not yet implemented");
  }
}

