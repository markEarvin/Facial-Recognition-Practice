const video = document.getElementById('video');

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
    setInterval(async () => {
      const options = new faceapi.MtcnnOptions(mtcnnParams);
      const fullFaceDescriptions = await faceapi.detectAllFaces(video, options).withFaceLandmarks().withFaceDescriptors();
      const resizedDetections = faceapi.resizeResults(fullFaceDescriptions, displaySize);

      const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor));
      // console.log(results);
      // we need to clear our canvas each time we need to draw the recognition results
      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
      // then print the results in canvas
      results.forEach((result, i) => {
          const box = resizedDetections[i].detection.box;
          const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() });
          drawBox.draw(canvas);
      });
    }, 200);
  });
}

 function loadLabeledImages() {
    const gcsBucket = "lala_face_recognition_test";
    const labels = ['Ambo', 'Enteng', 'Earvin', 'Kenneth', 'Lala', 'MamaBear', 'Mommy', 'Obo', 'PapaBear'];
    return Promise.all(
      labels.map(async label => {
        const descriptions = [];
        const maxImages = 5;
        for (let i = 1; i <= maxImages; i++) {
          const img = await faceapi.fetchImage(`https://storage.googleapis.com/${gcsBucket}/${label}/${i}.png`);
          const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
          if (detections) descriptions.push(detections.descriptor);
        }
        return new faceapi.LabeledFaceDescriptors(label, descriptions);
      })
    );
  }