/**
 * Copyright 2018, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

// [START app]
const bodyParser = require('body-parser');
const express = require('express');
var cors = require('cors');
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use(cors());

// export Datasore library
const {Datastore} = require('@google-cloud/datastore');
const datastore = new Datastore();
// we will need this for testing
const fetch = require('node-fetch');

// local testing
// const BACKEND_URL = "http://localhost:8080/new-detection";
// GCP dev
const BACKEND_URL = "https://nodebackend-dot-august-clover-261601.appspot.com";

app.get('/', async (req, res) => {
  res.send('Hello world! I am alive!');
});

// Just testing
app.get('/new-detection', (req, res) => {
    res.send('You must be testing this path. It works!');
  });

//   Add new detections here
app.post('/new-detection', (req, res) => {
  console.log('Got body:', req.body);
  let body = req.body;
  body.timestamp = new Date();
  try {
    let txn = datastore.save({
      key: datastore.key('detections'),
      data: body,
    });
    console.log(txn);
  } catch (error) {
    console.log(error);
  }
    res.send('Thank you for adding a new detection!');
  });

//   Get all unique detected faces and return JSON object
app.get('/detections', async (req, res) => {
    const [detections] = await getDetections();
    res.send({"detected": detections});
  });

const getDetections = () => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate()-1);
    const query = datastore
      .createQuery('detections').filter('timestamp', '>', yesterday).filter('timestamp', '<=', today);
    return datastore.runQuery(query);
  };

// tests here
app.post('/new-test', (req, res) => {
  console.log('Got body:', req.body);
  let body = req.body;
  body.timestamp = new Date();
  try {
    let txn = datastore.save({
      key: datastore.key('test'),
      data: body,
    });
    console.log(txn);
  } catch (error) {
    console.log(error);
  }
  res.send('Thank you for adding a new test!');
});

const getTests = () => {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate()-1);
  const query = datastore
    .createQuery('test').filter('timestamp', '>', yesterday).filter('timestamp', '<=', today);
  return datastore.runQuery(query);
};

app.get('/tests', async (req, res) => {
  console.log("/tests");
  const [tests] = await getTests();
  const names = tests.map((testItem) => {
    return testItem.name;
  });
  let unique = [...new Set(names)];
  console.log(unique);

  res.send({"tests": unique});
});


function postData(url = '', data = {}) {
  // Default options are marked with *
  fetch(url, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json'
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: 'follow', // manual, *follow, error
    referrer: 'no-referrer', // no-referrer, *client
    body: JSON.stringify(data) // body data type must match "Content-Type" header
  });
}
// ends testing here

// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
// [END app]

module.exports = app;