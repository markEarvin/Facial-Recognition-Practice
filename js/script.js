const imageUpload = document.getElementById('imageUpload');

 Promise.all([
    faceapi.nets.faceRecognitionNet.loadFromUri('../models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('../models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('../models')
 ]).then(start);

 function start() {
     document.body.append("Loaded");
     imageUpload.addEventListener('change', async () => {
        const image = await faceapi.bufferToImage(imageUpload.files[0]);
        const detections = await faceapi.detectAllFaces(image)
        .withFaceLandmarks().withFaceDescriptors();
     });
 }