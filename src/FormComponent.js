import React, { useState, useEffect } from 'react';

function FormComponent() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [offlineData, setOfflineData] = useState([]);

  useEffect(() => {
    // Listen for online event to handle reconnection
    window.addEventListener('online', handleOnline);
    loadOfflineData(); // Load any offline data on component mount
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  const handleOnline = () => {
    console.log('You are online');
    // Try to send any offline data when back online
    const savedData = JSON.parse(localStorage.getItem('formData')) || [];
    if (savedData.length > 0) {
      sendDataToBackend(savedData);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = { name, email };
    if (navigator.onLine) {
      sendDataToBackend([formData]);
    } else {
      saveDataLocally(formData);
      alert('No internet connection. Data saved locally.');
    }
  };

  const saveDataLocally = (data) => {
    const currentData = JSON.parse(localStorage.getItem('formData')) || [];
    currentData.push(data);
    localStorage.setItem('formData', JSON.stringify(currentData));
    setOfflineData(currentData); // Update the state
  };

  const loadOfflineData = () => {
    const savedData = JSON.parse(localStorage.getItem('formData')) || [];
    setOfflineData(savedData);
  };

  const sendDataToBackend = (data) => {
    fetch('http://localhost:5000/api/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Success:', data);
        localStorage.removeItem('formData');
        setOfflineData([]);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>
          Name:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <br />
        <label>
          Email:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <br />
        <button type="submit">Submit</button>
      </form>
      {offlineData.length > 0 && (
        <p>There are {offlineData.length} unsent data records stored locally.</p>
      )}
    </div>
  );
}

export default FormComponent;
