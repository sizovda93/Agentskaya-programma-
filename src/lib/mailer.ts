import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.yandex.ru",
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendResetCode(to: string, code: string): Promise<boolean> {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error("SMTP not configured");
      return false;
    }

    await transporter.sendMail({
      from: `"Агентум Про" <${process.env.SMTP_USER}>`,
      to,
      subject: "Код для сброса пароля",
      html: `
        <div style="font-family: Inter, Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 32px; background: #111; color: #fafafa; border-radius: 12px;">
          <h2 style="margin: 0 0 16px; font-size: 18px; text-align: center;">Агентум Про</h2>
          <p style="margin: 0 0 24px; color: #a1a1aa; text-align: center; font-size: 14px;">Восстановление пароля</p>
          <div style="background: #1c1c1e; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <p style="margin: 0 0 8px; color: #a1a1aa; font-size: 12px;">Ваш код:</p>
            <p style="margin: 0; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #3b82f6;">${code}</p>
          </div>
          <p style="margin: 0; color: #71717a; font-size: 12px; text-align: center;">Код действителен 15 минут.<br>Если вы не запрашивали сброс — проигнорируйте это письмо.</p>
        </div>
      `,
    });

    return true;
  } catch (err) {
    console.error("sendResetCode error:", err);
    return false;
  }
}
