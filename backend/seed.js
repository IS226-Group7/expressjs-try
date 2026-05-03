import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { 
  sequelize, 
  User, 
  UserAccount, 
  UserType, 
  UserAccountManagement,
  Category,
  AcquisitionType,
  Component,
  Asset,
} from './models/index.js';
import ComponentType from './models/Component_Type_Record.js';

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

    // Build Libraries for Assets
    const [cat1] = await Category.findOrCreate({
      where: { category_name: 'ComputerEquipment' },
      defaults: {
        description: 'Computing devices such as desktops, laptops, and workstations used for data processing and office productivity',
      }
    });
    const [cat2] = await Category.findOrCreate({
      where: { category_name: 'NetworkEquipment' },
      defaults: {
        description: 'Devices used for network connectivity such as routers, switches, and access points',
      }
    });
    const [cat3] = await Category.findOrCreate({
      where: { category_name: 'PeripheralDevices' },
      defaults: {
        description: 'External devices connected to computers including printers, scanners, keyboards, and monitors',
      }
    });
    const [cat4] = await Category.findOrCreate({
      where: { category_name: 'SecurityDevices' },
      defaults: {
        description: 'Equipment used for IT and physical security such as CCTV systems, firewalls, and biometric devices',
      }
    });

    const [acq1] = await AcquisitionType.findOrCreate({
      where: { acquisitionType_name: 'Issued' },
      defaults: {
        description: 'Assets given by higher headquarters',
      }
    });
    const [acq2] = await AcquisitionType.findOrCreate({
      where: { acquisitionType_name: 'MOOE' },
      defaults: {
        description: 'Assets bought through Maintenance and Other Operating Expenses allotment',
      }
    });
    const [acq3] = await AcquisitionType.findOrCreate({
      where: { acquisitionType_name: 'Donated' },
      defaults: {
        description: 'Assets received free of charge from another entity',
      }
    });
    const [acq4] = await AcquisitionType.findOrCreate({
      where: { acquisitionType_name: 'Loaned' },
      defaults: {
        description: 'Assets borrowed from other PNP unit or office',
      }
    });

    const [compo1] = await ComponentType.findOrCreate({
      where: { component_type_name: 'Cooling Fan' },
      defaults: {
        description: 'Prevents overheating',
      }
    });
    const [compo2] = await ComponentType.findOrCreate({
      where: { component_type_name: 'Graphics Card' },
      defaults: {
        description: 'Handles image rendering',
      }
    });
    const [compo3] = await ComponentType.findOrCreate({
      where: { component_type_name: 'HDD' },
      defaults: {
        description: 'Traditional storage device',
      }
    });
    const [compo4] = await ComponentType.findOrCreate({
      where: { component_type_name: 'Motherboard' },
      defaults: {
        description: 'Main circuit board connecting all components',
      }
    });
    const [compo5] = await ComponentType.findOrCreate({
      where: { component_type_name: 'NIC' },
      defaults: {
        description: 'Enables network connectivity',
      }
    });
    const [compo6] = await ComponentType.findOrCreate({
      where: { component_type_name: 'Power Supply' },
      defaults: {
        description: 'Provides power to components',
      }
    });
    const [compo7] = await ComponentType.findOrCreate({
      where: { component_type_name: 'Processor' },
      defaults: {
        description: 'Executes instructions and processes data',
      }
    });
    const [compo8] = await ComponentType.findOrCreate({
      where: { component_type_name: 'RAM' },
      defaults: {
        description: 'Temporary memory for active processes',
      }
    });
    const [compo9] = await ComponentType.findOrCreate({
      where: { component_type_name: 'SSD' },
      defaults: {
        description: 'Fast storage device',
      }
    });


    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedAdmin();