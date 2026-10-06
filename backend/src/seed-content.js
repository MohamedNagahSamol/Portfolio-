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

    const experiences = [
      {
        title: { en: 'Full-Stack Software Engineer', ar: 'مهندس برمجيات ويب متكامل' },
        organization: { en: 'Independent / Freelance', ar: 'مستقل / عمل حر' },
        startDate: new Date('2023-06-01'),
        endDate: null,
        description: {
          en: 'Architected and deployed high-performance full-stack web applications using React 19, Node.js, Express, MongoDB, and Prisma ORM. Implemented bi-directional real-time event systems with Socket.io and secure Stripe payment processing.',
          ar: 'تطوير وتدشين تطبيقات ويب متكاملة عالية الأداء باستخدام React 19 و Node.js و Express و MongoDB و Prisma ORM مع تكامل أحداث فورية ثنائية الاتجاه عبر Socket.io وبوابات دفع Stripe.'
        },
        order: 1
      },
      {
        title: { en: 'Frontend Software Engineer', ar: 'مهندس واجهات أمامية' },
        organization: { en: 'Web Solutions Lab', ar: 'مختبر حلول الويب' },
        startDate: new Date('2022-09-01'),
        endDate: new Date('2023-05-31'),
        description: {
          en: 'Engineered responsive, accessible user interfaces with React, Tailwind CSS, and TypeScript. Optimized client bundle performance, designed modular UI components, and implemented complete bilingual RTL internationalization.',
          ar: 'بناء واجهات مستخدم متجاوبة وسهلة الوصول باستخدام React و Tailwind CSS و TypeScript مع تحسين حزم العميل وبناء مكونات معيارية ودعم كامل لتخطيط RTL.'
        },
        order: 2
      }
    ];
    await Experience.insertMany(experiences);
    console.log('✅ Experience seeded');

    await Certificate.insertMany([]);
    console.log('✅ Certificates seeded (empty — add via admin panel)');

    const blogPosts = [
      {
        title: {
          en: 'Architecting High-Performance Real-Time Systems with MERN & WebSockets',
          ar: 'هندسة أنظمة الويب اللحظية عالية الأداء باستخدام MERN و WebSockets'
        },
        excerpt: {
          en: 'A practical guide to scaling bidirectional event architectures, optimizing MongoDB change streams, and handling WebSocket reconnection states in production.',
          ar: 'دليل عملي لهندسة وتوسيع المعماريات اللحظية ثنائية الاتجاه، وتحسين تدفقات بيانات MongoDB ومعالجة حالات إعادة الاتصال في بيئات الإنتاج.'
        },
        content: {
          en: 'Building scalable real-time systems requires careful consideration of state synchronization, connection persistence, and resource allocation. In modern MERN applications, combining Socket.io with Express and MongoDB enables seamless bidirectional data flow. Key production considerations include clustering with a Redis adapter, implementing heartbeat pings to detect stale connections, and utilizing MongoDB change streams for reactive updates. By maintaining decoupled event handlers and optimizing payload serialization, web applications can comfortably handle thousands of concurrent WebSocket connections with sub-50ms latency.',
          ar: 'يتطلب بناء الأنظمة اللحظية القابلة للتوسع دراسة دقيقة لتزامن الحالات واستقرار الاتصال وإدارة الموارد. في تطبيقات MERN الحديثة، يتيح دمج Socket.io مع Express و MongoDB تدفقاً سلساً وفورياً للبيانات ثنائية الاتجاه. تشمل أهم معايير بيئة الإنتاج: توزيع الأحمال عبر Redis Adapter، وتطبيق نبضات التحقق (Heartbeat Pings) لاكتشاف الاتصالات المنقطعة، واستخدام MongoDB Change Streams للتحديثات التفاعلية الفورية. ومن خلال فصل معالجات الأحداث وتصغير حجم الحزم المرسلة، يمكن للتطبيق استيعاب آلاف الاتصالات المتزامنة بزمن استجابة أقل من 50 مللي ثانية.'
        },
        tags: ['MERN', 'WebSockets', 'Node.js', 'System Design', 'Real-Time'],
        coverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
        externalUrl: 'https://github.com/MohamedNagahSamol/Chat-App',
        publishedAt: new Date('2026-03-10'),
      },
      {
        title: {
          en: 'Clean Architecture & Scalable API Design in Node.js & MongoDB',
          ar: 'المعمارية النظيفة وتصميم واجهات البرمجة القابلة للتوسع في Node.js و MongoDB'
        },
        excerpt: {
          en: 'How to decouple business logic from framework dependencies using layered patterns, robust schema validation, and secure JWT token rotation.',
          ar: 'كيفية فصل منطق الأعمال عن إطار العمل باستخدام الأنماط الطبقية، والتحقق الصارم من صحة البيانات، وتأمين تدوير رموز JWT.'
        },
        content: {
          en: 'Maintainable backend engineering depends on strict separation of concerns. Adopting the Controller-Service-Repository pattern in Express decouples HTTP routing from core business rules and database queries. Combining Mongoose schemas with express-validator guarantees runtime input sanitization before touching database layers. Furthermore, pairing short-lived access tokens with rotating httpOnly refresh cookies eliminates common XSS and CSRF attack vectors while providing a seamless user authentication experience. Indexing critical MongoDB fields ensures queries remain performant as dataset sizes scale exponentially.',
          ar: 'تعتمد هندسة الباك إند القابلة للصيانة على الفصل الصارم للمسؤوليات (Separation of Concerns). إن تبني نمط Controller-Service-Repository في Express يفصل طبقة التوجيه HTTP عن منطق الأعمال واستعلامات قاعدة البيانات. كما يضمن دمج مخططات Mongoose مع express-validator تنقية المدخلات وفحصها قبل وصولها لقاعدة البيانات. بالإضافة إلى ذلك، فإن اقتران رموز الوصول قصيرة المدى (Access Tokens) مع تدوير رموز التحديث الآمنة (httpOnly Refresh Cookies) يحمي التطبيق من هجمات XSS و CSRF، بينما تضمن الفهرسة الذكية لحقول MongoDB بقاء الاستعلامات فائقة السرعة مع نمو حجم البيانات.'
        },
        tags: ['Node.js', 'MongoDB', 'Clean Architecture', 'API Design', 'Security'],
        coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
        externalUrl: 'https://github.com/MohamedNagahSamol/authorization',
        publishedAt: new Date('2026-03-25'),
      }
    ];
    await BlogPost.insertMany(blogPosts);
    console.log('✅ Blog posts seeded');

    await mongoose.disconnect();
    console.log('🎉 Content seed complete.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Content seed error:', err.message);
    process.exit(1);
  }
}

seedContent();
