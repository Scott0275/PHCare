import React from 'react';
import { post } from 'aws-amplify/api';

function App() {
  const addPatient = async () => {
    try {
      const restOperation = post({
        apiName: 'patients',
        path: '/patients',
        options: {
          body: { PatientID: "123", FirstName: "John", LastName: "Doe" }
        }
      });
      const { body } = await restOperation.response;
      const data = await body.json();
      console.log("Patient added:", data);
      alert("Patient added successfully!");
    } catch (err) {
      console.error("Error adding patient:", err);
      alert("Failed to add patient — check console.");
    }
  };

  return (
    <div>
      <h1>PHCare App</h1>
      <button onClick={addPatient}>Add Patient</button>
    </div>
  );
}

export default App;
