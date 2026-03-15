import React, { useState, useRef, useEffect } from 'react';
import Layout from '../components/Layout';
import { CheckCircle2, Loader2, Mail, Send, User } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { useLanguage } from '../context/LanguageContext';

const Contact = () => {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const formLoadedAt = useRef<number>(0);

  useEffect(() => {
    formLoadedAt.current = Date.now();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError('');
    setIsSubmitting(true);
    try {
      if (honeypot) {
        setError(t('contactErrorInvalid'));
        setIsSubmitting(false);
        return;
      }
      const res = await apiFetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          subject,
          message,
          form_loaded_at: Math.floor(formLoadedAt.current / 1000),
        })
      });
      const text = await res.text();
      if (res.ok) {
        setSuccess(true);
      } else {
        setError(text || t('contactErrorNetwork'));
      }
    } catch (err) {
      setError(t('contactErrorNetwork'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <Layout showSidebars={false}>
        <div className="max-w-xl mx-auto text-center py-24">
          <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold text-zinc-900 mb-4">{t('contactSuccessTitle')}</h1>
          <p className="text-zinc-500 mb-12">
            {t('contactSuccessMessage')}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-4 bg-zinc-900 text-white rounded-full font-semibold hover:bg-zinc-800 transition-all"
          >
            {t('contactSendAnother')}
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showSidebars={false}>
      <div className="max-w-2xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-zinc-900 mb-4">{t('contactTitle')}</h1>
          <p className="text-xl text-zinc-500">
            {t('contactSubtitle')}
          </p>
        </div>

        <div className="bg-white border border-zinc-100 rounded-3xl p-8 md:p-12 shadow-2xl shadow-zinc-200/50">
          <form onSubmit={handleSubmit} className="relative space-y-8">
            {/* Honeypot: 숨김 입력칸. 사용자는 보이지 않으며, 봇이 채우면 제출 시 무시 */}
            <div
              className="absolute -left-[9999px] w-1 h-1 overflow-hidden opacity-0 pointer-events-none"
              aria-hidden="true"
            >
              <label htmlFor="contact-website">Website</label>
              <input
                id="contact-website"
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              <label className="text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                <User className="w-4 h-4" /> {t('contactName')}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('contactPlaceholderName')}
                className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all"
                required
              />
            </div>

            <div className="space-y-4">
              <label className="text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                <Mail className="w-4 h-4" /> {t('contactEmail')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('contactPlaceholderEmail')}
                className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all"
                required
              />
            </div>

            <div className="space-y-4">
              <label className="text-sm font-bold text-zinc-900 uppercase tracking-wider">{t('contactSubject')}</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={t('contactPlaceholderSubject')}
                className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all"
                required
              />
            </div>

            <div className="space-y-4">
              <label className="text-sm font-bold text-zinc-900 uppercase tracking-wider">{t('contactContent')}</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t('contactPlaceholderContent')}
                rows={6}
                className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all resize-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-8 py-5 bg-zinc-900 text-white rounded-2xl font-bold text-lg hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200 disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Send className="w-5 h-5" /> {t('contactSubmit')}</>}
            </button>

            {error && (
              <p className="text-red-500 text-sm font-medium text-center bg-red-50 py-3 rounded-xl border border-red-100">
                {error}
              </p>
            )}
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Contact;
