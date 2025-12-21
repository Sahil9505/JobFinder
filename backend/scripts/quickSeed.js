// Quick seed script - adds 5 sample jobs to your database
// Run with: node scripts/quickSeed.js

const connectDB = require('../config/db');
const Job = require('../models/Job');

const quickSeed = async () => {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await connectDB();
    console.log('✓ Connected to MongoDB');

    // Delete old sample jobs
    await Job.deleteMany({});
    console.log('✓ Cleared old jobs');

    // Create 5 sample jobs
    const sampleJobs = [
      {
        title: 'Frontend Developer Intern',
        company: 'TechCorp India',
        location: 'Bangalore, India',
        city: 'Bangalore',
        country: 'India',
        type: 'Internship',
        jobType: 'Internal',
        applyType: 'internal',
        stipend: '₹15,000/month',
        skills: ['React', 'JavaScript', 'CSS', 'HTML'],
        responsibilities: ['Build UI components', 'Collaborate with designers', 'Fix bugs and improve UX'],
        eligibility: 'Students pursuing B.Tech/BCA (2nd/3rd year)',
        perks: ['Certificate', 'PPO opportunity', 'Flexible hours'],
        description: 'Join our team as a Frontend Developer Intern and work on exciting projects using React and modern web technologies.',
        isVerified: true
      },
      {
        title: 'Full Stack Developer',
        company: 'StartupXYZ',
        location: 'Mumbai, India',
        city: 'Mumbai',
        country: 'India',
        type: 'Job',
        jobType: 'Internal',
        applyType: 'internal',
        salary: '₹6-8 LPA',
        salaryMin: 600000,
        salaryMax: 800000,
        skills: ['React', 'Node.js', 'MongoDB', 'Express'],
        responsibilities: ['Develop full-stack features', 'Write clean code', 'Participate in code reviews'],
        eligibility: 'Freshers with MERN stack knowledge (0-1 years)',
        perks: ['Health insurance', 'Work from home', 'Learning budget'],
        description: 'Looking for a passionate Full Stack Developer to join our growing team and build scalable web applications.',
        isVerified: true
      },
      {
        title: 'Backend Developer Intern',
        company: 'DataFlow Solutions',
        location: 'Hyderabad, India',
        city: 'Hyderabad',
        country: 'India',
        type: 'Internship',
        jobType: 'Internal',
        applyType: 'internal',
        stipend: '₹12,000/month',
        skills: ['Node.js', 'Express', 'MongoDB', 'REST API'],
        responsibilities: ['Build REST APIs', 'Database management', 'Write documentation'],
        eligibility: 'Students with backend development interest',
        perks: ['Certificate', 'Mentorship', 'Stipend'],
        description: 'Backend development internship focused on building scalable APIs and working with databases.',
        isVerified: true
      },
      {
        title: 'React Developer',
        company: 'WebSolutions Pvt Ltd',
        location: 'Pune, India',
        city: 'Pune',
        country: 'India',
        type: 'Job',
        jobType: 'Internal',
        applyType: 'internal',
        salary: '₹5-7 LPA',
        salaryMin: 500000,
        salaryMax: 700000,
        skills: ['React', 'Redux', 'TypeScript', 'JavaScript'],
        responsibilities: ['Develop React applications', 'Optimize performance', 'Collaborate with backend team'],
        eligibility: 'Freshers or 0-2 years experience in React',
        perks: ['Health insurance', '5 days week', 'Career growth'],
        description: 'Join as a React Developer and create amazing user experiences with modern frontend technologies.',
        isVerified: true
      },
      {
        title: 'MERN Stack Intern',
        company: 'CodeCraft India',
        location: 'Delhi, India',
        city: 'Delhi',
        country: 'India',
        type: 'Internship',
        jobType: 'Internal',
        applyType: 'internal',
        stipend: '₹10,000/month',
        skills: ['MongoDB', 'Express', 'React', 'Node.js'],
        responsibilities: ['Build full-stack features', 'Learn best practices', 'Work in agile team'],
        eligibility: 'Students pursuing engineering degree',
        perks: ['Certificate', 'PPO opportunity', 'Training'],
        description: 'MERN Stack internship offering hands-on experience with full-stack web development.',
        isVerified: true
      }
    ];

    // Insert jobs
    const created = await Job.insertMany(sampleJobs);
    console.log(`✓ Created ${created.length} sample jobs`);

    // Display created jobs
    console.log('\nCreated jobs:');
    created.forEach((job, i) => {
      console.log(`${i + 1}. ${job.title} at ${job.company} (${job.type})`);
    });

    console.log('\n✓ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

quickSeed();
