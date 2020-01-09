const video = document.getElementById('video');
const windowWidth = window.innerWidth;
const windowHeight = window.innerHeight;

// local testing
// const BACKEND_URL = "http://localhost:8080/new-detection";
// GCP dev
const BACKEND_URL = "https://nodebackend-dot-august-clover-261601.appspot.com";

if (windowWidth > windowHeight) {
  video.style.height = windowHeight - 40;
  video.style.width = windowWidth - 40;
}

Promise.all([
  faceapi.nets.mtcnn.loadFromUri('../models'),
  faceapi.nets.tinyFaceDetector.loadFromUri('../models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('../models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('../models'),
  faceapi.nets.faceExpressionNet.loadFromUri('../models'),
  faceapi.nets.ssdMobilenetv1.loadFromUri('../models')
]).then(startVideo);

function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    stream => video.srcObject = stream,
    err => console.error(err)
  );
  video.addEventListener('play', async () => {
    const labeledDescriptors = await loadLabeledImages();
    const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors);
    // configure mtcnn params
    const mtcnnParams = {
      // limiting the search space to larger faces for webcam detection, in pixels
      minFaceSize: 100
    };
  
    const canvas = faceapi.createCanvasFromMedia(video);
    document.body.append(canvas);
    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(canvas, displaySize);
    document.getElementById('loading').style.display = 'none';
    setInterval(async () => {
      const options = new faceapi.MtcnnOptions(mtcnnParams);
      const fullFaceDescriptions = await faceapi.detectAllFaces(video, options).withFaceLandmarks().withFaceDescriptors();
      const resizedDetections = faceapi.resizeResults(fullFaceDescriptions, displaySize);

      const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor));
      // console.log(results);
      sendDetections(results);
      // we need to clear our canvas each time we need to draw the recognition results
      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
      // then print the results in canvas
      results.forEach((result, i) => {
          const box = resizedDetections[i].detection.box;
          const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() });
          drawBox.draw(canvas);
      });
    }, 500);
  });
}

 function loadLabeledImages() {
    const gcsBucket = "lala_face_recognition_test";
    // CPS
    // const labels = [
    //   'Earvin - 11573647',
    //   'Bea - 11569979',
    //   'Eric - 11574654',
    //   'Grae - 60013199'
    // ];
    // these labels should be pulled from server and hashed
    // const labels = [
    //   'Earvin - 11573647',
    //   'Bea - 11569979',
    //   'Eric - 11574654',
    //   'Grae - 60013199',
    //   'Jarold S - 11572226',
    //   'Von P - 11574452',
    //   'Pitt D - 11570099',
    //   'Bianca D - 11575842',
    //   'JMac - 11570180', // 10
    //   'Shawn - 60080873',
    //   'Boss Don - 007',
    //   'Bench - 21690458',
    //   'Alain M - 11565117',
    //   'Aris - 11565720',
    //   'Zai - 60095195',
    //   'Sherdon - 21932674',
    //   'Sir Jen T - 75001890',
    //   'Jo Ma - 21869840',
    //   'Joever - 21552635', // 20
    //   'Aldin B - 11570078',
    //   'Alvert M - 11570112',
    //   'Maricanne D - 11570294',
    //   'Jonnel B - 11570803',
    //   'Lordwin S - 11565711',
    //   'Mark Roger - 11566097',
    //   'Shiela May B - 60121717',
    //   'Michi - 11570893',
    //   'Kenneth Y - 11570084',
    //   'Peter James - 11570549'
    // ];
    const labels = [
      'Earvin - 11573647'
    ];
    return Promise.all(
      labels.map(async label => {
        const descriptions = [];
        const maxImages = 3;
        const labelDigest = await digestMessage(label);
        for (let i = 1; i <= maxImages; i++) {
          try {
            // we should be taking the hash digest of the label and set as path of the gcs object
            const img = await faceapi.fetchImage(`https://storage.googleapis.com/${gcsBucket}/${labelDigest}/${i}.png`);
            const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
            if (detections) descriptions.push(detections.descriptor);
          } catch (error) {
            console.error(error);
          }
        }
        return new faceapi.LabeledFaceDescriptors(label, descriptions);
      })
    );
  }

  function sendDetections(detections) {
    detections.forEach((detection, i) => {
      console.log(detection);
      try {
        if (detection.label != "unknown") {
          const details = detection.label.split(" - ");
          console.log(details);
          postData(BACKEND_URL + "/new-detection",
            { 
              name: details[0],
              eid: details[1]
            });
        }
      } catch (error) {
        console.error(error);
      }
    });
  }

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

// const text = 'An obscure body in the S-K System, your majesty. The inhabitants refer to it as the planet Earth.';

  async function digestMessage(message) {
    const msgUint8 = new TextEncoder().encode(message);                           // encode as (utf-8) Uint8Array
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);           // hash the message
    const hashArray = Array.from(new Uint8Array(hashBuffer));                     // convert buffer to byte array
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join(''); // convert bytes to hex string
    return hashHex;
  }


  async function testDigest() {
    const text = 'An obscure body in the S-K System, your majesty. The inhabitants refer to it as the planet Earth.';
    const digestBuffer = await digestMessage(text);
    console.log(digestBuffer);
    console.log(digestBuffer.byteLength);
  }

  // testDigest();