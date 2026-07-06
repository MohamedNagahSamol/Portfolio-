import 'dotenv/config';
import mongoose from 'mongoose';
import Skill from './models/Skill.js';
import Project from './models/Project.js';
import Experience from './models/Experience.js';
import Certificate from './models/Certificate.js';
import BlogPost from './models/BlogPost.js';

async function seedContent() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/portfolio');
    console.log('Connected to MongoDB for seeding content...');

    await Skill.deleteMany({});
    await Project.deleteMany({});
    await Experience.deleteMany({});
    await Certificate.deleteMany({});
    await BlogPost.deleteMany({});

    const skills = [
      { name: 'React', category: 'frontend', icon: 'react', order: 1 },
      { name: 'JavaScript', category: 'frontend', icon: 'javascript', order: 2 },
      { name: 'HTML5 & CSS3', category: 'frontend', icon: 'html5', order: 3 },
      { name: 'Tailwind CSS', category: 'frontend', icon: 'tailwind', order: 4 },
      { name: 'Material UI', category: 'frontend', icon: 'materialui', order: 5 },
      { name: 'Node.js', category: 'backend', icon: 'node', order: 6 },
      { name: 'Express', category: 'backend', icon: 'express', order: 7 },
      { name: 'MongoDB & Mongoose', category: 'backend', icon: 'mongodb', order: 8 },
      { name: 'Prisma ORM', category: 'backend', icon: 'prisma', order: 9 },
      { name: 'Socket.io', category: 'backend', icon: 'socketio', order: 10 },
      { name: 'TypeScript', category: 'backend', icon: 'typescript', order: 11 },
      { name: 'Git & GitHub', category: 'tools', icon: 'git', order: 12 },
      { name: 'Stripe', category: 'tools', icon: 'stripe', order: 13 },
    ];
    await Skill.insertMany(skills);
    console.log('✅ Skills seeded');

    const projects = [
      {
        title: { en: 'OBJ Chat — Real-time Messaging App', ar: 'OBJ شات — تطبيق مراسلة فوري' },
        description: { en: 'A full-stack real-time messaging application built with the MERN stack, featuring Socket.io for instant communication and Cloudinary for media sharing.', ar: 'تطبيق مراسلة فوري كامل باستخدام MERN مع Socket.io للتواصل الفوري و Cloudinary لمشاركة الوسائط.' },
        category: 'fullstack',
        stack: ['React', 'Node.js', 'Express', 'MongoDB', 'Socket.io', 'Cloudinary'],
        links: { github: 'https://github.com/MohamedNagahSamol/Chat-App', frontend: 'https://chat-app-mauve-sigma-86.vercel.app' },
        image: '',
        featured: true, order: 1,
      },
      {
        title: { en: 'E-Commerce Fullstack', ar: 'متجر إلكتروني كامل' },
        description: { en: 'A full-stack e-commerce platform with Stripe payment integration, product management, and a responsive React frontend.', ar: 'منصة تجارة إلكترونية كاملة مع تكامل دفع Stripe وإدارة المنتجات وواجهة React متجاوبة.' },
        category: 'fullstack',
        stack: ['React', 'Node.js', 'Express', 'MongoDB', 'Stripe'],
        links: { github: 'https://github.com/MohamedNagahSamol/e-commerce-fullstack', frontend: 'https://e-commerce-fullstack-pi.vercel.app' },
        image: '',
        featured: true, order: 2,
      },
      {
        title: { en: 'Quiz Game', ar: 'لعبة أسئلة' },
        description: { en: 'An interactive quiz game built with vanilla JavaScript, HTML5, and CSS3. Features dynamic questions loaded from JSON and real-time scoring.', ar: 'لعبة أسئلة تفاعلية مبنية باستخدام JavaScript و HTML5 و CSS3. تتميز بأسئلة ديناميكية من JSON وتسجيل نتائج فوري.' },
        category: 'frontend',
        stack: ['JavaScript', 'HTML5', 'CSS3'],
        links: { github: 'https://github.com/MohamedNagahSamol/project-play-Quiz', frontend: 'https://project-play-quiz.vercel.app' },
        image: '',
        featured: false, order: 3,
      },
      {
        title: { en: 'Todo List App', ar: 'تطبيق قائمة المهام' },
        description: { en: 'A task management application built with React and Material UI, featuring task creation, editing, completion tracking, and filtering.', ar: 'تطبيق إدارة مهام مبني باستخدام React و Material UI مع إنشاء المهام وتحريرها وتتبع الإنجاز والتصفية.' },
        category: 'frontend',
        stack: ['React', 'Material UI'],
        links: { github: 'https://github.com/MohamedNagahSamol/frontend-todolist' },
        image: '',
        featured: false, order: 4,
      },
      {
        title: { en: 'Movie List API', ar: 'واجهة قائمة الأفلام' },
        description: { en: 'A backend API for managing a movie list built with Node.js, Express, Prisma ORM, and MySQL. Features full CRUD operations and data validation.', ar: 'واجهة خلفية لإدارة قائمة أفلام باستخدام Node.js و Express و Prisma و MySQL مع عمليات CRUD كاملة.' },
        category: 'backend',
        stack: ['Node.js', 'Express', 'Prisma', 'MySQL', 'TypeScript'],
        links: { github: 'https://github.com/MohamedNagahSamol/backend-webside-movielist' },
        image: '',
        featured: false, order: 5,
      },
      {
        title: { en: 'Authorization API', ar: 'واجهة المصادقة' },
        description: { en: 'A robust authentication and authorization system built with Express and Mongoose, featuring JWT-based access and refresh token rotation.', ar: 'نظام مصادقة وتفويض قوي باستخدام Express و Mongoose مع JWT وتدوير التوكن.' },
        category: 'backend',
        stack: ['Node.js', 'Express', 'MongoDB', 'JWT'],
        links: { github: 'https://github.com/MohamedNagahSamol/authorization' },
        image: '',
        featured: false, order: 6,
      },
    ];
    await Project.insertMany(projects);
    console.log('✅ Projects seeded');

    await Experience.insertMany([]);
    console.log('✅ Experience seeded (empty — add via admin panel)');

    await Certificate.insertMany([]);
    console.log('✅ Certificates seeded (empty — add via admin panel)');

    const blogPosts = [
      {
        title: { en: 'Building a Real-time Chat App with MERN and Socket.io', ar: 'بناء تطبيق محادثة فوري باستخدام MERN و Socket.io' },
        excerpt: { en: 'A step-by-step guide to building a real-time messaging application using React, Node.js, Express, MongoDB, and Socket.io with Cloudinary media support.', ar: 'دليل خطوة بخطوة لبناء تطبيق مراسلة فوري باستخدام React و Node.js و Express و MongoDB و Socket.io مع دعم وسائط Cloudinary.' },
        content: { en: 'In this article, I walk through the architecture and implementation of OBJ Chat, a real-time messaging app built with the MERN stack. Key features include instant messaging via Socket.io, image sharing through Cloudinary, JWT authentication, and a responsive React frontend with Chakra UI.', ar: 'في هذه المقالة، أشرح بنية وتنفيذ OBJ شات، تطبيق مراسلة فوري مبني باستخدام MERN. تشمل الميزات الرئيسية المراسلة الفورية عبر Socket.io ومشاركة الصور عبر Cloudinary والمصادقة باستخدام JWT.' },
        tags: ['MERN', 'Socket.io', 'React', 'Real-time'],
        coverImage: '',
        externalUrl: '',
        publishedAt: new Date('2026-07-01'),
      },
    ];
    await BlogPost.insertMany(blogPosts);
    console.log('✅ Blog post seeded');

    await mongoose.disconnect();
    console.log('🎉 Content seed complete.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Content seed error:', err.message);
    process.exit(1);
  }
}

seedContent();
