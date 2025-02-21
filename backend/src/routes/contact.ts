import express from 'express';
import nodemailer from 'nodemailer';
import rateLimit from 'express-rate-limit';
import axios from 'axios';

const router = express.Router();

// Limiter les requêtes à 5 par heure par IP
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 5,
  message: 'Trop de tentatives de contact, veuillez réessayer plus tard.'
});

// Configuration du transporteur d'email
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', // À remplacer par votre serveur SMTP
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Vérification du token reCAPTCHA
async function verifyRecaptcha(token: string): Promise<boolean> {
  try {
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`
    );
    return response.data.success;
  } catch (error) {
    console.error('Erreur reCAPTCHA:', error);
    return false;
  }
}

router.post('/', limiter, async (req, res) => {
  try {
    const { name, email, message, recaptchaToken } = req.body;

    // Vérifier le token reCAPTCHA
    const isValidRecaptcha = await verifyRecaptcha(recaptchaToken);
    if (!isValidRecaptcha) {
      return res.status(400).json({ error: 'Validation reCAPTCHA échouée' });
    }

    // Envoyer l'email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: 'sylvain.druguet@aptbc.org',
      subject: `Nouveau message de contact de ${name}`,
      text: `
Nom: ${name}
Email: ${email}
Message:
${message}
      `,
      html: `
<h3>Nouveau message de contact</h3>
<p><strong>Nom:</strong> ${name}</p>
<p><strong>Email:</strong> ${email}</p>
<p><strong>Message:</strong></p>
<p>${message.replace(/\n/g, '<br>')}</p>
      `,
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    res.status(500).json({ error: 'Erreur lors de l\'envoi du message' });
  }
});

export default router;
