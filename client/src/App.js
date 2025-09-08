import React from 'react';
import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

function App({ signOut, user }) {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Welcome to PHCare 🚑</h1>
      <p>Signed in as: {user.username}</p>
      <button onClick={signOut}>Sign out</button>
    </div>
  );
}

export default withAuthenticator(App);
