const imageUpload = document.getElementById('imageUpload');

 Promise.all([
    faceapi.nets.faceRecognitionNet.loadFromUri('../models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('../models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('../models')
 ]).then(start);

 function start() {
     const imgContainer = document.createElement('div');
     imgContainer.style.position = 'relative';
     document.body.append(imgContainer);
     document.body.append("Loaded");
     imageUpload.addEventListener('change', async () => {
        const image = await faceapi.bufferToImage(imageUpload.files[0]);
        const canvas = faceapi.createCanvasFromMedia(image);
        imgContainer.append(image);
        imgContainer.append(canvas);
        const detections = await faceapi.detectAllFaces(image)
        .withFaceLandmarks().withFaceDescriptors();
     });
 }