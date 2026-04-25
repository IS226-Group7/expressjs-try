import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { 
  sequelize, 
  User, 
  UserAccount, 
  UserType, 
  UserAccountManagement 
} from './models/index.js';

const seedAdmin = async () => {
  try {
    // 1. Test Connection
    await sequelize.authenticate();
    console.log('📡 Connected to MariaDB for seeding...');

    // 2. Sync Tables (Safety First: This creates tables if they don't exist)
    await sequelize.sync({ alter: true });

    // 3. Create Basic User Types (The "Roles")
    // Use findOrCreate so we don't duplicate if you run this twice
    const [adminType] = await UserType.findOrCreate({
      where: { userType_name: 'Admin' },
      defaults: { description: 'System Administrator with full access' }
    });

    await UserType.findOrCreate({
      where: { userType_name: 'Technician' },
      defaults: { description: 'Scanner operator and asset editor' }
    });

    // 4. Create the Human Record (The "Person")
    const [newHuman] = await User.findOrCreate({
      where: { payslip_account_number: 'ADMIN-001' },
      defaults: {
        rank: 'Admin',
        last_name: 'System',
        first_name: 'Primary'
      }
    });

    // 5. Create the Login Account (The "Credentials")
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    const [newAccount] = await UserAccount.findOrCreate({
      where: { username: 'admin' },
      defaults: {
        password: hashedPassword,
        user_id: newHuman.user_id,
        userType_id: adminType.userType_id,
        status: 'active'
      }
    });

    // 6. Set Admin Permissions
    await UserAccountManagement.findOrCreate({
      where: { userAccount_id: newAccount.userAccount_id },
      defaults: {
        admin_flag: 1 // High-level access
      }
    });

    console.log('-----------------------------------');
    console.log('🚀 SEEDING SUCCESSFUL');
    console.log('User: admin');
    console.log('Pass: Admin123!');
    console.log('Role: Admin');
    console.log('-----------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedAdmin();