const nodeMailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs/promises');
const path = require('path');
require('dotenv').config();

class Mailer {
  constructor() {
    this.adminEmail = process.env.EMAIL_SERVICE_USER;
    this.adminPassword = process.env.EMAIL_SERVICE_PASSWORD;
    this.mailHost = 'smtp.gmail.com';
    this.mailPort = 587;
  }

  async sendEmail(to, subject, htmlTemplateName, data) {
    const transporter = nodeMailer.createTransport({
      host: this.mailHost,
      port: this.mailPort,
      secure: false,
      auth: {
        user: this.adminEmail,
        pass: this.adminPassword
      }
    });
    const HTMLTemplate = await this.compileHTMLTemplate(htmlTemplateName, data);

    const options = {
      from: this.adminEmail,
      to: to,
      subject,
      html: HTMLTemplate
    };
    return transporter.sendMail(options);
  }

  async compileHTMLTemplate(fileName, data) {
    const filePath = path.join(__dirname, '../views', fileName);
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const compiledTemplate = handlebars.compile(content);
      return compiledTemplate(data);
    } catch (error) {
      console.error(`Error reading/compiling HTML template ${fileName}:`, error);
      throw error;
    }
  }
}

module.exports = Mailer;
