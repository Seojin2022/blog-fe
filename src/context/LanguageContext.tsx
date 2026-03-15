import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';

type Language = 'en' | 'ko';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  settings: Record<string, string>;
  refreshSettings: () => Promise<void>;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    home: 'Home',
    about: 'About',
    blog: 'Blog',
    contact: 'Contact',
    settings: 'Settings',
    latestPosts: 'Latest Posts',
    categories: 'Categories',
    recentPosts: 'Recent Posts',
    readArticle: 'Read Article',
    backToBlog: 'Back to Blog',
    previousPost: 'Previous Post',
    nextPost: 'Next Post',
    downloadCv: 'Download CV',
    technicalSkills: 'Technical Skills',
    getInTouch: 'Get in touch.',
    intro_sub: 'I record what I learned at the boundary between technology and daily life.',
    emailAddress: 'Email Address',
    fullName: 'Full Name',
    message: 'Message',
    sendCode: 'Send Code',
    verifyCode: 'Verify Code',
    sendMessage: 'Send Message',
    adminTitle: 'Admin Dashboard',
    addPost: 'Add New Post',
    editPost: 'Edit Post',
    delete: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    title: 'Title',
    slug: 'Slug',
    content: 'Content',
    category: 'Category',
    thumbnailUrl: 'Thumbnail URL',
    addCategory: 'Add Category',
    viewProjects: 'View Projects',
    aboutMe: 'About Me',
    siteSettings: 'Site Settings',
    uploadImage: 'Upload Image',
    password: 'Password',
    login: 'Login',
    contactTitle: 'Contact',
    contactSubtitle: "Send me a message and I'll get back to you soon.",
    contactName: 'Name',
    contactEmail: 'Email',
    contactSubject: 'Title',
    contactContent: 'Content',
    contactPlaceholderName: 'Your name',
    contactPlaceholderEmail: 'your@email.com',
    contactPlaceholderSubject: 'Subject of your message',
    contactPlaceholderContent: 'Your message content...',
    contactSubmit: 'Submit',
    contactSuccessTitle: 'Message Sent!',
    contactSuccessMessage: "Thank you for reaching out. I'll get back to you as soon as possible.",
    contactSendAnother: 'Send Another Message',
    contactErrorInvalid: 'Invalid submission.',
    contactErrorNetwork: 'Network error. Please try again.',
  },
  ko: {
    home: '홈',
    about: '소개',
    blog: '블로그',
    contact: '문의',
    settings: '설정',
    latestPosts: '최신 포스트',
    categories: '카테고리',
    recentPosts: '최근 포스트',
    readArticle: '기사 읽기',
    backToBlog: '블로그로 돌아가기',
    previousPost: '이전 포스트',
    nextPost: '다음 포스트',
    downloadCv: '이력서 다운로드',
    technicalSkills: '기술 스택',
    getInTouch: '연락하기',
    intro_sub: '기술과 일상의 경계에서 배운 것들을 기록합니다.',
    emailAddress: '이메일 주소',
    fullName: '이름',
    message: '메시지',
    sendCode: '인증번호 전송',
    verifyCode: '인증번호 확인',
    sendMessage: '메시지 보내기',
    adminTitle: '관리자 대시보드',
    addPost: '새 포스트 추가',
    editPost: '포스트 수정',
    delete: '삭제',
    save: '저장',
    cancel: '취소',
    title: '제목',
    slug: '슬러그',
    content: '내용',
    category: '카테고리',
    thumbnailUrl: '썸네일 URL',
    addCategory: '카테고리 추가',
    viewProjects: '프로젝트 보기',
    aboutMe: '자기소개',
    siteSettings: '사이트 설정',
    uploadImage: '이미지 업로드',
    password: '비밀번호',
    login: '로그인',
    contactTitle: '문의',
    contactSubtitle: '메시지를 보내주시면 가능한 한 빨리 답변 드리겠습니다.',
    contactName: '이름',
    contactEmail: '이메일',
    contactSubject: '제목',
    contactContent: '내용',
    contactPlaceholderName: '이름을 입력하세요',
    contactPlaceholderEmail: 'your@email.com',
    contactPlaceholderSubject: '메시지 제목',
    contactPlaceholderContent: '메시지 내용을 입력하세요...',
    contactSubmit: '보내기',
    contactSuccessTitle: '전송 완료!',
    contactSuccessMessage: '연락해 주셔서 감사합니다. 빠르게 답변 드리겠습니다.',
    contactSendAnother: '다른 메시지 보내기',
    contactErrorInvalid: '잘못된 요청입니다.',
    contactErrorNetwork: '네트워크 오류입니다. 다시 시도해 주세요.',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const DEFAULT_PROFILE_IMAGE = 'https://picsum.photos/seed/seojin/200/200';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('lang');
    return (saved as Language) || 'en';
  });
  const [settings, setSettings] = useState<Record<string, string>>({ profile_image: DEFAULT_PROFILE_IMAGE });

  const normalizeSettings = (data: unknown): Record<string, string> => {
    if (!data || typeof data !== 'object') return {};
    if (Array.isArray(data)) {
      return (data as { key?: string; value?: string }[]).reduce<Record<string, string>>((acc, item) => {
        if (item && typeof item.key === 'string') acc[item.key] = String(item.value ?? '');
        return acc;
      }, {});
    }
    const obj = data as Record<string, unknown>;
    return Object.keys(obj).reduce<Record<string, string>>((acc, k) => {
      acc[k] = String(obj[k] ?? '');
      return acc;
    }, {});
  };

  const refreshSettings = async () => {
    try {
      const res = await apiFetch('/api/settings');
      if (!res.ok) return;
      const data = await res.json();
      const next = normalizeSettings(data);
      setSettings({ profile_image: DEFAULT_PROFILE_IMAGE, ...next });
    } catch {
      setSettings(prev => ({ profile_image: DEFAULT_PROFILE_IMAGE, ...prev }));
    }
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  useEffect(() => {
    localStorage.setItem('lang', language);
  }, [language]);

  const t = (key: string) => {
    const settingsKey = `${key}_${language}`;
    const fromSettings = settings[settingsKey] ?? settings[key];
    if (fromSettings != null && typeof fromSettings === 'string') return fromSettings;
    return translations[language][key] ?? key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, settings, refreshSettings }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};
