import config from '../config/config';

import nodemailer from 'nodemailer';

export default class EmailService {
	constructor() {
		this.transporter = nodemailer.createTransport({
			service: 'gmail',
			host: 'smtp.gmail.com',
			port: 456,
			secure: false,
			auth: {
				user: config.nodemailer.auth.user,
				pass: config.nodemailer.auth.pass,
			},
			tls: { rejectUnauthorized: false },
		});
	}

	async send(sendEmailOptions) {
		await this.transporter.sendMail({
			to: sendEmailOptions.to,
			from: config.email.from,
			subject: sendEmailOptions.subject,
			text: sendEmailOptions.text,
			html: sendEmailOptions.html,
		});
	}
}
