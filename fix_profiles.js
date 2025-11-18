const mongoose = require('mongoose');

mongoose.connect('mongodb://103.225.188.18:27017/?directConnection=true', {
  dbName: 'mydb'
}).then(async () => {
  const Profile = mongoose.model('Profile', new mongoose.Schema({}, {strict: false}));
  
  // Update all profiles to set isComplete = true and isVisible = true
  const result = await Profile.updateMany(
    {},
    { 
      $set: { 
        isComplete: true,
        isVisible: true 
      } 
    }
  );
  
  console.log('\n✅ Updated', result.modifiedCount, 'profiles');
  console.log('All profiles now have isComplete=true and isVisible=true\n');
  
  // Verify the update
  const profiles = await Profile.find({});
  console.log('=== Verification ===');
  profiles.forEach((p, index) => {
    console.log(`Profile ${index + 1}: ${p.name || p.coupleName} - isComplete=${p.isComplete}, isVisible=${p.isVisible}`);
  });
  
  process.exit(0);
}).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
