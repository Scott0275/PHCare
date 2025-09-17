import React, { useState } from 'react';
import { post } from 'aws-amplify/api';
import { withAuthenticator } from "@aws-amplify/ui-react";
import Chat from "./Chat";
import PatientList from './PatientList';
function App({ signOut, user }) {
  // State for the form inputs
  const [patientData, setPatientData] = useState({
    PatientID: '',
    FirstName: '',
    LastName: '',
    // Add other fields as necessary
  });

  // Handler for input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPatientData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  // Handler for form submission
  const handleAddPatient = async (e) => {
    e.preventDefault();
    try {
      if (!patientData.PatientID || !patientData.FirstName || !patientData.LastName) {
        alert("Please fill in all fields.");
        return;
      }
      const restOperation = post({
        apiName: 'patients',
        path: '/patients',
        options: {
          body: patientData
        }
      });
      const { body } = await restOperation.response;
      const data = await body.json();
      console.log("Patient added:", data);
      alert("Patient added successfully!");
      // Reset form after successful submission
      setPatientData({ PatientID: '', FirstName: '', LastName: '' });
    } catch (err) {
      console.error("Error adding patient:", err);
      let errorMessage = "An unknown error occurred.";
      if (err.response) {
        const errorBody = await err.response.body.json();
        errorMessage = errorBody.error || `Request failed with status ${err.response.statusCode}`;
      } else if (err.message) {
        errorMessage = err.message;
      }
      alert(`Failed to add patient: ${errorMessage}`);
    }
  };

  return (
    <div>
      <h1>PHCare</h1>
      <p>Welcome, {user.username}!</p>
      <button onClick={signOut}>Sign out</button>
      <hr />

      {/* Add Patient Form */}
      <div style={{ padding: "1rem", border: "1px solid #ccc", margin: "1rem 0" }}>
        <h2>Add New Patient</h2>
        <form onSubmit={handleAddPatient}>
          <div style={{ marginBottom: '0.5rem' }}>
            <input name="PatientID" value={patientData.PatientID} onChange={handleInputChange} placeholder="Patient ID" style={{ marginRight: '0.5rem' }} />
            <input name="FirstName" value={patientData.FirstName} onChange={handleInputChange} placeholder="First Name" style={{ marginRight: '0.5rem' }} />
            <input name="LastName" value={patientData.LastName} onChange={handleInputChange} placeholder="Last Name" />
          </div>
          <button type="submit">Add Patient</button>
        </form>
      </div>

      <hr />
      <PatientList />

      <hr />
      <Chat user={user} />
    </div>
  );
}

export default withAuthenticator(App);
