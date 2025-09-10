# 🚑 PHCare — Internal Hospital App (AWS Amplify Sprint)

This is my journey building **PHCare**, an internal hospital app, as part of a **3-Day AWS Amplify Sprint**.  
The goal: explore modern cloud tooling, practice DevOps workflows, and ship a working prototype while documenting the process publicly.  

---

## 📅 Project Sprint Plan

**Day 1 — Foundations & Authentication ✅**  
- Initialized Amplify backend (`amplify init`)  
- Added authentication (`amplify add auth`)  
- Created Cognito groups: **Doctor** (full access), **Staff** (limited access)  
- Frontend login flow with Amplify UI components  
- Verified login with test users  

**Day 2 — Data & Storage ✅**  
- Added DynamoDB table `patients` with `PatientID` as partition key  
- Added S3 bucket `ehrdocs` for patient documents  
- Applied role-based permissions:
  - Doctor → full CRUD on patients + docs  
  - Staff → limited read/upload  
- Deployed to **test environment** before syncing with dev  
- Confirmed DynamoDB + S3 live in AWS Console  

## 🏥 Day 3: Patient API Integration
- Added **REST API** via Amplify → API Gateway + Lambda.  
- Created endpoint `/patients` backed by **patientsLambda** function.  
- Connected Lambda to DynamoDB for patient CRUD operations.  
- Enforced role-based access:  
  - Doctor → **CRUD**  
  - Staff → **Read-only**  
- Fixed frontend API mismatch (`patient-api` → `patients`).  
- Successfully tested **Add Patient** flow from React frontend → API Gateway → Lambda → DynamoDB. 🎉  

---

## 🔮 Next Steps
- Test full CRUD (Read, Update, Delete) flows for patients.  
- Add **WebSocket API** for doctor–staff chat.  
- Connect frontend with **search functionality**.  
- Deploy demo app to Amplify Hosting.  
---

## 🚀 How to Run Locally

1. Clone repo:
   ```bash
   git clone https://github.com/Scott0275/PHCare.git
   cd PHCare
````

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start dev server:

   ```bash
   npm start
   ```

4. App runs at `http://localhost:3000/`

---

## 📖 Lessons So Far

* AWS Profiles are key (`aws configure --profile amplify-dev`)
* Amplify + Create React App integrate seamlessly with `aws-exports.js`
* Cognito groups give role-based access without extra backend logic
* **Data outlives code** → DynamoDB + S3 form the backbone of the app

---

## 🌍 Build in Public

I’m documenting each day’s progress as blog-style posts and sharing on LinkedIn/X to keep myself accountable and help others learn.

Stay tuned for **Day 3 — APIs + real-time chat!**

---

## 🔗 Useful Links

* [Amplify Docs](https://docs.amplify.aws/)
* [Cognito Groups](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-user-groups.html)
* [DynamoDB Basics](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html)
* [S3 Storage](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html)
