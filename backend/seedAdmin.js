const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const MONGODB_URI =
    process.env.MONGODB_URI ||
    'mongodb+srv://suriya003:admin@cluster0.jb7yduw.mongodb.net/?appName=Cluster0';

const seedAdmin = async () => {
    try {
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ MongoDB Connected');

        const adminEmail = 'admin@cityrider.com';
        const adminPassword = 'adminpassword123'; // Change this in production!

        const existingAdmin = await User.findOne({ email: adminEmail });
        if (existingAdmin) {
            console.log('⚠️ Admin user already exists');
            process.exit(0);
        }

        const newAdmin = new User({
            name: 'System Admin',
            email: adminEmail,
            password: adminPassword,
            role: 'admin',
            mobileNumber: '0000000000',
            gender: 'other',
            canSwitchRole: false
        });

        await newAdmin.save();
        console.log('✅ Admin user created successfully');
        console.log(`Email: ${adminEmail}`);
        console.log(`Password: ${adminPassword}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();
