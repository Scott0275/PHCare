# PHCare
 Internal Hospital App with AWS AMPLIFY

Perfect idea — a **README.md** will be the first thing people see in your repo, so let’s make it clear, professional, and also show your “build in public” journey.

Here’s a draft tailored to your **Day 1 progress with Create React App + Amplify**:

---

# 🚑 PHCare — Internal Hospital App (AWS Amplify Sprint)

This is my journey building **PHCare**, an internal hospital app, as part of a **3-Day AWS Amplify Sprint**.
The goal: explore modern cloud tooling, practice DevOps workflows, and ship a working prototype while documenting the process publicly.

---

## 📅 Project Sprint Plan

**Day 1 — Foundations & Authentication ✅**

* Initialize Amplify backend (`amplify init`)
* Add authentication (`amplify add auth`)
* Create Cognito groups: **Doctor** (full access), **Staff** (limited access)
* Frontend login flow with Amplify UI components
* Verified login with test users

**Day 2 — Data & Storage Layer (coming up)**

* DynamoDB for patients
* S3 for document storage
* React UI for patient records and file uploads

**Day 3 — API, Chat & Demo (coming up)**

* REST API via API Gateway + Lambda
* Real-time doctor–staff chat with WebSockets
* Search functionality
* Amplify Publish for demo

---

## 🚀 Day 1 Progress

Today’s focus: **Foundations & Authentication**.

1. **Amplify Init**

```bash
amplify init
```

2. **Add Authentication**

```bash
amplify add auth
amplify push
```

3. **Created Cognito Groups**

* Doctor → full CRUD access
* Staff → limited read/upload access

4. **Frontend Integration (Create React App)**
   Added Amplify config in `src/index.js`:

```javascript
import { Amplify } from 'aws-amplify';
import awsExports from './aws-exports';
Amplify.configure(awsExports);
```

Wrapped `App.js` with Amplify Authenticator:

```javascript
import { withAuthenticator } from '@aws-amplify/ui-react';

function App({ signOut, user }) {
  return (
    <div>
      <h1>Welcome to PHCare 🚑</h1>
      <p>Signed in as: {user.username}</p>
      <button onClick={signOut}>Sign out</button>
    </div>
  );
}

export default withAuthenticator(App);
```

Result:
✅ Doctor and Staff can now sign in at `http://localhost:3000/`.

---

## 📖 Lessons Learned

* AWS Profiles must be configured properly (`aws configure --profile amplify-dev`)
* Amplify + CRA integration is straightforward once `aws-exports.js` is wired in
* Cognito groups are powerful for role-based access without extra code

---

## 🌍 Build in Public

I’m documenting each day’s progress as blog-style posts and sharing on LinkedIn/X to keep myself accountable and help others learn.

Stay tuned for **Day 2 — Data & Storage Layer**!

---

## 🔗 Useful Links

* [Amplify Docs](https://docs.amplify.aws/)
* [Cognito Groups](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-user-groups.html)
* [DevOps Journey Blog (coming soon)](#)
