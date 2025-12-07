# CampusCurator - Workflow Guide

## Complete Project Drive Workflow

This document provides a detailed workflow guide for using CampusCurator from start to finish.

---

## Workflow Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CAMPUSCURATOR WORKFLOW                          │
└─────────────────────────────────────────────────────────────────────────┘

    ADMIN                    STUDENTS                    MENTORS
      │                         │                          │
      ▼                         │                          │
┌──────────────┐                │                          │
│ 1. Create    │                │                          │
│    Drive     │                │                          │
└──────┬───────┘                │                          │
       │                        │                          │
       │ Drive Active           │                          │
       ├────────────────────────┼──────────────────────────┤
       │                        ▼                          │
       │                  ┌──────────────┐                 │
       │                  │ 2. Form      │                 │
       │                  │    Groups    │                 │
       │                  └──────┬───────┘                 │
       │                         │                         │
       │                         │ Groups Formed           │
       ├─────────────────────────┼─────────────────────────┤
       ▼                         │                         │
┌──────────────┐                 │                         │
│ 3. Assign    │                 │                         │
│    Mentors   │                 │                         │
└──────┬───────┘                 │                         │
       │                         │                         │
       │ Mentors Assigned        │                         │
       ├─────────────────────────┼─────────────────────────┤
       │                         ▼                         ▼
       │                  ┌──────────────┐         ┌──────────────┐
       │                  │ 4. Submit    │────────>│ 4. Review    │
       │                  │    Synopsis  │         │    Synopsis  │
       │                  └──────┬───────┘         └──────┬───────┘
       │                         │                         │
       │                         │ Synopsis Approved       │
       ├─────────────────────────┼─────────────────────────┤
       │                         ▼                         ▼
       │                  ┌──────────────┐         ┌──────────────┐
       │                  │ 5. Submit    │────────>│ 5. Evaluate  │
       │                  │  Checkpoints │         │  Checkpoints │
       │                  └──────┬───────┘         └──────┬───────┘
       │                         │                         │
       │                         │ All Evaluations Done    │
       ├─────────────────────────┼─────────────────────────┤
       ▼                         │                         │
┌──────────────┐                 │                         │
│ 6. Publish   │                 │                         │
│    Results   │                 │                         │
└──────┬───────┘                 │                         │
       │                         │                         │
       │ Results Published       │                         │
       ├─────────────────────────┤                         │
       │                         ▼                         │
       │                  ┌──────────────┐                 │
       │                  │ 7. View      │                 │
       │                  │    Results   │                 │
       │                  └──────────────┘                 │
       │                                                   │
       ▼                                                   ▼
   Drive Completed                                  Mentorship Done
```

---

## Detailed Stage-by-Stage Guide

### Stage 1: Drive Creation (Admin Only)

**Purpose:** Set up a new project drive with all necessary configurations

**Steps:**
1. Login as Admin
2. Navigate to "Create Drive"
3. Fill in drive details:
   - **Name:** e.g., "B.Tech Final Year Project 2024-25"
   - **Description:** Drive objectives and guidelines
   - **Academic Year:** e.g., "2024-25"
   - **Participating Batches:** Select batches (e.g., "2025", "2024")

4. Configure group settings:
   - **Min Group Size:** Usually 1 (for individual projects)
   - **Max Group Size:** Usually 4
   - **Max Groups per Mentor:** Usually 6

5. Add participants:
   - **Add Student Emails:** Students who can participate
   - **Add Mentor Emails:** Available mentors for this drive

6. Configure stages and deadlines:
   - **Group Formation:** Start date and deadline
   - **Mentor Allotment:** Deadline
   - **Synopsis Submission:** Deadline
   - **Checkpoints:** Add multiple (e.g., Mid-Sem, End-Sem)
     - Name, Deadline, Max Marks for each
   - **Result Declaration:** Target date

7. Review and Create Drive

**Business Rules Applied:**
- Drive status set to "draft" initially
- Admin can activate when ready
- All participating students must exist in system
- All mentors must have "mentor" role

**Output:**
- Drive created with unique ID
- Students can now see drive in their dashboard
- Group formation can begin

---

### Stage 2: Group Formation (Students)

**Purpose:** Students form project groups for the drive

#### Option A: Create New Group (Group Leader)

**Steps:**
1. Login as Student
2. Navigate to "Active Drives"
3. Select the drive you want to join
4. Click "Create Group"
5. Fill in group details:
   - **Group Name:** e.g., "AI Research Team"
   - **Max Members:** Select (must be ≤ drive's max)
   - **Mentor Preferences:** Rank mentors (1st choice, 2nd choice, etc.)

6. Submit group creation
7. **Receive Invitation Code** (e.g., "A7B3C9D1")
8. Share code with team members

**Output:**
- Group created with status "forming"
- Leader automatically added as member
- Unique invitation code generated
- Other students can join using this code

#### Option B: Join Existing Group (Group Member)

**Steps:**
1. Login as Student
2. Navigate to "Join Group"
3. Enter invitation code received from leader
4. Click "Join Group"
5. Wait for acceptance (if required)

**Output:**
- Student added to group with status "pending" or "accepted"
- Leader notified of join request
- Student can now see group details

**Business Rules Applied:**
- Student can join only ONE drive at a time
- Group size cannot exceed max limit
- Once group formation deadline passes, groups are locked
- Students cannot leave without admin intervention

---

### Stage 3: Mentor Allotment (Admin)

**Purpose:** Assign mentors to groups based on preferences and capacity

#### Option A: Manual Assignment

**Steps:**
1. Login as Admin
2. Navigate to "Drive Management" → Select Drive
3. View all formed groups
4. For each group:
   - View group details (members, preferences)
   - Select mentor from dropdown
   - Click "Assign Mentor"

**Output:**
- Mentor assigned to group
- Group status updated to "mentor-assigned"
- Mentor can now see group in their dashboard

#### Option B: Automatic Assignment

**Steps:**
1. Login as Admin
2. Navigate to "Drive Management" → Select Drive
3. Click "Auto-Assign Mentors"
4. Review proposed assignments
5. Confirm automatic assignment

**Algorithm Logic:**
- Respects group mentor preferences
- Balances workload (groups per mentor)
- Ensures no mentor exceeds capacity
- All groups assigned if possible

**Output:**
- All groups assigned mentors automatically
- Admin can manually override if needed
- Mentor assignment notifications sent

**Business Rules Applied:**
- Each group gets exactly one mentor
- Mentors cannot exceed max capacity (e.g., 6 groups)
- Only mentors in the drive's mentor list can be assigned
- Cannot proceed to synopsis without mentor

---

### Stage 4: Synopsis Submission & Review

#### Part A: Synopsis Submission (Students)

**Purpose:** Groups submit project proposal for mentor approval

**Steps:**
1. Login as Student (any group member can submit)
2. Navigate to "My Group" → "Submit Synopsis"
3. Fill in synopsis form:
   - **Project Title:** e.g., "Machine Learning Based Traffic Prediction"
   - **Abstract:** Brief overview (200-300 words)
   - **Objectives:** What the project aims to achieve
   - **Methodology:** How you'll approach the problem
   - **Expected Outcome:** What you expect to deliver
   - **Technologies:** List of tools/frameworks (e.g., Python, TensorFlow)
   - **Upload Documents:** Optional supporting PDFs

4. Submit for review

**Output:**
- Synopsis created with status "submitted"
- Mentor notified of new submission
- Students can view submitted synopsis
- Version tracked for revisions

#### Part B: Synopsis Review (Mentor)

**Purpose:** Review and approve/reject group synopsis

**Steps:**
1. Login as Mentor
2. Navigate to "My Groups" → Select Group
3. Click "Review Synopsis"
4. Read synopsis details and documents
5. Provide decision:
   - **Approve:** Synopsis is good to proceed
   - **Request Revision:** Provide detailed feedback
   - **Reject:** Project not suitable (provide reasons)

6. Enter feedback comments
7. Submit review

**Output:**
- Synopsis status updated (approved/rejected/revision-requested)
- Students notified of decision
- If revision requested, students can resubmit
- If approved, group can proceed to checkpoints

**Business Rules Applied:**
- Only assigned mentor can review
- Feedback mandatory for rejection/revision
- Version history maintained
- Cannot proceed to evaluations without approval

---

### Stage 5: Checkpoint Submissions & Evaluations

**Purpose:** Track progress and evaluate at key milestones

#### Part A: Checkpoint Submission (Students)

**Steps:**
1. Login as Student
2. Navigate to "Submissions"
3. Select checkpoint (e.g., "Mid-Sem Evaluation")
4. Upload deliverables:
   - **Progress Report:** PDF document
   - **Code/Artifacts:** Zip file or link
   - **Presentation:** PPT/PDF if required
   - **Comments:** Any notes for mentor

5. Submit before deadline

**Output:**
- Submission recorded with timestamp
- Mentor notified
- Files stored securely
- Submission visible to mentor for evaluation

#### Part B: Checkpoint Evaluation (Mentor)

**Steps:**
1. Login as Mentor
2. Navigate to "Evaluations"
3. Select group and checkpoint
4. Review submission files and comments
5. Evaluate based on criteria:
   - **Multiple Criteria:** Each with max score
   - **Individual Scores:** Score for each criterion
   - **Remarks:** Specific feedback per criterion

6. Provide overall feedback:
   - **Total Marks:** Auto-calculated
   - **Percentage:** Auto-calculated
   - **Grade:** Auto-assigned (A+ to F)
   - **Overall Feedback:** General comments
   - **Strengths:** What the group did well
   - **Improvements:** Areas to work on

7. Mark as "Finalized" to make visible to students

**Output:**
- Evaluation saved with all scores
- Grade automatically calculated
- Percentage computed
- Students can view after finalization
- Contributes to final result

**Business Rules Applied:**
- Only assigned mentor can evaluate
- Scores cannot exceed max marks
- All evaluations must be finalized before result declaration
- Late submissions handled based on drive settings

---

### Stage 6: Result Declaration (Admin)

**Purpose:** Consolidate all evaluations and publish final results

**Steps:**
1. Login as Admin
2. Navigate to "Results" → Select Drive
3. Review consolidated results for all groups:
   - **Component-wise Marks:**
     - Logbook Marks
     - Synopsis Marks
     - Report Marks
     - PPT Marks
     - Mid-Sem Marks
     - End-Sem Marks
   - **Checkpoint Scores:** From evaluations
   - **Total Marks:** Auto-calculated
   - **Final Grade:** Auto-assigned
   - **Result:** Pass/Fail/Distinction

4. Review and adjust if needed
5. Add remarks (optional)
6. Click "Publish Results"

**Output:**
- Results status changed to "published"
- All students can view their results
- Final grades and remarks visible
- Result reports generated

**Calculation Logic:**
```javascript
Final Marks = Logbook + Synopsis + Report + PPT + Mid-Sem + End-Sem

Percentage = (Final Marks / Total Max Marks) × 100

Grade Assignment:
- A+: ≥ 90%
- A:  ≥ 80%
- B+: ≥ 70%
- B:  ≥ 60%
- C+: ≥ 50%
- C:  ≥ 40%
- D:  ≥ 35%
- F:  < 35%

Result:
- Distinction: ≥ 75%
- Pass: ≥ 40%
- Fail: < 40%
```

---

### Stage 7: View Results (Students)

**Purpose:** Students view their final evaluation and grades

**Steps:**
1. Login as Student
2. Navigate to "My Results"
3. Select drive
4. View result details:
   - Component-wise marks
   - Checkpoint-wise scores
   - Total marks and percentage
   - Final grade
   - Pass/Fail/Distinction status
   - Mentor remarks

**Output:**
- Complete result breakdown
- Historical record maintained
- Can be exported/printed

---

## User Journey Examples

### Example 1: Student Journey (Success Path)

```
Day 1:  Admin creates "Final Year Project 2024-25" drive
        ↓
Day 2:  Sarah (student) logs in, sees new drive available
        ↓
Day 3:  Sarah creates group "AI Innovators" (gets code: ABC123DE)
        ↓
Day 4:  Sarah shares code with teammates John and Mike
        ↓
Day 5:  John and Mike join using ABC123DE
        ↓
Day 10: Admin assigns Dr. Smith as mentor to Sarah's group
        ↓
Day 15: Sarah submits synopsis "AI-Based Healthcare Diagnosis"
        ↓
Day 17: Dr. Smith reviews and approves synopsis
        ↓
Day 30: Group submits mid-sem evaluation (code + report)
        ↓
Day 35: Dr. Smith evaluates: 85/100 (Grade A)
        ↓
Day 60: Group submits end-sem evaluation (final product + docs)
        ↓
Day 65: Dr. Smith evaluates: 90/100 (Grade A+)
        ↓
Day 70: Admin publishes results
        ↓
Day 70: Sarah sees final result: 87.5% - Distinction - Grade A
```

### Example 2: Mentor Journey

```
Day 1:  Admin creates drive, adds Dr. Johnson as available mentor
        ↓
Day 10: Dr. Johnson assigned to 5 groups (within capacity of 6)
        ↓
Day 15: Receives 5 synopsis submissions to review
        ↓
Day 16-20: Reviews all synopses:
            - Approves 3
            - Requests revision on 2
        ↓
Day 25: Reviews revised synopses, approves both
        ↓
Day 30-40: Receives 5 mid-sem submissions
        ↓
Day 40-45: Evaluates all mid-sem checkpoints with detailed feedback
        ↓
Day 60-70: Receives 5 end-sem submissions
        ↓
Day 70-75: Evaluates all end-sem checkpoints
        ↓
Day 75: All evaluations complete, notifications sent to students
        ↓
Day 80: Admin publishes results, mentorship cycle complete
```

### Example 3: Admin Journey

```
Day 0:  Plan new project drive for upcoming semester
        ↓
Day 1:  Create drive with all configurations
        - Set deadlines
        - Add 50 students (emails)
        - Add 10 mentors (emails)
        - Configure 2 checkpoints (Mid + End)
        ↓
Day 2:  Activate drive (status: draft → active)
        ↓
Day 7:  Monitor group formation (15 groups formed)
        ↓
Day 10: Run automatic mentor allocation
        - Review assignments
        - Manually adjust 2 groups based on expertise
        ↓
Day 15-30: Monitor synopsis submissions and approvals
        ↓
Day 30-70: Monitor checkpoint submissions and evaluations
        - Send reminders to mentors for pending evaluations
        ↓
Day 75: All evaluations complete
        - Review consolidated results
        - Verify calculations
        - Add remarks for exceptional cases
        ↓
Day 80: Publish results to all students
        ↓
Day 85: Export result reports for records
        ↓
Day 90: Archive drive (status: completed → archived)
```

---

## Common Workflows & Scenarios

### Scenario 1: Late Group Formation
**Situation:** Student misses group formation deadline

**Solution:**
1. Student contacts admin
2. Admin can:
   - Extend deadline for specific student
   - Manually add student to existing group
   - Create exception for late formation

### Scenario 2: Mentor Change Request
**Situation:** Group wants to change assigned mentor

**Process:**
1. Group submits request to admin (with reason)
2. Admin reviews:
   - Checks mentor capacity
   - Considers group preferences
   - Ensures fair distribution
3. Admin manually reassigns if justified
4. Both mentors notified of change

### Scenario 3: Synopsis Revision Cycle
**Situation:** Synopsis needs multiple revisions

**Process:**
```
Submission v1 → Mentor reviews → Revision requested
        ↓
Group revises → Resubmits v2 → Mentor reviews → Revision requested
        ↓
Group revises → Resubmits v3 → Mentor reviews → Approved
```
- All versions tracked
- Feedback history maintained
- Final version used for record

### Scenario 4: Group Member Inactive
**Situation:** One member not contributing

**Options:**
1. **Group handles internally:** Leader coordinates
2. **Mentor intervention:** Mentor counsels member
3. **Admin intervention:** 
   - Remove member if justified
   - Adjust group size
   - Document reason

### Scenario 5: Late Submission with Permission
**Situation:** Group has valid reason for late submission

**Process:**
1. Group requests extension from admin
2. Admin reviews reason (medical, emergency, etc.)
3. If approved:
   - Drive setting: allowLateSubmissions = true
   - Specific group granted extension
4. Mentor evaluates when submitted
5. Marked as "late" in records

---

## Best Practices

### For Students
1. **Form groups early** in the deadline window
2. **Communicate regularly** with team members
3. **Set internal deadlines** before actual deadlines
4. **Review feedback carefully** from mentors
5. **Keep backups** of all submissions
6. **Track progress** through dashboard

### For Mentors
1. **Review submissions promptly** to give students time for revisions
2. **Provide constructive feedback** in evaluations
3. **Be consistent** in grading criteria
4. **Maintain regular contact** with groups
5. **Update evaluations** in system timely
6. **Use feedback fields** to guide improvement

### For Admins
1. **Plan drive well in advance** with realistic deadlines
2. **Communicate clearly** about expectations and timelines
3. **Monitor progress** at each stage
4. **Send reminders** for pending actions
5. **Review assignments** before finalizing
6. **Keep backup** of results before publishing
7. **Archive completed drives** for historical records

---

## Troubleshooting Guide

### Issue: Student Can't Join Any Drive
**Cause:** Already part of another drive
**Solution:** Check all drives, if needed admin can remove from old drive

### Issue: Invitation Code Not Working
**Cause:** Code might be case-sensitive or expired
**Solution:** Check exact code with leader, ensure group not full/locked

### Issue: Mentor Not Seeing Group
**Cause:** Assignment might not be saved properly
**Solution:** Admin re-assigns mentor, refresh dashboard

### Issue: Evaluation Not Visible to Students
**Cause:** Mentor hasn't finalized evaluation
**Solution:** Mentor must mark evaluation as "finalized"

### Issue: Result Calculation Wrong
**Cause:** Missing checkpoint data or configuration issue
**Solution:** Admin reviews component marks, recalculates if needed

---

## API Integration Guide

For developers building on CampusCurator, here are key API endpoints:

### Authentication
```
POST /api/auth/register - Register user
POST /api/auth/login    - Login
GET  /api/auth/me       - Get current user
```

### Drives
```
POST   /api/drives              - Create drive (admin)
GET    /api/drives              - List drives
GET    /api/drives/:id          - Get drive details
PUT    /api/drives/:id/stage    - Update stage (admin)
```

### Groups
```
POST   /api/groups              - Create group
POST   /api/groups/join         - Join with code
GET    /api/groups/:id          - Get group details
PUT    /api/groups/:id/mentor   - Assign mentor (admin)
```

### Synopsis
```
POST   /api/synopsis            - Submit synopsis
GET    /api/synopsis/:id        - Get synopsis
PUT    /api/synopsis/:id/review - Review synopsis (mentor)
```

### Evaluations
```
POST   /api/evaluations         - Create evaluation (mentor)
GET    /api/evaluations/:id     - Get evaluation
PUT    /api/evaluations/:id     - Update evaluation
```

### Results
```
GET    /api/results/:driveId    - Get drive results (admin)
POST   /api/results/publish     - Publish results (admin)
GET    /api/results/my-results  - Get student's results
```

---

## Notifications & Communication

### Automated Notifications (Planned)

1. **Email Notifications:**
   - Group formation confirmation
   - Mentor assignment notification
   - Synopsis review status
   - Evaluation feedback available
   - Results published

2. **In-App Notifications:**
   - Pending submissions
   - Approaching deadlines
   - New feedback from mentor
   - Stage transitions

3. **Dashboard Alerts:**
   - Overdue submissions
   - Pending reviews (mentors)
   - Groups without mentors (admin)

---

## Data Privacy & Security

### Student Data Protection
- Personal information encrypted
- Role-based access control
- Passwords hashed with bcrypt
- JWT tokens for session management

### File Security
- File size limits enforced
- File type validation
- Secure upload storage
- Access controlled by roles

### Audit Trail
- All major actions logged
- Timestamps on all records
- Version control for submissions
- Change history maintained

---

*Document Version: 1.0*
*Last Updated: 2025-12-07*
*For: CampusCurator Platform Users and Developers*
