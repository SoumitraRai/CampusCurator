const mongoose = require('mongoose');
require('./config/database');

async function viewGroupsAndAllotment() {
  try {
    const Group = require('./models/Group');
    const User = require('./models/User');
    
    // Wait for connection
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const groups = await Group.find()
      .populate('members', 'name email')
      .populate('assignedMentor', 'name email')
      .populate('mentorPreferences.mentor', 'name email');
    
    console.log('\n' + '='.repeat(90));
    console.log('📋 GROUP FORMATION & MENTOR ALLOTMENT DETAILS');
    console.log('='.repeat(90));
    
    groups.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    
    for (let i = 0; i < groups.length; i++) {
      const group = groups[i];
      console.log(`\n\n🎯 GROUP ${i+1}: ${group.name}`);
      console.log('-'.repeat(90));
      console.log(`   📅 Created At: ${new Date(group.createdAt).toLocaleString()}`);
      console.log(`   Status: ${group.status}`);
      console.log(`\n   👥 Members (${group.members.length}):`);
      group.members.forEach((member, idx) => {
        console.log(`      ${idx+1}. ${member.name} (${member.email})`);
      });
      
      console.log(`\n   🎓 Mentor Preferences (FIFO Priority Order):`);
      group.mentorPreferences.forEach((pref) => {
        const isCurrent = group.assignedMentor && group.assignedMentor._id.toString() === pref.mentor._id.toString();
        const marker = isCurrent ? '✅ ASSIGNED' : '⭕';
        console.log(`      ${marker} Rank ${pref.rank}: ${pref.mentor.name} (${pref.mentor.email})`);
      });
      
      if (group.assignedMentor) {
        console.log(`\n   ✅ ASSIGNED MENTOR: ${group.assignedMentor.name} (${group.assignedMentor.email})`);
      } else {
        console.log(`\n   ⏳ MENTOR: Not yet assigned`);
      }
    }
    
    console.log('\n\n' + '='.repeat(90));
    console.log('📊 FIFO MENTOR ALLOTMENT ALGORITHM');
    console.log('='.repeat(90));
    console.log(`
🔍 How It Works:
   1️⃣  All unassigned groups are sorted by createdAt (EARLIEST FIRST)
   2️⃣  For each group in order:
       • Check if 1st preference mentor has capacity (< 3 groups)
       • If yes → ASSIGN and mark capacity used
       • If no → Check 2nd preference, then 3rd preference
   3️⃣  Result: FAIR allocation ensuring:
       ✓ Groups created first get their preferences honored first
       ✓ No mentor exceeds capacity (max 3 groups)
       ✓ Preferences are satisfied when possible

Current Allocation Summary:
`);
    
    const allotmentMap = {};
    groups.forEach(g => {
      if (g.assignedMentor) {
        if (!allotmentMap[g.assignedMentor.name]) {
          allotmentMap[g.assignedMentor.name] = [];
        }
        allotmentMap[g.assignedMentor.name].push(g.name);
      }
    });
    
    Object.entries(allotmentMap).forEach(([mentor, groupList]) => {
      console.log(`   📌 ${mentor}: ${groupList.join(', ')} (${groupList.length}/3 capacity)`);
    });
    
    console.log('\n' + '='.repeat(90) + '\n');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch(err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

viewGroupsAndAllotment();
