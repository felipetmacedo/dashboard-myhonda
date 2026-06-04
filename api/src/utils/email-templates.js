export default class EmailTemplates {
	static getWelcomeEmailTemplate(name, email, password) {
		return `
			<!DOCTYPE html>
			<html>
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>Bem-vindo ao SIG</title>
				<style>
					body {
						font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
						line-height: 1.6;
						color: #333;
						margin: 0;
						padding: 0;
					}
					.container {
						max-width: 600px;
						margin: 0 auto;
						padding: 20px;
					}
					.header {
						background-color: #FFCC00;
						padding: 20px;
						text-align: center;
						border-top-left-radius: 5px;
						border-top-right-radius: 5px;
					}
					.content {
						padding: 30px;
						background-color: #ffffff;
						border: 1px solid #e0e0e0;
						border-bottom-left-radius: 5px;
						border-bottom-right-radius: 5px;
					}
					.logo {
						font-size: 28px;
						font-weight: bold;
						color: #333;
					}
					.credentials {
						background-color: #f8f8f8;
						padding: 15px;
						margin: 20px 0;
						border-radius: 5px;
						border-left: 4px solid #FFCC00;
					}
					.button {
						display: inline-block;
						background-color: #FFCC00;
						color: #333;
						padding: 12px 25px;
						text-decoration: none;
						border-radius: 4px;
						font-weight: bold;
						margin-top: 15px;
					}
					.footer {
						margin-top: 20px;
						text-align: center;
						color: #888;
						font-size: 12px;
					}
					.highlight {
						color: #FFCC00;
						font-weight: bold;
					}
				</style>
			</head>
			<body>
				<div class="container">
					<div class="header">
						<div class="logo">SIG</div>
					</div>
					<div class="content">
						<h2>Olá, ${name}!</h2>
						<p>Seja bem-vindo ao <span class="highlight">SIG</span>! Estamos muito felizes em ter você conosco.</p>
						
						<p>Suas credenciais de acesso foram criadas com sucesso:</p>
						
						<div class="credentials">
							<p><strong>Email:</strong> ${email}</p>
							<p><strong>Senha:</strong> ${password}</p>
						</div>
						
						<p>Use estas informações para fazer login na plataforma e começar a aproveitar todos os recursos disponíveis.</p>
						
						<a href="https://sig.app" class="button">Acessar SIG</a>
						
						<p>Se tiver qualquer dúvida, nossa equipe está à disposição para ajudar.</p>
						
						<p>Atenciosamente,<br>Equipe SIG</p>
					</div>
					<div class="footer">
						<p>Este é um email automático. Por favor, não responda a esta mensagem.</p>
						<p>&copy; ${new Date().getFullYear()} SIG - Todos os direitos reservados</p>
					</div>
				</div>
			</body>
			</html>
		`;
	}

	static getPasswordResetEmailTemplate(link) {
		return `
			<!DOCTYPE html>
			<html>
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>Redefinição de Senha - SIG</title>
				<style>
					body {
						font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
						line-height: 1.6;
						color: #333;
						margin: 0;
						padding: 0;
					}
					.container {
						max-width: 600px;
						margin: 0 auto;
						padding: 20px;
					}
					.header {
						background-color: #FFCC00;
						padding: 20px;
						text-align: center;
						border-top-left-radius: 5px;
						border-top-right-radius: 5px;
					}
					.content {
						padding: 30px;
						background-color: #ffffff;
						border: 1px solid #e0e0e0;
						border-bottom-left-radius: 5px;
						border-bottom-right-radius: 5px;
					}
					.logo {
						font-size: 28px;
						font-weight: bold;
						color: #333;
					}
					.button {
						display: inline-block;
						background-color: #FFCC00;
						color: #333;
						padding: 12px 25px;
						text-decoration: none;
						border-radius: 4px;
						font-weight: bold;
						margin-top: 15px;
					}
					.footer {
						margin-top: 20px;
						text-align: center;
						color: #888;
						font-size: 12px;
					}
					.highlight {
						color: #FFCC00;
						font-weight: bold;
					}
				</style>
			</head>
			<body>
				<div class="container">
					<div class="header">
						<div class="logo">SIG</div>
					</div>
					<div class="content">
						<h2>Redefinição de Senha</h2>
						<p>Você solicitou a redefinição da sua senha na plataforma <span class="highlight">SIG</span>.</p>
						
						<p>Para continuar o processo de redefinição de senha, clique no botão abaixo:</p>
						
						<a href="${link}" class="button">Redefinir Senha</a>
						
						<p>Se você não solicitou esta redefinição, por favor, ignore este e-mail ou entre em contato com nossa equipe de suporte.</p>
						
						<p>Este link expirará em 24 horas por motivos de segurança.</p>
						
						<p>Atenciosamente,<br>Equipe SIG</p>
					</div>
					<div class="footer">
						<p>Este é um email automático. Por favor, não responda a esta mensagem.</p>
						<p>&copy; ${new Date().getFullYear()} SIG - Todos os direitos reservados</p>
					</div>
				</div>
			</body>
			</html>
		`;
	}
}
