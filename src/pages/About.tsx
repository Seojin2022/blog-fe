import React from 'react';
import Layout from '../components/Layout';
import { motion } from 'motion/react';
import { Download, Mail, MapPin } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { apiUrl } from '../lib/api';

const About = () => {
  const { t, settings } = useLanguage();
  const skills = [
    { category: "Frontend", items: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"] },
    { category: "Backend", items: ["Node.js", "Express", "SQLite", "PostgreSQL"] },
    { category: "Tools", items: ["Docker", "Git", "AWS", "Vercel", "Figma"] }
  ];

  return (
    <Layout showSidebars={false}>
      <div className="max-w-3xl mx-auto">
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-24"
        >
          <div className="flex flex-col md:flex-row gap-12 items-center mb-12">
            <div className="w-48 h-48 rounded-3xl bg-zinc-100 overflow-hidden shadow-2xl shadow-zinc-200 flex-shrink-0">
              <img 
                src={settings.profile_image ? apiUrl(settings.profile_image) : "https://picsum.photos/seed/avatar/400/400"} 
                alt="Profile" 
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-zinc-900 mb-4">{t('aboutMe')}</h1>
              <p className="text-xl text-zinc-500 leading-relaxed">
                {t('about_text')}
              </p>
              <div className="flex gap-4 mt-6">
                <span className="flex items-center gap-2 text-sm text-zinc-400">
                  <MapPin className="w-4 h-4" /> Seoul, South Korea
                </span>
                <span className="flex items-center gap-2 text-sm text-zinc-400">
                  <Mail className="w-4 h-4" /> {settings.contact_email || "water4072@gmail.com"}
                </span>
              </div>
            </div>
          </div>
        </motion.section>

        <section className="mb-24">
          <h2 className="text-2xl font-bold text-zinc-900 mb-12">{t('technicalSkills')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {skills.map((skill) => (
              <div key={skill.category}>
                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-6">{skill.category}</h3>
                <ul className="space-y-3">
                  {skill.items.map(item => (
                    <li key={item} className="text-zinc-600 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-zinc-200" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-24 p-12 bg-zinc-50 rounded-3xl border border-zinc-100">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div>
              <h2 className="text-2xl font-bold text-zinc-900 mb-2">Looking for my resume?</h2>
              <p className="text-zinc-500">Download the latest version of my CV in PDF format.</p>
            </div>
            <button className="flex items-center gap-2 px-8 py-4 bg-zinc-900 text-white rounded-full font-semibold hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-200">
              <Download className="w-5 h-5" /> {t('downloadCv')}
            </button>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default About;
