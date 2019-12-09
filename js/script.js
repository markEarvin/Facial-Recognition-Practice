const imageUpload = document.getElementById('imageUpload');

 Promise.all([
    faceapi.nets.faceRecognitionNet.loadFromUri(''),
    faceapi.nets.faceLandmark68Net.loadFromUri(''),
    faceapi.nets.ssdMobilenetv1.loadFromUri('')
 ]).then(start);

 function start() {
     console.log("Start");
 }