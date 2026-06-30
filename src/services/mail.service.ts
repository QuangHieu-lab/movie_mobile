import nodemailer from 'nodemailer';

const required = (name: string): string => {
    const value = process.env[name];
    if (!value) throw new Error(`Missing ${name} in .env`);
    return value;
};

const transporter = () => nodemailer.createTransport({
    host: required('SMTP_HOST'),
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: { user: required('SMTP_USER'), pass: required('SMTP_PASS') },
});

export const sendRegistrationOtp = async (email: string, code: string): Promise<void> => {
    await transporter().sendMail({
        from: process.env.MAIL_FROM || required('SMTP_USER'),
        to: email,
        subject: 'Mã xác thực CineBook',
        text: `Mã xác thực CineBook của bạn là ${code}. Mã có hiệu lực trong 10 phút. Không chia sẻ mã này với bất kỳ ai.`,
    });
};
