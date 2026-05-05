require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  // Clear existing
  await User.deleteMany({ role: 'admin' });
  await Quiz.deleteMany({});
  await Question.deleteMany({});
  console.log('🗑️  Cleared existing data');

  // Create admin
  const admin = await User.create({
    name: 'Admin',
    email: process.env.ADMIN_EMAIL || 'admin@rasquiz.com',
    password: process.env.ADMIN_PASSWORD || 'Admin@123',
    role: 'admin',
    isEmailVerified: true
  });
  console.log(`👤 Admin created: ${admin.email}`);

  // Create sample quizzes
  const quiz1 = await Quiz.create({
    title: 'Rajasthan History — Set 1',
    description: 'Rajasthan ke itihas ke important topics — RAS 2025 ke liye',
    category: 'Rajasthan History',
    difficulty: 'Medium',
    type: 'free',
    price: 0,
    duration: 600,
    questionTimer: 30,
    passingScore: 60,
    isPublished: true,
    isActive: true,
    isFeatured: true,
    createdBy: admin._id
  });

  const quiz2 = await Quiz.create({
    title: 'Indian Polity — Full Test Series',
    description: 'Samvidhan, Mool Adhikar, DPSP aur Sansad — complete coverage',
    category: 'Indian Polity',
    difficulty: 'Hard',
    type: 'paid',
    price: 49,
    duration: 1800,
    questionTimer: 45,
    passingScore: 70,
    isPublished: true,
    isActive: true,
    createdBy: admin._id
  });

  const quiz3 = await Quiz.create({
    title: 'Daily Challenge — Rajasthan GK',
    description: 'Aaj ka daily challenge!',
    category: 'Rajasthan GK',
    difficulty: 'Easy',
    type: 'free',
    duration: 300,
    questionTimer: 20,
    isPublished: true,
    isActive: true,
    isDailyChallenge: true,
    dailyChallengeDate: new Date(),
    createdBy: admin._id
  });

  // Questions for quiz1
  const q1Questions = [
    { text: 'Maharana Pratap ka janm kahan hua tha?', options: [{text:'Chittorgarh'},{text:'Kumbhalgarh'},{text:'Udaipur'},{text:'Jodhpur'}], correctOption: 1, explanation: 'Maharana Pratap ka janm 9 May 1540 ko Kumbhalgarh durg mein hua tha.' },
    { text: 'Haldighati ka yuddh kab hua?', options: [{text:'1576'},{text:'1568'},{text:'1580'},{text:'1600'}], correctOption: 0, explanation: '18 June 1576 ko Haldighati ka yuddh hua — Maharana Pratap vs Akbar ki sena.' },
    { text: 'Mewar ki rajdhani kaunsi thi?', options: [{text:'Jodhpur'},{text:'Ajmer'},{text:'Chittorgarh'},{text:'Bikaner'}], correctOption: 2, explanation: 'Chittorgarh Mewar riyasat ki rajdhani thi.' },
    { text: 'Prithviraj Chauhan ki rajdhani kahan thi?', options: [{text:'Delhi'},{text:'Ajmer'},{text:'Dono'},{text:'Jaipur'}], correctOption: 2, explanation: 'Prithviraj Chauhan ki do rajdhaniyaan thi — Delhi aur Ajmer.' },
    { text: '"Kanhadde Prabandh" ke lekhak kaun hain?', options: [{text:'Padmanabha'},{text:'Chand Bardai'},{text:'Nainsi'},{text:'Keshavdas'}], correctOption: 0, explanation: 'Padmanabha ne Kanhadde Prabandh likha — jo Jalore ke Kanhadde Dev ke baare mein hai.' },
  ];

  for (const qData of q1Questions) {
    const q = await Question.create({ ...qData, quiz: quiz1._id, marks: 2, negativeMarks: 0.5 });
    quiz1.questions.push(q._id);
  }
  quiz1.totalQuestions = quiz1.questions.length;
  await quiz1.save();

  // Questions for quiz2
  const q2Questions = [
    { text: 'Bhartiya Samvidhan ka "Basic Structure Doctrine" kaunse case mein aaya?', options: [{text:'Golaknath Case'},{text:'Keshavananda Bharati Case'},{text:'Maneka Gandhi Case'},{text:'Minerva Mills Case'}], correctOption: 1, explanation: '1973 mein Keshavananda Bharati vs State of Kerala case mein Basic Structure Doctrine establish ki gayi.' },
    { text: 'Rajya Sabha mein kitne nominated members hote hain?', options: [{text:'10'},{text:'12'},{text:'14'},{text:'8'}], correctOption: 1, explanation: 'Rajya Sabha mein 12 members President dwara nominate kiye jaate hain — arts, science, literature, social service se.' },
    { text: 'Anuched 32 kis Mool Adhikar se related hai?', options: [{text:'Samta ka Adhikar'},{text:'Swatantrata ka Adhikar'},{text:'Samvaidhanik Upachar ka Adhikar'},{text:'Shoshad ke Khilaf Adhikar'}], correctOption: 2, explanation: 'Anuched 32 — Samvaidhanik Upachar ka Adhikar (Right to Constitutional Remedies) — Dr. Ambedkar ne ise "heart and soul of Constitution" kaha.' },
  ];

  for (const qData of q2Questions) {
    const q = await Question.create({ ...qData, quiz: quiz2._id, marks: 4, negativeMarks: 1 });
    quiz2.questions.push(q._id);
  }
  quiz2.totalQuestions = quiz2.questions.length;
  await quiz2.save();

  // Questions for quiz3
  const q3Questions = [
    { text: 'Rajasthan ka rajy pakshi kaun hai?', options: [{text:'Mor'},{text:'Godawan'},{text:'Titar'},{text:'Sarus'}], correctOption: 1, explanation: 'Godawan (Great Indian Bustard) Rajasthan ka State Bird hai.' },
    { text: 'Rajasthan ki sabse lambi nadi kaun si hai?', options: [{text:'Chambal'},{text:'Banas'},{text:'Luni'},{text:'Mahi'}], correctOption: 1, explanation: 'Banas nadi (~480 km) Rajasthan ki sabse lambi nadi hai.' },
    { text: '"Dhundhar" kshetra kahan hai?', options: [{text:'Jodhpur ke aaspaas'},{text:'Jaipur ke aaspaas'},{text:'Kota ke aaspaas'},{text:'Bikaner ke aaspaas'}], correctOption: 1, explanation: 'Dhundhar Jaipur ke aaspaas ka kshetra hai — Dhundh nadi ke naam par.' },
  ];

  for (const qData of q3Questions) {
    const q = await Question.create({ ...qData, quiz: quiz3._id, marks: 1, negativeMarks: 0 });
    quiz3.questions.push(q._id);
  }
  quiz3.totalQuestions = quiz3.questions.length;
  await quiz3.save();

  console.log('✅ Sample quizzes + questions created');
  console.log('\n🎉 Seed complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Admin Email    : ${admin.email}`);
  console.log(`Admin Password : ${process.env.ADMIN_PASSWORD || 'Admin@123'}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
