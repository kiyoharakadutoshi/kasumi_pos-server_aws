import React, { useState } from 'react';
import './batch-control.scss';
import axios from 'axios';
import { Button } from 'reactstrap';

const getStartTime = () => {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  const day = currentDate.getDate();
  const hours = currentDate.getHours();
  const minutes = currentDate.getMinutes();
  const seconds = currentDate.getSeconds();
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};

const BatchControl = () => {
  const url = SERVER_BATCH_API_URL;
  const [startTime, setStartTime] = useState('none');
  const [file, setFile] = useState(null);
  const [loadFileSuccess, setLoadFileSuccess] = useState('none');
  const sendRunJobRequest = () => {
    axios.post(`${url}/run-job`)
      .then(response => {
        console.log('Success:', response.data);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (file) {
        const formData = new FormData();
        formData.append('file', file);
    
        try {
          await axios.post(`${url}/upload-file`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          setLoadFileSuccess('File upload success!');
        } catch (error) {
          setLoadFileSuccess('File upload error!');
        }
      } else {
        alert('Please choose file!');
      }
  };

  return (
    <div className="batch">
      <div className="row">
        <div className="col">
          <input
            type='file'
            onChange={(event)=>{handleFileChange(event)}}
          />
        </div>
      </div>
      <div className="row">
        <div className="col">
          <Button onClick={handleUpload}>Upload file</Button>
        </div>
        <div className="col">
          <p>File upload status: {loadFileSuccess}</p>
        </div>
      </div>
      <div className="row">
        <div className="col">
          <Button
            onClick={() => {
              setStartTime(getStartTime());
              sendRunJobRequest();
            }}
          >
            Run job batch
          </Button>
        </div>
        <div className="col">
          <p>Start Time: {startTime}</p>
        </div>
      </div>
    </div>
  );
};

export default BatchControl;
