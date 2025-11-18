const mongoose = require('mongoose');

mongoose.connect('mongodb://103.225.188.18:27017/?directConnection=true', {
  dbName: 'mydb'
}).then(async () => {
  const Profile = mongoose.model('Profile', new mongoose.Schema({}, {strict: false}));
  const profiles = await Profile.find({});
  
  console.log('\n=== Total profiles in mydb:', profiles.length, '===\n');
  
  profiles.forEach((p, index) => {
    console.log(`\n--- Profile ${index + 1} ---`);
    console.log('ID:', p._id);
    console.log('AccountType:', p.accountType);
    console.log('Name:', p.name || p.coupleName || 'N/A');
    console.log('isComplete:', p.isComplete);
    console.log('isVisible:', p.isVisible);
    console.log('Age:', p.age || 'N/A');
    console.log('Gender:', p.gender || 'N/A');
  });
  
  const completeAndVisible = profiles.filter(p => p.isComplete === true && p.isVisible === true);
  console.log('\n\n=== Profiles with isComplete=true AND isVisible=true:', completeAndVisible.length, '===');
  
  process.exit(0);
}).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
