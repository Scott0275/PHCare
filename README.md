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

## 🏥 Day 3 & Beyond: Full Application Build
- **Patient API:** Built a secure REST API for full patient CRUD, with role-based access enforced in the Lambda backend.
- **Patient UI:** Created a React frontend with forms and lists to add, view, search, edit, and delete patient records.
- **Real-Time Chat:** Implemented a doctor-staff chat feature using GraphQL Subscriptions for real-time messaging.
- **Secure Document Uploads:** Added functionality for doctors to upload patient EHR documents directly and securely to S3 using pre-signed URLs.
- **CI/CD:** Successfully set up a continuous deployment pipeline with Amplify Hosting.

---

## ✅ Project Status
- The core MVP is feature-complete and successfully deployed.
- All core features are live: patient CRUD, role-based security, real-time chat, and secure document uploads.
---

## 🚀 How to Run Locally

1. Clone repo:
   ```bash
   git clone https://github.com/Scott0275/PHCare.git
   cd PHCare
   ```

2. Install dependencies:

   ```bash
   cd client
   npm install
   ```

3. Start dev server:

   ```bash
   npm start
   ```

   App runs at `http://localhost:3000/`

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
