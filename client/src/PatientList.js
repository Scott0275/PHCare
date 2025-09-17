import React, { useState, useEffect } from 'react';
import { get, del, put, post } from 'aws-amplify/api';

const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  // State for the edit modal
  const [editingPatient, setEditingPatient] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);


  // Effect for debouncing the search term to avoid excessive API calls
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // Wait 500ms after user stops typing before making the API call

    // Cleanup function to clear the timeout if the user types again
    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Effect for fetching data when the debounced search term changes
  useEffect(() => {
    const fetchPatients = async (query) => {
      try {
        setLoading(true);
        // If there's a search query, append it to the path.
        const path = query ? `/patients?q=${query}` : '/patients';
        const restOperation = get({
          apiName: 'patients',
          path: path
        });
        const { body } = await restOperation.response;
        const data = await body.json();
        setPatients(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching patients:", err);
        // Provide more specific feedback if possible
        setError(`Failed to fetch patients. Status: ${err.response?.statusCode || 'Unknown'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients(debouncedSearchTerm);
  }, [debouncedSearchTerm]); // Re-run when the debounced search term changes

  const handleDelete = async (patientId) => {
    if (window.confirm(`Are you sure you want to delete patient ${patientId}? This action cannot be undone.`)) {
      try {
        await del({
          apiName: 'patients',
          path: `/patients/${patientId}`
        }).response;
        setPatients(prevPatients => prevPatients.filter(p => p.PatientID !== patientId));
        alert('Patient deleted successfully.');
      } catch (err) {
        console.error('Error deleting patient:', err.response || err);
        const errorBody = await err.response?.body.json().catch(() => ({ error: "Could not parse error response." }));
        const errorMessage = errorBody?.error || `Request failed with status ${err.response?.statusCode || 'Unknown'}`;
        alert(`Failed to delete patient: ${errorMessage}`);
      }
    }
  };

  const handleEditClick = (patient) => {
    setEditingPatient(patient);
    setEditFormData({ FirstName: patient.FirstName, LastName: patient.LastName });
    setSelectedFile(null); // Reset file selection when opening modal
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await put({
        apiName: 'patients',
        path: `/patients/${editingPatient.PatientID}`,
        options: {
          body: editFormData
        }
      }).response;

      setPatients(prevPatients => prevPatients.map(p =>
        p.PatientID === editingPatient.PatientID ? { ...p, ...editFormData } : p
      ));

      alert('Patient updated successfully.');
      setEditingPatient(null);
    } catch (err) {
      console.error('Error updating patient:', err.response || err);
      const errorBody = await err.response?.body.json().catch(() => ({ error: "Could not parse error response." }));
      const errorMessage = errorBody?.error || `Request failed with status ${err.response?.statusCode || 'Unknown'}`;
      alert(`Failed to update patient: ${errorMessage}`);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file first.");
      return;
    }
    setIsUploading(true);
    try {
      // Step 1: Get a pre-signed URL from our API
      const presignedUrlResponse = await post({
        apiName: 'patients',
        path: `/patients/${editingPatient.PatientID}/documents`,
        options: {
          body: {
            fileName: selectedFile.name,
            fileType: selectedFile.type,
          },
        },
      }).response;
      const { uploadUrl, key } = await presignedUrlResponse.body.json();

      // Step 2: Upload the file directly to S3 using the pre-signed URL
      await fetch(uploadUrl, {
        method: 'PUT',
        body: selectedFile,
        headers: { 'Content-Type': selectedFile.type },
      });

      alert(`File uploaded successfully! S3 Key: ${key}`);
      setSelectedFile(null); // Reset file input
    } catch (err) {
      console.error("Error uploading file:", err.response || err);
      const errorBody = await err.response?.body.json().catch(() => ({ error: "Could not parse error response." }));
      const errorMessage = errorBody?.error || `Request failed with status ${err.response?.statusCode || 'Unknown'}`;
      alert(`File upload failed: ${errorMessage}`);
    } finally {
      setIsUploading(false);
    }
  };

  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div style={{ padding: "1rem", border: "1px solid #ccc", margin: "1rem 0" }}>
      <h2>Patient List</h2>
      <input
        type="text"
        placeholder="Search by first or last name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ marginBottom: '1rem', width: '300px', padding: '0.5rem' }}
      />
      {loading ? (
        <div>Loading...</div>
      ) : patients.length === 0 ? (
        <p>No patients found.</p>
      ) : (
        <ul>
          {patients.map((patient) => (
            <li key={patient.PatientID} style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>
                <strong>ID:</strong> {patient.PatientID} | <strong>Name:</strong> {patient.FirstName} {patient.LastName}
              </span>
              <span style={{ marginLeft: '1rem' }}>
                <button onClick={() => handleEditClick(patient)} style={{ marginRight: '0.5rem' }}>Edit</button>
                <button onClick={() => handleDelete(patient.PatientID)}>Delete</button>
              </span>
            </li>
          ))}
        </ul>
      )}

      {editingPatient && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.content}>
            <h2>Edit Patient: {editingPatient.PatientID}</h2>
            <form onSubmit={handleUpdate}>
              <div style={{ marginBottom: '1rem' }}><label style={{ marginRight: '0.5rem' }}>First Name:</label><input name="FirstName" value={editFormData.FirstName} onChange={handleEditFormChange} /></div>
              <div style={{ marginBottom: '1rem' }}><label style={{ marginRight: '0.5rem' }}>Last Name:</label><input name="LastName" value={editFormData.LastName} onChange={handleEditFormChange} /></div>
              <button type="submit" style={{ marginRight: '0.5rem' }}>Save Changes</button>
            </form>
            <hr style={{ margin: '1rem 0' }} />
            <h4>Upload EHR Document</h4>
            <div>
              <input type="file" onChange={handleFileChange} />
              <button onClick={handleFileUpload} disabled={!selectedFile || isUploading}>
                {isUploading ? 'Uploading...' : 'Upload to S3'}
              </button>
            </div>
            <hr style={{ margin: '1rem 0' }} />
            <button type="button" onClick={() => setEditingPatient(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

const modalStyles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000
  },
  content: {
    background: '#fff',
    padding: '2rem',
    borderRadius: '5px',
    color: '#000'
  }
};

export default PatientList;