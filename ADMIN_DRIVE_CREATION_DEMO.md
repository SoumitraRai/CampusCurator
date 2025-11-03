# Admin Drive Creation - Complete Demo Guide 📋

## Overview
This guide walks you through the ENTIRE process of creating a drive as an Admin, from login to drive publication.

---

## STEP 1: LOGIN AS ADMIN 🔐

### What to Show:
```
URL: http://localhost:3000/auth/login

┌─────────────────────────────────────────────────────┐
│ CampusCurator - Sign In Page                        │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Email Address: [________________]                   │
│ Password:      [________________]                   │
│                                                     │
│ [Sign In]                                           │
│ [Sign in with Google]                              │
│                                                     │
│ Demo Credentials (Show):                            │
│ ┌───────────────────────────────────────────────┐  │
│ │ ADMIN                                         │  │
│ │ Email: admin@campuscurator.com                │  │
│ │ Password: admin123                            │  │
│ │ [Use] button                                  │  │
│ └───────────────────────────────────────────────┘  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Steps to Perform:

**Step 1a: Show Demo Credentials**
- Click on **"Show Demo Credentials"** button
- Point out the three roles: Admin (Orange), Mentor (Green), Student (Purple)

**Step 1b: Click "Use" for Admin**
- Click the orange **[Use]** button next to Admin credentials
- Fields auto-populate:
  - Email: `admin@campuscurator.com`
  - Password: `admin123`

**Step 1c: Sign In**
- Click **[Sign In]** button
- Page shows loading spinner briefly
- ✅ Redirects to `/admin/dashboard`

### What Happens Behind the Scenes:

```
Frontend (/dashboard/src/app/auth/login/page.jsx):
┌─────────────────────────────────────────────────┐
│ onSubmit triggered                              │
│ ↓                                                │
│ await login(email, password)                    │
│ ↓                                                │
│ Backend: POST /auth/login                       │
└─────────────────────────────────────────────────┘

Backend (/backend/controllers/authController.js):
┌─────────────────────────────────────────────────┐
│ Find user by email                              │
│ ↓                                                │
│ Validate password (bcrypt)                      │
│ ↓                                                │
│ Generate JWT token                              │
│ ↓                                                │
│ Response: { token, user: {...} }                │
└─────────────────────────────────────────────────┘

Frontend stores token in localStorage:
┌─────────────────────────────────────────────────┐
│ localStorage.setItem('cc_token', token)         │
│ ↓                                                │
│ Check user.role === 'admin'                     │
│ ↓                                                │
│ router.push('/admin/dashboard')                 │
└─────────────────────────────────────────────────┘
```

**Say to Audience:**
> "As an admin, I'm logging in with special credentials. The system generates a JWT token that's stored locally. Notice how the system detects I'm an admin and routes me to the admin dashboard instead of a student or mentor dashboard."

---

## STEP 2: ADMIN DASHBOARD 📊

### What to Show:

```
URL: http://localhost:3000/admin/dashboard

┌──────────────────────────────────────────────────────┐
│ Welcome Admin, [Current Admin Name]!                 │
│ Department: [Admin Department]                       │
├──────────────────────────────────────────────────────┤
│                                                      │
│ STATS CARDS (4 columns):                             │
│ ┌────────────┐ ┌────────────┐ ┌────────────┐         │
│ │ Total      │ │ Active     │ │ Total      │         │
│ │ Drives     │ │ Drives     │ │ Groups     │         │
│ │   [X]      │ │   [Y]      │ │   [Z]      │         │
│ └────────────┘ └────────────┘ └────────────┘         │
│                                                      │
│ ┌────────────┐                                       │
│ │ Pending    │                                       │
│ │ Evaluations│                                       │
│ │   [W]      │                                       │
│ └────────────┘                                       │
│                                                      │
├──────────────────────────────────────────────────────┤
│ ACTION BUTTONS:                                      │
│                                                      │
│ [+ NEW DRIVE] ← Click here to create a drive        │
│ [VIEW ALL DRIVES]                                    │
│ [MANAGE DRIVES]                                      │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Steps to Perform:

**Say to Audience:**
> "Now I'm on the admin dashboard. I can see statistics about all the drives, groups, and evaluations in the system. To create a new drive, I'll click the '[+ NEW DRIVE]' button."

**Step 2a: Highlight Stats**
- Point to each stat card
- Explain: "These show total drives, active drives, groups, and pending evaluations"

**Step 2b: Click "[+ NEW DRIVE]" Button**
- Click the prominent **[+ NEW DRIVE]** button
- Page navigates to: `http://localhost:3000/admin/drives/new`

---

## STEP 3: CREATE DRIVE FORM 📝

### What to Show:

```
URL: http://localhost:3000/admin/drives/new

┌──────────────────────────────────────────────────────────┐
│ CREATE NEW DRIVE                                         │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ SECTION 1: BASIC INFORMATION                             │
│ ┌────────────────────────────────────────────────────┐  │
│ │ Drive Name *                                       │  │
│ │ [_________________________________]               │  │
│ │ Example: "Mini Project 2025 - Sem 6"             │  │
│ │                                                    │  │
│ │ Description *                                      │  │
│ │ [________________________________________]         │  │
│ │ [________________________________________]         │  │
│ │ Example: "Final year mini project evaluation"     │  │
│ │                                                    │  │
│ │ Academic Year *                                    │  │
│ │ [_________________________________]               │  │
│ │ Example: "2024-2025"                              │  │
│ └────────────────────────────────────────────────────┘  │
│                                                          │
│ SECTION 2: GROUP CONFIGURATION                          │
│ ┌────────────────────────────────────────────────────┐  │
│ │ Min Group Size *                                   │  │
│ │ [__] (Default: 2)                                 │  │
│ │                                                    │  │
│ │ Max Group Size *                                   │  │
│ │ [__] (Default: 4)                                 │  │
│ │                                                    │  │
│ │ Max Groups per Mentor *                            │  │
│ │ [__] (Default: 6)                                 │  │
│ │                                                    │  │
│ │ Participating Batches *                            │  │
│ │ [_________________________________]               │  │
│ │ Example: "2025" or "2024,2025"                    │  │
│ └────────────────────────────────────────────────────┘  │
│                                                          │
│ SECTION 3: SELECT PARTICIPANTS                          │
│ ┌────────────────────────────────────────────────────┐  │
│ │ STUDENTS (Batch 2025)                              │  │
│ │ [Toggle all] ▼                                     │  │
│ │                                                    │  │
│ │ ☐ alice.w@student.com          Alice W             │  │
│ │ ☐ bob.j@student.com            Bob J               │  │
│ │ ☐ charlie.b@student.com        Charlie B           │  │
│ │ ☐ diana.m@student.com          Diana M             │  │
│ │                                                    │  │
│ │ ─────────────────────────────────────────────────  │  │
│ │                                                    │  │
│ │ MENTORS (Computer Science)                         │  │
│ │ [Toggle all] ▼                                     │  │
│ │                                                    │  │
│ │ ☐ john.smith@campuscurator.com  John Smith        │  │
│ │ ☐ jane.doe@campuscurator.com    Jane Doe          │  │
│ │ ☐ tom.hardy@campuscurator.com   Tom Hardy         │  │
│ │                                                    │  │
│ └────────────────────────────────────────────────────┘  │
│                                                          │
│ [RESET]                          [CREATE DRIVE]         │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Steps to Perform:

**Say to Audience:**
> "Now I'm on the drive creation form. I need to fill in the basic information, configure group settings, and select which students and mentors will participate in this drive."

**Step 3a: Fill Section 1 - Basic Information**

1. **Drive Name Field:**
   - Click on the "Drive Name" input field
   - Type: `Mini Project 2025 - Semester 6`
   - Say: "This is the name students will see when browsing drives"

2. **Description Field:**
   - Click on "Description" textarea
   - Type: `Final year mini project evaluation. Students will work in groups on real-world problems with mentor guidance.`
   - Say: "This describes what the drive is about"

3. **Academic Year Field:**
   - Click on "Academic Year" field
   - Type: `2024-2025`
   - Say: "This helps organize drives by academic year"

**Step 3b: Fill Section 2 - Group Configuration**

1. **Min Group Size:**
   - Click field, clear default, type: `2`
   - Say: "Minimum 2 students per group to ensure collaboration"

2. **Max Group Size:**
   - Click field, clear default, type: `4`
   - Say: "Maximum 4 students so groups stay manageable"

3. **Max Groups per Mentor:**
   - Click field, clear default, type: `6`
   - Say: "Each mentor can oversee up to 6 groups"

4. **Participating Batches:**
   - Click field
   - Type: `2025`
   - Say: "Only batch 2025 students can participate in this drive"

**Step 3c: Select Participants - Students**

1. **Show Students Section:**
   - Point to "STUDENTS (Batch 2025)" section
   - Say: "The system has automatically loaded all batch 2025 students"

2. **Select Students:**
   - Check: ☑ alice.w@student.com
   - Check: ☑ bob.j@student.com
   - Check: ☑ charlie.b@student.com
   - Say: "I'm selecting 3 students to participate. Only these students will see this drive."

3. **(Optional) Bulk Select:**
   - Or click "Toggle all" to select all students
   - Say: "I could select all students with one click"

**Step 3d: Select Participants - Mentors**

1. **Show Mentors Section:**
   - Point to "MENTORS (Computer Science)" section
   - Say: "The system has loaded mentors from the Computer Science department"

2. **Select Mentors:**
   - Check: ☑ john.smith@campuscurator.com
   - Check: ☑ jane.doe@campuscurator.com
   - Say: "I'm assigning 2 mentors to this drive. They will later be assigned to individual groups."

### What's Happening Behind the Scenes:

```
Frontend (/dashboard/src/app/admin/drives/new/page.jsx):
┌─────────────────────────────────────────────────────┐
│ Form State:                                         │
│ {                                                   │
│   name: "Mini Project 2025...",                    │
│   description: "Final year...",                    │
│   academicYear: "2024-2025",                       │
│   minGroupSize: 2,                                 │
│   maxGroupSize: 4,                                 │
│   maxGroupsPerMentor: 6,                           │
│   participatingBatches: "2025",                    │
│   participatingStudents: [                         │
│     "alice.w@student.com",                         │
│     "bob.j@student.com",                           │
│     "charlie.b@student.com"                        │
│   ],                                               │
│   mentors: [                                        │
│     "john.smith@campuscurator.com",                │
│     "jane.doe@campuscurator.com"                   │
│   ]                                                │
│ }                                                  │
└─────────────────────────────────────────────────────┘
```

---

## STEP 4: SUBMIT & CREATE DRIVE 🚀

### What to Show:

**Step 4a: Review Everything**
- Say: "Let me review what I've entered before creating the drive"
- Point to each filled field
- Confirm all information is correct

**Step 4b: Click [CREATE DRIVE]**
- Click the **[CREATE DRIVE]** button
- Page shows brief loading indicator
- Form is disabled while processing

### What Happens Behind the Scenes:

```
Frontend → Backend Communication:

Step 1: User clicks [CREATE DRIVE]
        ↓
Step 2: Form data collected into payload object
        ↓
Step 3: POST /drives
        {
          "name": "Mini Project 2025...",
          "description": "Final year...",
          "academicYear": "2024-2025",
          "minGroupSize": 2,
          "maxGroupSize": 4,
          "maxGroupsPerMentor": 6,
          "participatingBatches": ["2025"],
          "participatingStudents": [
            "alice.w@student.com",
            "bob.j@student.com",
            "charlie.b@student.com"
          ],
          "mentors": [
            "john.smith@campuscurator.com",
            "jane.doe@campuscurator.com"
          ]
        }
        ↓
Backend (/backend/controllers/driveController.js):
        ↓
Step 4: Validate all inputs
        - Check name is unique
        - Verify batches format
        - Confirm student emails exist
        - Confirm mentor emails exist
        ↓
Step 5: Create Drive document in MongoDB
        {
          _id: ObjectId(...),
          name: "Mini Project 2025...",
          description: "Final year...",
          academicYear: "2024-2025",
          minGroupSize: 2,
          maxGroupSize: 4,
          maxGroupsPerMentor: 6,
          participatingBatches: ["2025"],
          participatingStudents: [user_ids],
          mentors: [mentor_ids],
          createdBy: admin_id,
          status: "active",
          createdAt: 2025-11-03T...,
          updatedAt: 2025-11-03T...
        }
        ↓
Step 6: Return success response with drive details
        ↓
Frontend:
        ↓
Step 7: Success message shown
        ↓
Step 8: Redirect to /drives page
        ✅ New drive visible in list
```

---

## STEP 5: DRIVE CREATED - CONFIRMATION 🎉

### What to Show:

```
URL: http://localhost:3000/drives

┌────────────────────────────────────────────────────────┐
│ ✅ Drive created successfully!                         │
│    (Green success notification at top)                 │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│ PROJECT DRIVES                                         │
│ Browse and explore all available project drives        │
├────────────────────────────────────────────────────────┤
│                                                        │
│ Drive Card 1 (NEW - HIGHLIGHTED):                      │
│ ┌──────────────────────────────────────────────────┐  │
│ │ 🆕 Mini Project 2025 - Semester 6        [ACTIVE]  │
│ │                                                  │  │
│ │ Final year mini project evaluation. Students    │  │
│ │ will work in groups on real-world problems     │  │
│ │ with mentor guidance.                          │  │
│ │                                                  │  │
│ │ Academic Year: 2024-2025                        │  │
│ │ Status: Active (Enrollment Open)               │  │
│ │ Batch: 2025                                     │  │
│ │                                                  │  │
│ │ [VIEW DETAILS]                                  │  │
│ │                                                  │  │
│ └──────────────────────────────────────────────────┘  │
│                                                        │
│ (Other existing drives below...)                       │
│                                                        │
└────────────────────────────────────────────────────────┘
```

**Say to Audience:**
> "Perfect! The drive has been created successfully. You can see it now appears in the drives list with an 'ACTIVE' status. This drive is now live and visible to all batch 2025 students and the assigned mentors. Students can now browse this drive and create groups to start their projects."

### Steps to Perform:

**Step 5a: Show Success Notification**
- Point to green success notification at top
- Say: "The system confirms the drive was created"

**Step 5b: Highlight New Drive Card**
- Point to the new drive in the list
- Show: Name, Description, Academic Year, Status
- Say: "Here's our newly created drive with all the information we entered"

**Step 5c: Explain Status**
- Point to "ACTIVE" badge
- Say: "Active status means students can now enroll and create groups"

---

## STEP 6: VERIFY FROM STUDENT PERSPECTIVE 👨‍🎓

### Show the Student View (Optional):

**Steps:**

1. **Logout as Admin**
   - Click user avatar → "Logout"
   - Confirm logout ✅

2. **Login as Alice (Student)**
   - Email: `alice.w@student.com`
   - Password: `student123`
   - ✅ Redirected to `/drives` (student drive page)

3. **Show the New Drive**
   ```
   Alice sees:
   ┌───────────────────────────────────────┐
   │ Mini Project 2025 - Semester 6        │
   │ Final year mini project evaluation... │
   │ Status: Active                         │
   │ [VIEW DETAILS]                         │
   └───────────────────────────────────────┘
   ```

**Say to Audience:**
> "Notice that Alice, who is a student and part of batch 2025, can see the drive we just created. This is because we selected batch 2025 and included her email during drive creation. Now she can click into this drive to create a group."

---

## COMPLETE FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────┐
│ ADMIN DRIVE CREATION FLOW                               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. Login as Admin                                     │
│     admin@campuscurator.com / admin123                │
│           ↓                                            │
│  2. Admin Dashboard                                    │
│     [+ NEW DRIVE] button                              │
│           ↓                                            │
│  3. Drive Creation Form                               │
│     Fill:                                              │
│     ├─ Basic Info (Name, Description, Year)          │
│     ├─ Group Config (Min/Max sizes, Batches)         │
│     └─ Participants (Students, Mentors)              │
│           ↓                                            │
│  4. Validate & Create                                 │
│     Check all inputs → Create in DB                   │
│           ↓                                            │
│  5. Success Page                                       │
│     Redirect to /drives with new drive visible        │
│           ↓                                            │
│  6. Students See Drive                                │
│     alice.w@student.com can now:                      │
│     ├─ Browse the drive details                       │
│     ├─ Create a new group                             │
│     └─ Invite groupmates                              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Key Points to Emphasize During Demo

### 1. **Role-Based Access** 🔐
> "Only admins can create drives. When I login as an admin, I see completely different options than a student would see."

### 2. **Participant Selection** 👥
> "I carefully selected which students and mentors participate. This creates a controlled environment where only relevant people can interact with this drive."

### 3. **Configuration** ⚙️
> "By setting min/max group sizes and mentors' workload, we ensure reasonable group formation and manageable mentor-to-student ratios."

### 4. **Immediate Visibility** 👀
> "Once created, the drive becomes immediately visible to all selected students and mentors. They don't need any extra approvals or invitations."

### 5. **Academic Organization** 📚
> "The academic year and batch information help organize drives and track which cohorts participate in which evaluations."

---

## Common Questions & Answers

**Q: Can I edit a drive after creation?**
A: Yes, admins can click into a drive and edit most fields (except those with existing groups).

**Q: What if I select wrong students?**
A: You can remove students from the drive later, or create a new drive with correct participants.

**Q: Do mentors need to accept the assignment?**
A: No, they automatically have access to the drive and can see all groups within it once groups are assigned to them.

**Q: When do groups get created?**
A: Students create groups after seeing the drive. The next step would be to show how students create groups and join them.

**Q: What's the difference between "Participating Batches" and "Participating Students"?**
A: Batches are broader (e.g., "all batch 2025 students"), while students are specific emails. Both work together - a student must be in a participating batch AND either directly added or be in their batch.

---

## Summary Checklist

- [ ] Login as admin with credentials
- [ ] Navigate to Admin Dashboard
- [ ] Click [+ NEW DRIVE]
- [ ] Fill all basic information fields
- [ ] Set group configuration parameters
- [ ] Select participating students
- [ ] Select participating mentors
- [ ] Click [CREATE DRIVE]
- [ ] Verify success message
- [ ] See new drive in drives list
- [ ] (Optional) Logout and verify as student
- [ ] Confirm student can see the new drive

✅ **Demo Complete!**

---

## Next Steps After Drive Creation

Once the drive is created, you can demonstrate:
1. **Student Group Creation** - Show how Alice creates "Team Alpha"
2. **Mentor Allotment** - Show how admin assigns mentors to groups
3. **Mentor Dashboard** - Show how mentors see their assigned groups
4. **Group Details** - Show student and mentor perspectives of a group
5. **Submissions** - Show how groups submit files

Each of these builds on the drive creation you just demonstrated! 🚀
