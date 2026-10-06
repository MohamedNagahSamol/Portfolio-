/**
 * Normalizes input name/slug to a standardized icon key.
 */
function normalizeTechKey(name) {
  if (!name) return 'fallback';
  const clean = String(name)
    .toLowerCase()
    .trim()
    .replace(/\.js$/, '')
    .replace(/&/g, '')
    .replace(/[^a-z0-9]/g, '');

  if (clean.includes('react')) return 'react';
  if (clean.includes('typescript') || clean === 'ts') return 'typescript';
  if (clean.includes('javascript') || clean === 'js') return 'javascript';
  if (clean.includes('tailwind')) return 'tailwind';
  if (clean.includes('materialui') || clean.includes('mui')) return 'materialui';
  if (clean.includes('node')) return 'node';
  if (clean.includes('express')) return 'express';
  if (clean.includes('mongo')) return 'mongodb';
  if (clean.includes('prisma')) return 'prisma';
  if (clean.includes('socket')) return 'socketio';
  if (clean.includes('html')) return 'html5';
  if (clean.includes('css')) return 'css3';
  if (clean.includes('git') && !clean.includes('hub')) return 'git';
  if (clean.includes('github')) return 'github';
  if (clean.includes('stripe')) return 'stripe';
  if (clean.includes('docker')) return 'docker';
  if (clean.includes('next')) return 'nextjs';
  if (clean.includes('mysql')) return 'mysql';
  if (clean.includes('cloudin')) return 'cloudinary';
  if (clean.includes('jwt')) return 'jwt';
  if (clean.includes('python')) return 'python';
  if (clean.includes('aws')) return 'aws';
  if (clean.includes('graph')) return 'graphql';
  if (clean.includes('postgre')) return 'postgres';
  if (clean.includes('redux')) return 'redux';

  return 'fallback';
}

export default function TechIcon({ name, className = 'w-5 h-5', style }) {
  const key = normalizeTechKey(name);

  switch (key) {
    case 'react':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} style={style} aria-hidden="true">
          <ellipse cx="12" cy="12" rx="10" ry="4.2" stroke="#61DAFB" strokeWidth="1.2" />
          <ellipse cx="12" cy="12" rx="10" ry="4.2" stroke="#61DAFB" strokeWidth="1.2" transform="rotate(60 12 12)" />
          <ellipse cx="12" cy="12" rx="10" ry="4.2" stroke="#61DAFB" strokeWidth="1.2" transform="rotate(120 12 12)" />
          <circle cx="12" cy="12" r="2" fill="#61DAFB" />
        </svg>
      );

    case 'javascript':
      return (
        <svg viewBox="0 0 24 24" className={className} style={style} aria-hidden="true">
          <rect width="24" height="24" rx="3" fill="#F7DF1E" />
          <path d="M12.5 17.5c.4.7 1.1 1.2 2.2 1.2 1.2 0 2-.6 2-1.9v-6.3h2.3v6.3c0 2.5-1.5 3.7-4.3 3.7-2.3 0-3.6-1.2-4.1-2.5l1.9-.5zm-6 0c.4.7 1 1.2 1.9 1.2 1 0 1.6-.5 1.6-1.2 0-.8-.6-1.2-1.8-1.7l-.6-.3c-1.8-.8-3-1.8-3-3.8 0-1.9 1.5-3.3 3.7-3.3 1.6 0 2.8.6 3.5 1.9l-1.8 1.1c-.4-.7-.9-1-1.7-1-.8 0-1.4.5-1.4 1.1 0 .7.5 1.1 1.6 1.5l.6.3c2.1.9 3.3 1.9 3.3 4 0 2.3-1.8 3.5-4 3.5-2.2 0-3.6-1.1-4.2-2.6l1.8-1.1z" fill="#000000" />
        </svg>
      );

    case 'typescript':
      return (
        <svg viewBox="0 0 24 24" className={className} style={style} aria-hidden="true">
          <rect width="24" height="24" rx="3" fill="#3178C6" />
          <path d="M13.7 17.4c.4.7 1.1 1.2 2.1 1.2 1.1 0 1.7-.5 1.7-1.3 0-.8-.6-1.2-1.7-1.7l-.6-.3c-1.8-.8-2.9-1.8-2.9-3.7 0-1.9 1.5-3.3 3.7-3.3 1.6 0 2.7.6 3.4 1.9l-1.8 1.1c-.4-.7-.8-1-1.6-1-.8 0-1.3.5-1.3 1.1 0 .6.5 1.1 1.5 1.5l.6.3c2.1.9 3.2 1.9 3.2 3.9 0 2.3-1.8 3.5-4 3.5-2.2 0-3.5-1.1-4.1-2.6l1.8-1.1zM5 10h7v2.2H9.7v7.5H7.3v-7.5H5V10z" fill="#FFFFFF" />
        </svg>
      );

    case 'node':
      return (
        <svg viewBox="0 0 24 24" className={className} style={style} aria-hidden="true">
          <path d="M12 2l9 5.2v10.4l-9 5.2-9-5.2V7.2L12 2z" fill="#5FA04E" />
          <path d="M12 4.4L18.6 8v8l-6.6 3.8L5.4 16V8L12 4.4z" fill="#339933" />
          <path d="M10.8 16.5V9.8l4.5 4.7v-4.7" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      );

    case 'express':
      return (
        <svg viewBox="0 0 24 24" className={className} style={style} aria-hidden="true">
          <path d="M12 3a9 9 0 0 0-9 9c0 4.97 4.03 9 9 9s9-4.03 9-9a9 9 0 0 0-9-9zm4.8 12.8h-2.1l-2.7-3.7-2.7 3.7H7.2l3.8-5-3.5-4.6h2.1l2.4 3.4 2.4-3.4h2.1l-3.5 4.6 3.8 5z" fill="currentColor" />
        </svg>
      );

    case 'mongodb':
      return (
        <svg viewBox="0 0 24 24" className={className} style={style} aria-hidden="true">
          <path d="M12 2C12 2 6 7.5 6 13.5c0 3.5 2.5 6.5 6 8.5 3.5-2 6-5 6-8.5C18 7.5 12 2 12 2z" fill="#47A248" />
          <path d="M12 2c0 0 1.5 3 1.5 6.5s-1.5 5.5-1.5 7.5c0-2-1.5-4-1.5-7.5S12 2 12 2z" fill="#13AA52" />
          <path d="M12 22v-6" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" />
        </svg>
      );

    case 'tailwind':
      return (
        <svg viewBox="0 0 24 24" className={className} style={style} aria-hidden="true">
          <path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.335 6.182 14.974 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.335 13.382 8.974 12 6.001 12z" fill="#06B6D4" />
        </svg>
      );

    case 'html5':
      return (
        <svg viewBox="0 0 24 24" className={className} style={style} aria-hidden="true">
          <path d="M3 2l1.6 18.2L12 23l7.4-2.8L21 2H3z" fill="#E34F26" />
          <path d="M12 21.2l5.9-2.2L19.2 4H12v17.2z" fill="#EF652A" />
          <path d="M12 7.7H7.7l.3 3.3H12V7.7zm0 6.6H9.7l.2 2.3 2.1.6V14.3z" fill="#ECECEC" />
          <path d="M12 7.7h4.3l-.4 4.5H12v-1.2h2.9l.2-2.1H12V7.7zm0 6.6h2.2l-.2 2.3-2 .6V14.3z" fill="#FFFFFF" />
        </svg>
      );

    case 'css3':
      return (
        <svg viewBox="0 0 24 24" className={className} style={style} aria-hidden="true">
          <path d="M3 2l1.6 18.2L12 23l7.4-2.8L21 2H3z" fill="#1572B6" />
          <path d="M12 21.2l5.9-2.2L19.2 4H12v17.2z" fill="#33A9DC" />
          <path d="M12 7.7H7.7l.3 3.3H12V7.7zm0 5.5H9.7l.2 2.3 2.1.6V13.2z" fill="#ECECEC" />
          <path d="M12 7.7h4.3l-.4 4.5H12v-1.2h2.9l.2-2.1H12V7.7zm0 5.5h2.2l-.2 2.3-2 .6V13.2z" fill="#FFFFFF" />
        </svg>
      );

    case 'materialui':
      return (
        <svg viewBox="0 0 24 24" className={className} style={style} aria-hidden="true">
          <path d="M12 2L4 6.6v9.2L12 20.4l8-4.6V6.6L12 2zm0 2.3l6 3.5v7l-6 3.4-6-3.4v-7l6-3.5z" fill="#007FFF" />
          <path d="M12 4.3v7.9l6-3.5v-7l-6 2.6z" fill="#0059B2" />
        </svg>
      );

    case 'prisma':
      return (
        <svg viewBox="0 0 24 24" className={className} style={style} aria-hidden="true">
          <path d="M12.6 2.4l8.8 16.5c.3.6.1 1.3-.5 1.7-.2.1-.5.2-.8.2H3.9c-.7 0-1.3-.5-1.4-1.2 0-.3.1-.6.2-.8L11.5 2.4c.3-.6 1-.7 1.6-.4.2.1.4.2.5.4z" fill="#2D3748" />
          <path d="M12.6 2.4L20.6 19c.2.4.1.9-.3 1.1-.1.1-.3.1-.5.1H12V2.3c.2 0 .4.1.6.1z" fill="#5A67D8" />
        </svg>
      );

    case 'socketio':
      return (
        <svg viewBox="0 0 24 24" className={className} style={style} aria-hidden="true">
          <circle cx="12" cy="12" r="10" fill="#010101" />
          <circle cx="12" cy="12" r="8" fill="none" stroke="#25C2A0" strokeWidth="1.5" />
          <path d="M10 6.5l5 5-5 5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      );

    case 'git':
      return (
        <svg viewBox="0 0 24 24" className={className} style={style} aria-hidden="true">
          <path d="M21.6 10.7l-8.3-8.3c-.8-.8-2.1-.8-2.8 0L8.1 4.8l3.6 3.6c.9-.3 1.9-.1 2.5.6.7.7.9 1.7.5 2.5l3.4 3.4c.9-.4 1.9-.2 2.5.5.9.9.9 2.5 0 3.4s-2.5.9-3.4 0c-.7-.7-.9-1.8-.5-2.6l-3.3-3.3v4.6c.3.2.5.5.6.8.5 1.1 0 2.4-1.1 3-1.1.5-2.4 0-3-1.1-.5-1.1 0-2.4 1.1-3 .4-.2.8-.2 1.2-.2V9.8c-.4 0-.8-.1-1.2-.3-1.1-.5-1.6-1.8-1.1-3 .3-.7.9-1.2 1.6-1.4L4.8 8.1c-.8.8-.8 2.1 0 2.8l8.3 8.3c.8.8 2.1.8 2.8 0l5.7-5.7c.8-.8.8-2.1 0-2.8z" fill="#F05032" />
        </svg>
      );

    case 'github':
      return (
        <svg viewBox="0 0 24 24" className={className} style={style} aria-hidden="true">
          <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" fill="currentColor" />
        </svg>
      );

    case 'stripe':
      return (
        <svg viewBox="0 0 24 24" className={className} style={style} aria-hidden="true">
          <rect width="24" height="24" rx="4" fill="#635BFF" />
          <path d="M13.9 10.2c0-.7-.6-1-1.6-1-1.4 0-3.1.5-4.4 1.2V7.1C9.4 6.5 11 6.1 12.5 6.1c3.2 0 5.3 1.6 5.3 4.4 0 4.3-5.9 3.6-5.9 5.5 0 .8.7 1.1 1.8 1.1 1.6 0 3.6-.7 4.9-1.5v3.4c-1.5.7-3.3 1.1-4.9 1.1-3.3 0-5.6-1.6-5.6-4.5 0-4.6 6-3.8 6-5.4z" fill="#FFFFFF" />
        </svg>
      );

    case 'docker':
      return (
        <svg viewBox="0 0 24 24" className={className} style={style} aria-hidden="true">
          <path d="M13 5h2v2h-2V5zm-3 0h2v2h-2V5zm6 0h2v2h-2V5zm-9 3h2v2H7V8zm3 0h2v2h-2V8zm3 0h2v2h-2V8zm3 0h2v2h-2V8zM4 11h2v2H4v-2zm3 0h2v2H7v-2zm3 0h2v2h-2v-2zm3 0h2v2h-2v-2zm3 0h2v2h-2v-2z" fill="#2496ED" />
          <path d="M23.5 13c-.3 0-1.7-.1-2.6.8-.7-.4-1.6-.5-2.5-.2-.5.2-.9.5-1.2.9-1.3-.2-3.8-.4-6.2.9-1.9-1-4.2-1-6.1-.1-.7.4-1.3.9-1.8 1.6H2.1c-.6 0-1.1.5-1.1 1.1 0 3.3 2.7 6 6 6 5.3 0 9.8-3.3 11.2-8 .6.1 1.3.1 1.9-.2.8-.4 1.4-1.1 1.7-1.9.4-.4.7-1 .7-1.6v-.4h-1z" fill="#2496ED" />
        </svg>
      );

    case 'nextjs':
      return (
        <svg viewBox="0 0 24 24" className={className} style={style} aria-hidden="true">
          <circle cx="12" cy="12" r="10" fill="currentColor" />
          <path d="M15.5 8.5v7m-7-7v7l7-7" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      );

    case 'mysql':
      return (
        <svg viewBox="0 0 24 24" className={className} style={style} aria-hidden="true">
          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm1 14.5c-3.6 0-6.5-1.6-6.5-3.5S9.4 9.5 13 9.5s6.5 1.6 6.5 3.5-2.9 3.5-6.5 3.5z" fill="#4479A1" />
          <path d="M7 13c1.5 1.5 4 2 6 2s4.5-.5 6-2" stroke="#FFFFFF" strokeWidth="1.2" fill="none" />
        </svg>
      );

    case 'cloudinary':
      return (
        <svg viewBox="0 0 24 24" className={className} style={style} aria-hidden="true">
          <path d="M19.4 10.3A6.5 6.5 0 0 0 7.8 7.9 5.5 5.5 0 0 0 2 13.5C2 16.5 4.5 19 7.5 19h11.7A4.8 4.8 0 0 0 24 14.2a4.7 4.7 0 0 0-4.6-3.9z" fill="#3448C5" />
          <circle cx="12" cy="13.5" r="2.5" fill="#FFFFFF" />
        </svg>
      );

    case 'jwt':
      return (
        <svg viewBox="0 0 24 24" className={className} style={style} aria-hidden="true">
          <path d="M12 2l8.7 5v10L12 22l-8.7-5V7L12 2z" stroke="#D63AFF" strokeWidth="1.5" fill="none" />
          <circle cx="12" cy="8" r="1.5" fill="#FB015B" />
          <circle cx="8" cy="15" r="1.5" fill="#D63AFF" />
          <circle cx="16" cy="15" r="1.5" fill="#00B9F1" />
        </svg>
      );

    case 'python':
      return (
        <svg viewBox="0 0 24 24" className={className} style={style} aria-hidden="true">
          <path d="M11.9 2c-4 0-3.8 1.7-3.8 1.7v1.8h3.9v.6H6.4S4 5.8 4 9.8s2.1 3.9 2.1 3.9h1.2v-1.7s-.1-2.1 2-2.1h3.3s1.9.1 1.9-1.9V4s.3-2-2.6-2zm-1.1 1.2c.4 0 .7.3.7.7s-.3.7-.7.7-.7-.3-.7-.7.3-.7.7-.7z" fill="#3776AB" />
          <path d="M12.1 22c4 0 3.8-1.7 3.8-1.7v-1.8H12v-.6h5.6s2.4.3 2.4-3.7-2.1-3.9-2.1-3.9h-1.2v1.7s.1 2.1-2 2.1h-3.3s-1.9-.1-1.9 1.9V20s-.3 2 2.6 2zm1.1-1.2c-.4 0-.7-.3-.7-.7s.3-.7.7-.7.7.3.7.7-.3.7-.7.7z" fill="#FFD43B" />
        </svg>
      );

    default:
      // Sleek Cyber Fallback Icon (< / >)
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} style={style} aria-hidden="true">
          <rect width="20" height="20" x="2" y="2" rx="4" stroke="#10B981" strokeWidth="1.2" strokeOpacity="0.4" />
          <path d="M8 9l-3 3 3 3m8-6l3 3-3 3m-4-7l-2 8" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
}
