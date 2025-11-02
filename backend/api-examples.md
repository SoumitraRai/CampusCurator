# API Examples for adding students and mentors

## 1. Bulk Create Students
curl -X POST http://localhost:5000/api/users/bulk/students \
  -H "Authorization: Bearer <admin_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "students": [
      {
        "name": "John Doe",
        "email": "john.doe@campus.edu",
        "batch": "2025",
        "department": "Computer Science",
        "registrationNumber": "CS2025010"
      },
      {
        "name": "Jane Smith", 
        "email": "jane.smith@campus.edu",
        "batch": "2025",
        "department": "Computer Science",
        "registrationNumber": "CS2025011"
      }
    ]
  }'

## 2. Bulk Create Mentors
curl -X POST http://localhost:5000/api/users/bulk/mentors \
  -H "Authorization: Bearer <admin_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "mentors": [
      {
        "name": "Prof. New Mentor",
        "email": "prof.new@campus.edu",
        "department": "Computer Science",
        "phone": "+91-9876543213"
      }
    ]
  }'

## 3. Add Users to Existing Drive
curl -X POST http://localhost:5000/api/users/drives/{driveId}/add-users \
  -H "Authorization: Bearer <admin_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "studentEmails": ["john.doe@campus.edu", "jane.smith@campus.edu"],
    "mentorEmails": ["prof.new@campus.edu"]
  }'

## 4. Get Students by Batch
curl -X GET http://localhost:5000/api/users/students/batch/2025 \
  -H "Authorization: Bearer <jwt_token>"

## 5. Get Mentors by Department
curl -X GET http://localhost:5000/api/users/mentors/department/Computer%20Science \
  -H "Authorization: Bearer <jwt_token>"
