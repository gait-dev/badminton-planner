import { useState } from 'react';
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from 'react-google-recaptcha-v3';

interface FormData {
  name: string;
  email: string;
  message: string;
}

function ContactFormContent() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const { executeRecaptcha } = useGoogleReCaptcha();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!executeRecaptcha) {
      console.error('reCAPTCHA not initialized');
      return;
    }

    try {
      setStatus('loading');
      
      // Obtenir le token reCAPTCHA
      const token = await executeRecaptcha('contact_form');

      // Envoyer les données au backend
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          recaptchaToken: token,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi du message');
      }

      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
      
      // Réinitialiser le statut après 3 secondes
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error) {
      console.error('Erreur:', error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <form className="flex flex-col h-full" onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block mb-2 text-md font-semibold text-aptbc-black">Nom</label>
          <input 
            type="text" 
            id="name" 
            required
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-aptbc-green focus:border-aptbc-green block w-full p-2.5" 
          />
        </div>
        <div>
          <label htmlFor="email" className="block mb-2 text-md font-semibold text-aptbc-black">Email</label>
          <input 
            type="email" 
            id="email" 
            required
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-aptbc-green focus:border-aptbc-green block w-full p-2.5" 
          />
        </div>
      </div>
      <div className="flex-grow py-4">
        <label htmlFor="message" className="block mb-2 text-md font-semibold text-aptbc-black">Message</label>
        <textarea 
          id="message" 
          required
          value={formData.message}
          onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
          className="bg-white border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-aptbc-green focus:border-aptbc-green block w-full h-[calc(100%-3rem)] p-2.5 resize-none" 
        ></textarea>
      </div>
      <button 
        type="submit" 
        disabled={status === 'loading'}
        className={`mt-6 px-4 py-2 rounded-md transition-colors flex justify-center items-center ${
          status === 'loading' 
            ? 'bg-gray-400 cursor-not-allowed' 
            : status === 'success'
            ? 'bg-green-500 text-white'
            : status === 'error'
            ? 'bg-red-500 text-white'
            : 'bg-aptbc-green text-white hover:bg-aptbc-green/90'
        }`}
      >
        {status === 'loading' ? (
          <span>Envoi en cours...</span>
        ) : status === 'success' ? (
          <span>Message envoyé !</span>
        ) : status === 'error' ? (
          <span>Erreur d'envoi</span>
        ) : (
          <span>Envoyer</span>
        )}
      </button>
    </form>
  );
}

export default function ContactForm() {
  return (
    <GoogleReCaptchaProvider reCaptchaKey="6LdpSrQhAAAAABboEH86C8TLNpYngS3_EbfYQ6Kq">
      <ContactFormContent />
    </GoogleReCaptchaProvider>
  );
}
