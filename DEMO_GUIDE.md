# CampusCurator - Complete Demonstration Guide 🎓

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                   CAMPUS CURATOR FLOW                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  1. AUTHENTICATION & ROLE ASSIGNMENT                        │
│     Login → Redirect by Role (Admin/Mentor/Student)         │
│                                                               │
│  2. ADMIN CREATES DRIVE                                     │
│     Create Drive → Select Students/Mentors → Publish       │
│                                                               │
│  3. STUDENTS CREATE/JOIN GROUPS                             │
│     Browse Drive → Create Group → Invite Members            │
│                                                               │
│  4. MENTOR ALLOTMENT                                        │
│     Admin assigns Mentors to Groups (Manual/Auto)           │
│                                                               │
│  5. GROUP SUBMISSIONS                                       │
│     Synopsis → Checkpoints → Reports → Evaluations         │
│                                                               │
│  6. MENTOR REVIEWS                                          │
│     Review Submissions → Accept/Reject with Feedback        │
│                                                               │
│  7. RESULTS PUBLICATION                                     │
│     Mentor evaluates → Admin publishes Results              │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Step-by-Step Demonstration

### **STAGE 1: LOGIN & AUTHENTICATION** 🔐

#### Demo Credentials:

```
┌──────────────────────────────────────────────────────────┐
│ ADMIN LOGIN                                              │
├──────────────────────────────────────────────────────────┤
│ Email:    admin@campuscurator.com                        │
│ Password: admin123                                       │
│ Role:     Administrator                                 │
│ Access:   All drives, mentor allotment, user management │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ MENTOR LOGIN                                             │
├──────────────────────────────────────────────────────────┤
│ Email:    john.smith@campuscurator.com                  │
│ Password: mentor123                                     │
│ Role:     Mentor (Department: Computer Science)        │
│ Access:   Assigned groups, reviews, evaluations        │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ STUDENT LOGIN                                            │
├──────────────────────────────────────────────────────────┤
│ Email:    alice.w@student.com                           │
│ Password: student123                                    │
│ Role:     Student (Batch: 2025, Department: CS)         │
│ Access:   Drives, groups, submissions                   │
└──────────────────────────────────────────────────────────┘
```

#### What Happens During Login:

```javascript
// Backend Flow: /backend/controllers/authController.js
1. Email & Password Validated
2. JWT Token Generated
3. Token Stored in localStorage (cc_token)
4. User Role Fetched

// Frontend Flow: /dashboard/src/app/auth/login/page.jsx
const handleRedirectByRole = async () => {
  const user = await api.get('/auth/me');
  
  if (user.role === 'mentor') {
    router.push('/mentor/dashboard');          // Mentor Dashboard
  } else if (user.role === 'admin') {
    router.push('/admin/dashboard');           // Admin Dashboard
  } else {
    router.push('/drives');                    // Student Drives Page
  }
};
```

**Test It:**
1. Go to http://localhost:3000/auth/login
2. Click "Show Demo Credentials"
3. Click "Use" button for any role
4. Auto-fills email/password, then click "Sign In"
5. ✅ Redirects to appropriate dashboard

---

### **STAGE 2: ADMIN DASHBOARD & DRIVE CREATION** 📋

#### What Admin Sees:

```
┌────────────────────────────────────────────────────────┐
│ ADMIN DASHBOARD                                        │
├────────────────────────────────────────────────────────┤
│                                                         │
│ Stats Cards:                                           │
│ ├─ Total Drives         [X]                           │
│ ├─ Active Drives        [Y]                           │
│ ├─ Total Groups         [Z]                           │
│ └─ Pending Evaluations  [W]                           │
│                                                         │
│ Buttons:                                               │
│ ├─ [+ New Drive]     → Navigate to /admin/drives/new  │
│ ├─ [View All Drives] → Navigate to /drives             │
│ └─ [Manage Drives]   → Edit existing drives            │
│                                                         │
└────────────────────────────────────────────────────────┘
```

#### Create a New Drive:

```
Step 1: Click "[+ New Drive]" button
        URL: http://localhost:3000/admin/drives/new

Step 2: Fill Drive Details
        ├─ Drive Name:         "Mini Project 2025 - Semester 6"
        ├─ Description:        "Final year mini project"
        ├─ Academic Year:      "2024-2025"
        ├─ Participating Batches: "2025"
        ├─ Min Group Size:     2
        ├─ Max Group Size:     4
        └─ Max Groups/Mentor:  6

Step 3: Select Participants
        ├─ Students from Batch 2025
        │  └─ Check: alice.w@student.com, bob.j@student.com
        │
        └─ Mentors from CS Department
           └─ Check: john.smith@campuscurator.com

Step 4: Click [Create Drive]
        Backend: POST /drives
        Response: Drive created with all configs

Step 5: ✅ Redirected to /drives
        New drive visible in list
```

#### Backend Logic (Drive Creation):

```javascript
// /backend/controllers/driveController.js
exports.createDrive = async (req, res) => {
  const {
    name,
    description,
    academicYear,
    participatingBatches,
    participatingStudents,
    mentors,
    maxGroupSize,
    minGroupSize,
    maxGroupsPerMentor
  } = req.body;

  // Create drive with all participants
  const drive = new Drive({
    name,
    description,
    academicYear,
    participatingBatches,
    participatingStudents,      // Array of student emails
    mentors,                    // Array of mentor emails
    maxGroupSize,
    minGroupSize,
    maxGroupsPerMentor,
    createdBy: req.user._id,
    status: 'active'
  });

  await drive.save();
  // ✅ Students & Mentors can now see this drive
};
```

**Test It:**
1. Login as admin@campuscurator.com
2. Click "New Drive" button
3. Fill all fields
4. Submit
5. ✅ See new drive in list

---

### **STAGE 3: STUDENT DASHBOARD - BROWSE DRIVES** 🎯

#### What Student Sees After Login:

```
Login Flow for Alice (Student):
┌─────────────────────────────────┐
│ 1. Login with:                  │
│    alice.w@student.com          │
│    student123                   │
│                                 │
│ 2. Backend returns:             │
│    {                            │
│      _id: "alice123",           │
│      name: "Alice W",           │
│      email: "alice.w@...",      │
│      role: "student",           │
│      batch: "2025"              │
│    }                            │
│                                 │
│ 3. Role Check: "student" ✓      │
│ 4. Redirect: /drives ✓          │
└─────────────────────────────────┘
```

#### Student Drives Page (/drives):

```
┌─────────────────────────────────────────────────────┐
│ PROJECT DRIVES                                      │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Filtered for: Batch 2025 students                 │
│                                                     │
│ Drive Card 1:                                       │
│ ┌──────────────────────────────────────────────┐  │
│ │ Mini Project 2025 - Semester 6 [ACTIVE]     │  │
│ │ Final year mini project evaluation           │  │
│ │ Academic Year: 2024-2025                     │  │
│ │ Status: Active (Enrollment Open)             │  │
│ │                                              │  │
│ │ [View Details] → /drives/[id]               │  │
│ └──────────────────────────────────────────────┘  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

#### Backend Filtering Logic:

```javascript
// /backend/controllers/driveController.js
exports.getDrives = async (req, res) => {
  // For Student: Filter by their batch OR direct participation
  if (req.user.role === 'student') {
    query = Drive.find({
      $or: [
        { participatingBatches: req.user.batch },      // Batch 2025
        { participatingStudents: req.user._id }        // Direct invite
      ],
      status: { $in: ['active', 'completed'] }
    });
  }
  
  const drives = await query.populate(...);
  return res.json({ data: drives });
};

// Alice sees drives where:
// ✅ participatingBatches includes "2025" (her batch)
// ✅ status is "active" or "completed"
```

**Test It:**
1. Login as alice.w@student.com
2. Land on /drives page
3. ✅ See all drives for batch 2025
4. Click on a drive to see details

---

### **STAGE 4: STUDENT GROUP CREATION** 👥

#### Drive Detail Page (/drives/[id]):

```
┌──────────────────────────────────────────────────┐
│ MINI PROJECT 2025 - SEMESTER 6                   │
├──────────────────────────────────────────────────┤
│ Description: Final year mini project             │
│ Status: Active                                   │
│ Min Group Size: 2 | Max: 4                       │
│                                                  │
│ Your Status: NOT IN A GROUP                      │
│                                                  │
│ Options:                                         │
│ ┌─────────────────────────────────────────────┐ │
│ │ [+ Create New Group]                        │ │
│ └─────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────┐ │
│ │ [Join Existing Group]                       │ │
│ │ (Shows available groups with codes)         │ │
│ └─────────────────────────────────────────────┘ │
│                                                  │
└──────────────────────────────────────────────────┘
```

#### Create Group Workflow:

```
Step 1: Click [+ Create New Group]

Step 2: Submit Form
        ├─ Group Name:        "Team Alpha"
        ├─ Group Description: "AI-powered Chatbot"
        └─ Drive ID:          (auto-filled)

Step 3: Backend Creates Group
        POST /groups
        Response:
        {
          _id: "group123",
          name: "Team Alpha",
          driveId: "drive456",
          createdBy: "alice123",           // Alice
          members: ["alice123"],            // Alice is creator
          status: "pending_mentor",
          invitationCode: "TA2025ABC",
          assignedMentor: null              // Pending admin allotment
        }

Step 4: ✅ Group Created
        - Alice becomes creator
        - Other students can join with code
        - Awaiting mentor allotment
```

#### Join Group Workflow (for Bob):

```
Step 1: Bob sees "Team Alpha" in available groups

Step 2: Click [Join Group]

Step 3: Enter Invitation Code: "TA2025ABC"

Step 4: Request sent to creator

Step 5: Alice sees request:
        ┌─────────────────────────────┐
        │ MEMBER REQUESTS             │
        │                             │
        │ Bob J requests to join      │
        │ [✓ Accept] [✗ Reject]       │
        └─────────────────────────────┘

Step 6: Alice accepts → Bob joins group ✅
        members: ["alice123", "bob456"]
```

**Test It:**
1. Login as alice.w@student.com
2. Click on a drive
3. Click "[+ Create New Group]"
4. Fill group details
5. Submit
6. ✅ Group created with you as creator

---

### **STAGE 5: MENTOR ALLOTMENT** 👨‍🏫

#### Admin Portal - Mentor Allotment:

```
Step 1: Admin Dashboard → Manage Drives

Step 2: Click [Allot Mentors] on a drive

Step 3: Admin sees:
        ┌────────────────────────────────────────┐
        │ MENTOR ALLOTMENT                       │
        ├────────────────────────────────────────┤
        │                                        │
        │ Available Groups (without mentor):     │
        │ ├─ Team Alpha (2 members)             │
        │ ├─ Team Beta  (3 members)             │
        │ └─ Team Gamma (4 members)             │
        │                                        │
        │ Available Mentors:                     │
        │ ├─ John Smith (0 groups assigned)     │
        │ ├─ Jane Doe   (1 group assigned)      │
        │ └─ Tom Hardy  (2 groups assigned)     │
        │                                        │
        │ [Auto Allot] [Manual Assign]          │
        └────────────────────────────────────────┘

Step 4A: Auto Allot
         System distributes groups evenly:
         ├─ Team Alpha  → John Smith (now has 1)
         ├─ Team Beta   → John Smith (now has 2)
         └─ Team Gamma  → Jane Doe   (now has 2)

Step 4B: Manual Assign
         Click group → Select mentor from dropdown
         ✅ Group assigned
```

#### Backend Allotment Logic:

```javascript
// /backend/controllers/groupController.js
exports.autoAllotMentors = async (req, res) => {
  const { driveId } = req.params;

  // Get all groups without mentor in this drive
  const groupsWithoutMentor = await Group.find({
    driveId,
    assignedMentor: null
  });

  // Get all mentors for this drive
  const drive = await Drive.findById(driveId);
  const mentors = await User.find({
    _id: { $in: drive.mentors }
  });

  let mentorGroupCount = {};
  mentors.forEach(m => mentorGroupCount[m._id] = 0);

  // Count existing assignments
  const existingAssignments = await Group.find({
    driveId,
    assignedMentor: { $ne: null }
  });
  existingAssignments.forEach(g => {
    mentorGroupCount[g.assignedMentor]++;
  });

  // Distribute remaining groups
  groupsWithoutMentor.forEach(group => {
    // Find mentor with minimum assignments
    const selectedMentor = Object.entries(mentorGroupCount)
      .sort(([,a], [,b]) => a - b)[0][0];
    
    group.assignedMentor = selectedMentor;
    mentorGroupCount[selectedMentor]++;
  });

  await Promise.all(groupsWithoutMentor.map(g => g.save()));
  return res.json({ success: true });
};
```

**Test It:**
1. Login as admin@campuscurator.com
2. Go to Admin Dashboard
3. Find drive with unassigned groups
4. Click [Allot Mentors]
5. Click [Auto Allot]
6. ✅ Mentors assigned to groups

---

### **STAGE 6: MENTOR DASHBOARD** 📊

#### What Mentor Sees:

```
Login as john.smith@campuscurator.com (Mentor)
URL: /mentor/dashboard

┌─────────────────────────────────────────────────┐
│ WELCOME, JOHN SMITH!                            │
│ Department: Computer Science                    │
├─────────────────────────────────────────────────┤
│                                                 │
│ Stats Cards:                                    │
│ ┌──────────────┐  ┌──────────────┐             │
│ │ Assigned     │  │ Pending      │             │
│ │ Groups: 2    │  │ Reviews: 1   │             │
│ └──────────────┘  └──────────────┘             │
│ ┌──────────────┐  ┌──────────────┐             │
│ │ Accepted     │  │ Evaluations  │             │
│ │ Files: 2     │  │ Pending: 2   │             │
│ └──────────────┘  └──────────────┘             │
│                                                 │
│ MY ASSIGNED GROUPS                              │
│ ┌──────────────────────────────────────────┐  │
│ │ Group: Team Alpha                        │  │
│ │ Members: Alice W, Bob J                  │  │
│ │ Status: Active (Awaiting Submissions)    │  │
│ │ [View Group] → /groups/team-alpha-id    │  │
│ └──────────────────────────────────────────┘  │
│                                                 │
│ PENDING SYNOPSIS REVIEWS                        │
│ ┌──────────────────────────────────────────┐  │
│ │ Team Alpha - AI Chatbot Project          │  │
│ │ Status: Under Review                     │  │
│ │ [Review] → /mentor/reviews               │  │
│ └──────────────────────────────────────────┘  │
│                                                 │
│ RECENT SUBMISSIONS                              │
│ (No Recent Submissions - Groups haven't       │
│  submitted files yet)                          │
│                                                 │
└─────────────────────────────────────────────────┘
```

#### Backend Mentor Dashboard Logic:

```javascript
// /dashboard/src/app/mentor/dashboard/page.jsx
const { data: assignedGroups } = useQuery({
  queryKey: ['mentorGroups'],
  queryFn: async () => {
    const groups = await api.get('/groups');
    // Filter groups where assignedMentor is current mentor
    return groups.filter(g => 
      g.assignedMentor?._id === user._id
    );
  }
});

// Mentor sees ONLY their assigned groups
// ✅ John Smith sees: Team Alpha, Team Beta
// ❌ John Smith does NOT see: Team Gamma (assigned to Jane)
```

**Test It:**
1. Login as john.smith@campuscurator.com
2. ✅ See mentor dashboard
3. See only your assigned groups
4. See pending synopsis reviews

---

### **STAGE 7: GROUP SUBMISSIONS** 📤

#### Student Submits Synopsis:

```
Alice logs in → Clicks on "Team Alpha" group
URL: /groups/team-alpha-id

┌──────────────────────────────────────────┐
│ TEAM ALPHA                               │
├──────────────────────────────────────────┤
│ Members: Alice W, Bob J                  │
│ Mentor: John Smith (Computer Science)    │
│ Drive: Mini Project 2025                 │
│                                          │
│ SUBMISSION SECTION                       │
│ ┌──────────────────────────────────────┐ │
│ │ SYNOPSIS (Pending)                   │ │
│ │                                      │ │
│ │ [Choose File] ... [Submit]           │ │
│ │                                      │ │
│ │ Current Submission:                  │ │
│ │ - File: project-synopsis.pdf         │ │
│ │ - Status: Pending Review             │ │
│ │ - Submitted: 2025-11-01              │ │
│ └──────────────────────────────────────┘ │
│                                          │
└──────────────────────────────────────────┘
```

#### Submission Workflow:

```
Step 1: Alice clicks [Choose File]
        Selects: project-synopsis.pdf

Step 2: Clicks [Submit]
        POST /submissions
        {
          groupId: "group123",
          submissionType: "synopsis",
          file: <file data>,
          submittedBy: "alice123",
          submittedAt: 2025-11-01
        }

Step 3: Backend stores submission
        ├─ File uploaded to storage
        ├─ DB entry created with status: "pending"
        └─ Notification sent to assigned mentor

Step 4: ✅ Submission shows status: "Pending Review"
```

**Test It:**
1. Login as alice.w@student.com
2. Go to your group
3. Upload a file for synopsis
4. ✅ Submission created with "Pending" status

---

### **STAGE 8: MENTOR REVIEW & FEEDBACK** ✅

#### Mentor Reviews Page:

```
John logs in → Clicks "Reviews" in navbar
URL: /mentor/reviews

┌────────────────────────────────────────────┐
│ PENDING SYNOPSIS REVIEWS                   │
├────────────────────────────────────────────┤
│                                            │
│ Review Item 1:                             │
│ ┌──────────────────────────────────────┐  │
│ │ Team Alpha - AI Chatbot              │  │
│ │                                      │  │
│ │ Submission Details:                  │  │
│ │ - Type: Synopsis                     │  │
│ │ - File: project-synopsis.pdf         │  │
│ │ - Submitted: 2025-11-01              │  │
│ │                                      │  │
│ │ [✓ Download File]                    │  │
│ │                                      │  │
│ │ Decision:                            │  │
│ │ ┌────────────────────────────────┐  │  │
│ │ │ ○ Accept  ○ Reject             │  │  │
│ │ └────────────────────────────────┘  │  │
│ │                                      │  │
│ │ Feedback:                            │  │
│ │ ┌────────────────────────────────┐  │  │
│ │ │ "Good project scope. Please    │  │  │
│ │ │  add more technical details."  │  │  │
│ │ └────────────────────────────────┘  │  │
│ │                                      │  │
│ │ [Submit Review]                      │  │
│ └──────────────────────────────────────┘  │
│                                            │
└────────────────────────────────────────────┘
```

#### Review Submission:

```
Step 1: John reads submission
        Downloads PDF for review

Step 2: John decides: ACCEPT
        Selects radio button: "Accept"

Step 3: John adds feedback:
        "Good project scope. Approved for next phase."

Step 4: John clicks [Submit Review]
        PUT /synopsis/[id]
        {
          status: "accepted",
          feedback: "Good project scope...",
          reviewedBy: "john-mentor-id",
          reviewedAt: 2025-11-02
        }

Step 5: ✅ Submission updated
        Status: "Accepted" (Green badge)
        Feedback visible to group
```

#### What Alice Sees After Review:

```
Alice logs into Team Alpha group
┌──────────────────────────────────────────┐
│ SYNOPSIS SUBMISSION                      │
│                                          │
│ File: project-synopsis.pdf               │
│ Status: ✅ ACCEPTED (Green)             │
│ Submitted: 2025-11-01                    │
│ Reviewed: 2025-11-02 by John Smith       │
│                                          │
│ Mentor Feedback:                         │
│ ✉️ "Good project scope. Approved for     │
│    next phase."                          │
│                                          │
└──────────────────────────────────────────┘
```

**Test It:**
1. Login as john.smith@campuscurator.com
2. Go to /mentor/reviews
3. Select a submission
4. Choose Accept/Reject
5. Add feedback
6. Submit
7. ✅ Status updates (visible to students)

---

### **STAGE 9: CHECKPOINT SUBMISSIONS** 📋

#### Student Submits Checkpoint:

```
Alice goes to Team Alpha group
Sees new section: CHECKPOINT 1

┌──────────────────────────────────────┐
│ CHECKPOINT 1 - Progress Submission    │
│                                      │
│ Due Date: 2025-11-15                 │
│ Description: Submit code & demo link │
│                                      │
│ Files to Submit:                     │
│ ├─ Source Code (.zip)               │
│ ├─ Demo Link                        │
│ └─ Progress Report                  │
│                                      │
│ [Upload Files] → [Submit]            │
│                                      │
│ Status: Not Submitted Yet             │
└──────────────────────────────────────┘
```

**Test It:**
1. Login as student
2. Go to group
3. Upload checkpoint files
4. ✅ Submissions tracked

---

### **STAGE 10: MENTOR EVALUATIONS** 📊

#### Mentor Evaluates Checkpoint:

```
John logs in → Clicks "Evaluations"
URL: /mentor/evaluations

┌────────────────────────────────────────┐
│ MY EVALUATIONS                         │
├────────────────────────────────────────┤
│                                        │
│ Team Alpha - Checkpoint 1 Evaluation   │
│ ┌──────────────────────────────────┐  │
│ │ Criteria:                        │  │
│ │ ├─ Code Quality    (1-10): [7]  │  │
│ │ ├─ Functionality   (1-10): [8]  │  │
│ │ ├─ Documentation   (1-10): [6]  │  │
│ │ ├─ Presentation    (1-10): [7]  │  │
│ │ ├─ Teamwork        (1-10): [8]  │  │
│ │ └─ Overall Rating  (1-10): [7]  │  │
│ │                                 │  │
│ │ Comments:                        │  │
│ │ ┌───────────────────────────────┐│  │
│ │ │ Good progress. Work on error  ││  │
│ │ │ handling and code comments.   ││  │
│ │ └───────────────────────────────┘│  │
│ │                                 │  │
│ │ [Submit Evaluation]              │  │
│ └──────────────────────────────────┘  │
│                                        │
└────────────────────────────────────────┘
```

#### Evaluation Stored:

```javascript
// /backend/models/Evaluation.js
{
  _id: "eval123",
  groupId: "group123",
  driveId: "drive456",
  evaluator: "john-mentor-id",
  checkpoint: 1,
  
  scores: {
    codeQuality: 7,
    functionality: 8,
    documentation: 6,
    presentation: 7,
    teamwork: 8
  },
  
  overallRating: 7,
  comments: "Good progress...",
  evaluatedAt: 2025-11-10
}
```

**Test It:**
1. Login as mentor
2. Go to /mentor/evaluations
3. Fill evaluation scores
4. Add comments
5. ✅ Evaluation saved

---

### **STAGE 11: RESULTS PUBLICATION** 🏆

#### Admin Publishes Results:

```
Admin Dashboard → Results Management
URL: /admin/results

┌────────────────────────────────────────┐
│ RESULTS MANAGEMENT                     │
├────────────────────────────────────────┤
│                                        │
│ Drive: Mini Project 2025               │
│ Status: ⏳ Pending                     │
│                                        │
│ All Groups Evaluated:                  │
│ ✅ Team Alpha        - Score: 75/100  │
│ ✅ Team Beta         - Score: 82/100  │
│ ✅ Team Gamma        - Score: 78/100  │
│                                        │
│ [Publish Results]                      │
│                                        │
└────────────────────────────────────────┘
```

#### Results Published:

```
Step 1: Admin clicks [Publish Results]

Step 2: System aggregates all evaluations
        Calculates final scores

Step 3: Status updates: Active → Completed

Step 4: Students can see final results:

Alice logs in → Group Details
┌────────────────────────────────────┐
│ TEAM ALPHA - FINAL RESULTS          │
│                                    │
│ Overall Score: 75/100              │
│ Grade: B                           │
│                                    │
│ Individual Scores:                 │
│ ├─ Code Quality: 70/100           │
│ ├─ Functionality: 80/100          │
│ ├─ Documentation: 60/100          │
│ ├─ Presentation: 75/100           │
│ └─ Teamwork: 85/100               │
│                                    │
│ Mentor Comments:                   │
│ "Excellent teamwork and execution" │
│                                    │
└────────────────────────────────────┘
```

**Test It:**
1. Login as admin
2. Go to Results Management
3. Click [Publish Results]
4. ✅ Students see final scores

---

## Complete User Roles & Permissions Matrix

```
┌─────────────────────────────────────────────────────────────────┐
│              FEATURE              │ Admin │ Mentor │ Student    │
├─────────────────────────────────────────────────────────────────┤
│ Create Drive                      │ ✅   │   ❌   │    ❌     │
│ Manage Participants               │ ✅   │   ❌   │    ❌     │
│ Allot Mentors to Groups           │ ✅   │   ❌   │    ❌     │
│ View All Groups                   │ ✅   │   ❌   │    ❌     │
│ View Assigned Groups              │ ❌   │  ✅   │    ❌     │
│ Review Submissions                │ ❌   │  ✅   │    ❌     │
│ Create Evaluation                 │ ❌   │  ✅   │    ❌     │
│ Create/Join Groups                │ ❌   │  ❌   │    ✅     │
│ Submit Synopsis/Checkpoints       │ ❌   │  ❌   │    ✅     │
│ View Group Results                │ ❌   │  ❌   │    ✅     │
│ Publish Final Results             │ ✅   │   ❌   │    ❌     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Key Data Flows

### 1. **Drive Creation Flow**
```
Admin → Create Drive Form
  ↓
Backend: POST /drives
  ↓
Database: Drive created with participants
  ↓
Frontend: /drives lists new drive
  ↓
✅ Students see drive (if in batch/participants)
```

### 2. **Group Creation Flow**
```
Student → Browse Drive → Create Group
  ↓
Backend: POST /groups
  ↓
Database: Group created (assignedMentor = null)
  ↓
Frontend: Show group with status "Pending Mentor"
  ↓
✅ Other students can join with code
```

### 3. **Mentor Allotment Flow**
```
Admin → Auto Allot Mentors
  ↓
Backend: Auto algorithm balances groups
  ↓
Database: Update groups with assignedMentor
  ↓
Frontend: Mentor dashboard shows new groups
  ↓
✅ Mentor sees assigned groups
```

### 4. **Submission & Review Flow**
```
Student → Upload File → Submit
  ↓
Backend: POST /submissions (status: pending)
  ↓
Mentor Dashboard: Shows pending submission
  ↓
Mentor → Accept/Reject + Feedback
  ↓
Backend: PUT /submissions (status: accepted/rejected)
  ↓
✅ Student sees status & feedback in group
```

### 5. **Evaluation & Results Flow**
```
Mentor → Evaluate Checkpoint
  ↓
Backend: POST /evaluations (scores + comments)
  ↓
Admin → Publish Results
  ↓
Backend: Aggregate all evaluations
  ↓
✅ Students see final scores & grades
```

---

## Testing Scenarios

### Scenario 1: Complete Drive Cycle
```
1. Login as admin@campuscurator.com
2. Create drive "Test Drive"
3. Logout

4. Login as alice.w@student.com
5. See new drive in /drives
6. Create "Team A"
7. Logout

8. Login as john.smith@campuscurator.com
9. Go to admin → allot mentors (manual)
10. Assign "Team A" to yourself
11. Logout

12. Login as alice.w@student.com
13. Upload synopsis
14. Logout

15. Login as john.smith@campuscurator.com
16. Review synopsis → Accept
17. Logout

18. Login as alice.w@student.com
19. See accepted status + feedback ✅
```

### Scenario 2: Multiple Students in Group
```
1. Alice creates "Team Alpha"
2. Bob joins with invitation code
3. Both can upload submissions
4. Mentor reviews all submissions
5. Both see feedback ✅
```

### Scenario 3: Role-Based Access
```
1. Student tries to access /admin/dashboard
   → Redirected to /drives ✅

2. Mentor tries to access /drives (student page)
   → Redirected to /mentor/dashboard ✅

3. Admin tries to access /mentor/dashboard
   → Redirected to /admin/dashboard ✅
```

---

## File Structure for Demo

```
/CampusCurator/
├── backend/
│   ├── controllers/
│   │   ├── authController.js        # Login/Auth logic
│   │   ├── driveController.js       # Drive CRUD
│   │   ├── groupController.js       # Group management
│   │   ├── googleAuthController.js # OAuth logic
│   │   └── ...
│   ├── models/
│   │   ├── User.js                  # User schema
│   │   ├── Drive.js                 # Drive schema
│   │   ├── Group.js                 # Group schema
│   │   ├── CheckpointSubmission.js
│   │   ├── Evaluation.js
│   │   └── Result.js
│   └── routes/
│       ├── auth.js
│       ├── drives.js
│       ├── groups.js
│       ├── checkpoints.js
│       ├── evaluations.js
│       └── results.js
│
├── dashboard/
│   ├── src/app/
│   │   ├── auth/login/page.jsx          # Login screen
│   │   ├── admin/
│   │   │   └── drives/new/page.jsx      # Create drive
│   │   ├── mentor/
│   │   │   ├── dashboard/page.jsx       # Mentor dashboard
│   │   │   ├── reviews/page.jsx         # Review submissions
│   │   │   └── evaluations/page.jsx     # Evaluations
│   │   ├── drives/
│   │   │   ├── page.jsx                 # Browse drives
│   │   │   └── [id]/page.jsx            # Drive details
│   │   ├── groups/
│   │   │   └── [id]/page.jsx            # Group details
│   │   └── students/
│   │       └── dashboard/page.jsx       # Student dashboard
│   ├── src/components/
│   │   ├── Header.jsx                   # Navigation
│   │   └── ProtectedRole.jsx            # Role protection
│   └── src/lib/
│       ├── auth.js                      # Auth helpers
│       ├── api.js                       # API client
│       └── useCurrentUser.js            # User hook
```

---

## Summary Checklist for Demo

- [ ] Backend running: `npm start` (in /backend)
- [ ] Frontend running: `npm run dev` (in /dashboard)
- [ ] Database seeded with demo users
- [ ] Test login as Admin, Mentor, Student
- [ ] Create drive as admin
- [ ] Browse drive as student
- [ ] Create group as student
- [ ] Allot mentor as admin
- [ ] View group as mentor
- [ ] Submit file as student
- [ ] Review submission as mentor
- [ ] Evaluate checkpoint as mentor
- [ ] Publish results as admin
- [ ] View results as student

✅ **All complete = Successful demonstration!**
