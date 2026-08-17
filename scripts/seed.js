const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Maya Pictures database...');

  // 1. Roles & Permissions
  const sysAdminRole = await prisma.role.upsert({
    where: { name: 'SYSTEM_ADMINISTRATOR' },
    update: {},
    create: {
      name: 'SYSTEM_ADMINISTRATOR',
      description: 'Full system and administrative access.',
    },
  });

  const contentAdminRole = await prisma.role.upsert({
    where: { name: 'CONTENT_ADMINISTRATOR' },
    update: {},
    create: {
      name: 'CONTENT_ADMINISTRATOR',
      description: 'Content management, media, services, and inquiry management access.',
    },
  });

  // 2. Admin User
  const passwordHash = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@mayapictures.com' },
    update: { passwordHash },
    create: {
      email: 'admin@mayapictures.com',
      username: 'admin',
      fullName: 'Maya Pictures Admin',
      passwordHash,
      roleId: sysAdminRole.id,
    },
  });

  // 3. Categories
  const categoriesData = [
    { name: 'Wedding', slug: 'wedding', description: 'Love stories, ceremonies, and unforgettable wedding moments.' },
    { name: 'Portraits', slug: 'portraits', description: 'People, expressions, personal branding, and artistic portraits.' },
    { name: 'Events', slug: 'events', description: 'Corporate galas, private celebrations, and event highlights.' },
    { name: 'Fashion', slug: 'fashion', description: 'Editorial fashion shoots, runway, and creative style reels.' },
    { name: 'Product', slug: 'product', description: 'High-quality commercial product imagery for modern brands.' },
    { name: 'Nature', slug: 'nature', description: 'Landscapes, wildlife, and breathtaking natural photography.' },
  ];

  const categoryMap = {};
  for (let i = 0; i < categoriesData.length; i++) {
    const cat = await prisma.portfolioCategory.upsert({
      where: { slug: categoriesData[i].slug },
      update: {},
      create: { ...categoriesData[i], displayOrder: i },
    });
    categoryMap[cat.slug] = cat.id;
  }

  // 4. Portfolio Projects & Media
  const projectsData = [
    {
      title: 'Eternal Vows & Celebration',
      slug: 'eternal-vows',
      description: 'An elegant wedding story captured in timeless detail.',
      categorySlug: 'wedding',
      coverImage: '/images/wedding-1.jpg',
      isFeatured: true,
      media: [
        { type: 'image', src: '/images/wedding-1.jpg', caption: 'Wedding Ceremony', subLabel: 'Love Stories' },
        { type: 'image', src: '/images/wedding-2.jpg', caption: 'Bride & Groom Moments', subLabel: 'Love Stories' },
        { type: 'video', src: '/images/wedding-video.mp4', caption: 'Wedding Highlight Film', subLabel: 'Highlight Film' },
        { type: 'video', src: '/images/ሽምግልና-video.mp4', caption: 'Traditional Ceremony (ሽምግልና)', subLabel: 'Cultural Ceremony' },
      ],
    },
    {
      title: 'Expressions & Identity',
      slug: 'expressions-identity',
      description: 'Candid and studio portraits showcasing genuine character.',
      categorySlug: 'portraits',
      coverImage: '/images/portrait_1.jpg',
      isFeatured: true,
      media: [
        { type: 'image', src: '/images/portrait_1.jpg', caption: 'Studio Portrait Session', subLabel: 'People & Expressions' },
        { type: 'image', src: '/images/portrait_2.jpg', caption: 'Natural Light Portrait', subLabel: 'People & Expressions' },
      ],
    },
    {
      title: 'Grand Gala & Cultural Celebrations',
      slug: 'grand-gala',
      description: 'Highlight coverage of corporate and private celebrations.',
      categorySlug: 'events',
      coverImage: '/images/event-1.jpg',
      isFeatured: true,
      media: [
        { type: 'image', src: '/images/event-1.jpg', caption: 'Gala Evening Highlights', subLabel: 'Moments & Memories' },
        { type: 'image', src: '/images/event-2.jpg', caption: 'Celebration Gathering', subLabel: 'Moments & Memories' },
        { type: 'image', src: '/images/event-3.jpg', caption: 'Stage Moments', subLabel: 'Moments & Memories' },
        { type: 'image', src: '/images/event-4.jpg', caption: 'Evening Audience', subLabel: 'Moments & Memories' },
        { type: 'video', src: '/images/event-video.mp4', caption: 'Event Recap Film', subLabel: 'Event Recap' },
        { type: 'video', src: '/images/ሽምግልና1-video.mp4', caption: 'Behind the Scenes (ሽምግልና1)', subLabel: 'Behind the Scenes' },
      ],
    },
    {
      title: 'High Fashion Editorial',
      slug: 'high-fashion-editorial',
      description: 'Modern aesthetic fashion showcase.',
      categorySlug: 'fashion',
      coverImage: '/images/portrait_1.jpg',
      isFeatured: true,
      media: [
        { type: 'video', src: '/images/fashion-video.mp4', caption: 'Editorial Fashion Reel', subLabel: 'Editorial Reel' },
      ],
    },
    {
      title: 'Commercial Product Craft',
      slug: 'commercial-product-craft',
      description: 'Precision product photography for branding.',
      categorySlug: 'product',
      coverImage: '/images/product-1.jpg',
      isFeatured: true,
      media: [
        { type: 'image', src: '/images/product-1.jpg', caption: 'Luxury Product Imagery', subLabel: 'High-Quality Imagery' },
        { type: 'image', src: '/images/product-2.jpg', caption: 'Brand Product Display', subLabel: 'High-Quality Imagery' },
      ],
    },
    {
      title: 'Wild Landscapes & Nature',
      slug: 'wild-landscapes',
      description: 'Serene landscape and wildlife photography.',
      categorySlug: 'nature',
      coverImage: '/images/nature-1.jpg',
      isFeatured: true,
      media: [
        { type: 'image', src: '/images/nature-1.jpg', caption: 'Breathtaking Landscapes', subLabel: 'Wildlife & Landscapes' },
        { type: 'image', src: '/images/nature-2.jpg', caption: 'Nature Elements', subLabel: 'High-Quality Nature' },
      ],
    },
  ];

  for (let p of projectsData) {
    const project = await prisma.portfolioProject.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        title: p.title,
        slug: p.slug,
        description: p.description,
        categoryId: categoryMap[p.categorySlug],
        coverImage: p.coverImage,
        isFeatured: p.isFeatured,
        status: 'PUBLISHED',
      },
    });

    // Delete old media & add updated list
    await prisma.portfolioMedia.deleteMany({ where: { projectId: project.id } });
    for (let m of p.media) {
      await prisma.portfolioMedia.create({
        data: {
          projectId: project.id,
          type: m.type,
          src: m.src,
          caption: m.caption,
          subLabel: m.subLabel,
        },
      });
    }
  }

  // 5. Services
  const servicesData = [
    {
      name: 'Wedding Photography',
      slug: 'wedding-photography',
      shortDesc: 'Elegant, candid coverage of your special day. We capture the laughter, the tears, and every in-between moment.',
      icon: 'ring',
      coverImage: '/images/wedding-1.jpg',
      displayOrder: 1,
    },
    {
      name: 'Portrait Photography',
      slug: 'portrait-photography',
      shortDesc: 'Natural and stunning portraits that reflect your personality — from personal branding to family sessions.',
      icon: 'user',
      coverImage: '/images/portrait_1.jpg',
      displayOrder: 2,
    },
    {
      name: 'Event Photography',
      slug: 'event-photography',
      shortDesc: 'Corporate galas, private parties, and everything in between. We document the energy and essence of your event.',
      icon: 'calendar-check',
      coverImage: '/images/event-1.jpg',
      displayOrder: 3,
    },
    {
      name: 'Fashion Photography',
      slug: 'fashion-photography',
      shortDesc: 'Editorial and commercial shoots with a refined aesthetic. We bring your creative vision to life.',
      icon: 'tshirt',
      coverImage: '/images/portrait_2.jpg',
      displayOrder: 4,
    },
    {
      name: 'Product Photography',
      slug: 'product-photography',
      shortDesc: 'High-quality product photography that highlights every detail and elevates your brand.',
      icon: 'box',
      coverImage: '/images/product-1.jpg',
      displayOrder: 5,
    },
    {
      name: 'Nature Photography',
      slug: 'nature-photography',
      shortDesc: 'Capturing the beauty of the natural world — landscapes, wildlife, and environmental storytelling.',
      icon: 'tree',
      coverImage: '/images/nature-1.jpg',
      displayOrder: 6,
    },
  ];

  for (let s of servicesData) {
    await prisma.service.upsert({
      where: { slug: s.slug },
      update: {},
      create: s,
    });
  }

  // 6. Packages
  const packagesData = [
    {
      name: 'BEAUTY',
      slug: 'beauty',
      priceDisplay: '2,000 ETB +',
      minPrice: 2000,
      currency: 'ETB',
      description: 'Perfect for small sessions & personal portraits.',
      duration: '1-2 Hours',
      deliverables: '15 Edited Digital Photos, Online Gallery, 1 Print',
      isFeatured: false,
      displayOrder: 1,
    },
    {
      name: 'STANDARD',
      slug: 'standard',
      priceDisplay: '10,000 - 15,000 ETB +',
      minPrice: 10000,
      maxPrice: 15000,
      currency: 'ETB',
      description: 'Ideal for events, engagements & family sessions.',
      duration: 'Half-Day (4 Hours)',
      deliverables: '50 Edited Digital Photos, Full HD Highlights Video, Online Gallery',
      isFeatured: true,
      displayOrder: 2,
    },
    {
      name: 'PREMIUM',
      slug: 'premium',
      priceDisplay: '80,000 ETB +',
      minPrice: 80000,
      currency: 'ETB',
      description: 'Complete all-inclusive coverage for your big day.',
      duration: 'Full Day Coverage',
      deliverables: 'Full Wedding Story, 4K Cinema Video, Photo Album, Drone Coverage, All High-Res RAW files',
      isFeatured: true,
      displayOrder: 3,
    },
  ];

  for (let pkg of packagesData) {
    await prisma.package.upsert({
      where: { slug: pkg.slug },
      update: {},
      create: pkg,
    });
  }

  // 7. Testimonials
  const testimonialsData = [
    {
      clientName: 'Sarah & Henok',
      role: 'Wedding Client',
      quote: 'Amazing experience! The photos turned out better than we imagined. Highly professional and super easy to work with.',
      rating: 5,
      isFeatured: true,
      displayOrder: 1,
    },
    {
      clientName: 'Michael & Emily',
      role: 'Engagement Session',
      quote: 'Incredible eye for detail and creativity. Captured our special day so beautifully. We will cherish these forever!',
      rating: 5,
      isFeatured: true,
      displayOrder: 2,
    },
    {
      clientName: 'David Thompson',
      role: 'Corporate Event Organizer',
      quote: 'Very professional, punctual and talented. The photos speak for themselves. Highly recommended for any event!',
      rating: 5,
      isFeatured: true,
      displayOrder: 3,
    },
  ];

  for (let t of testimonialsData) {
    const existing = await prisma.testimonial.findFirst({ where: { clientName: t.clientName } });
    if (!existing) {
      await prisma.testimonial.create({ data: t });
    }
  }

  // 8. Stories (Blog)
  const storiesData = [
    {
      title: '10 Tips for Natural & Authentic Portraits',
      slug: '10-tips-natural-portraits',
      excerpt: 'Learn how to make your subjects feel at ease and capture genuine expressions.',
      content: 'Portraits are all about emotion. When photographing individuals or couples, our goal is to create a relaxed environment where natural expressions shine...',
      category: 'Tips & Tricks',
    },
    {
      title: 'The Art of Cinematic Wedding Storytelling',
      slug: 'art-cinematic-wedding-storytelling',
      excerpt: 'How we approach a wedding day to tell a cohesive, emotional story.',
      content: 'A wedding is a sequence of precious moments — from the quiet morning prep to the energetic evening dance. Here is how Maya Pictures approaches visual storytelling...',
      category: 'Weddings',
    },
    {
      title: 'Behind the Scenes: High-Fashion Shoot',
      slug: 'behind-scenes-fashion-shoot',
      excerpt: 'A glimpse into our creative process for a recent editorial fashion project.',
      content: 'Lighting, wardrobe, composition, and movement come together in fashion photography. Take a look behind the curtain at Maya Pictures studio...',
      category: 'Behind The Scenes',
    },
  ];

  for (let st of storiesData) {
    await prisma.story.upsert({
      where: { slug: st.slug },
      update: {},
      create: st,
    });
  }

  // 9. FAQs
  const faqsData = [
    {
      question: 'How do I book a photography session?',
      answer: 'You can easily book a session by clicking the "BOOK A SESSION" button or navigating to our Contact/Book page. Choose your preferred date, service, and package, and our team will get in touch with you.',
      category: 'Booking',
      displayOrder: 1,
    },
    {
      question: 'How long does it take to receive edited photos and videos?',
      answer: 'Standard portrait sessions are delivered within 3-5 business days. Full event and wedding packages are typically delivered within 2-3 weeks via a secure online gallery.',
      category: 'Delivery',
      displayOrder: 2,
    },
    {
      question: 'Can I customize a package for my event?',
      answer: 'Yes! We understand every project is unique. Contact us directly and we can create a custom photography and videography package tailored to your exact budget and requirements.',
      category: 'Pricing',
      displayOrder: 3,
    },
  ];

  for (let f of faqsData) {
    const existing = await prisma.fAQ.findFirst({ where: { question: f.question } });
    if (!existing) {
      await prisma.fAQ.create({ data: f });
    }
  }

  // 10. Website Settings
  const settingsData = [
    { key: 'site_title', value: 'Maya Pictures | Professional Photography Studio' },
    { key: 'studio_phone', value: '(+251) 913222709' },
    { key: 'studio_email', value: 'hello@mayapictures.com' },
    { key: 'studio_address', value: '123 GONDAR PIASSA NEAR, BEJIROND CAFE' },
    { key: 'hero_eyebrow', value: 'Capturing Moments, Creating Stories' },
    { key: 'hero_title_line1', value: "WE DON'T JUST TAKE PHOTOS" },
    { key: 'hero_title_line2', value: 'We Capture Emotions.' },
    { key: 'hero_tagline', value: 'You Live Them. Professional photography for all your special moments.' },
    { key: 'hero_video_url', value: '/background.mp4' },
    { key: 'experience_years', value: '10+ YEARS OF EXPERIENCE' },
  ];

  for (let s of settingsData) {
    await prisma.websiteSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }

  console.log('Database seeding complete successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
