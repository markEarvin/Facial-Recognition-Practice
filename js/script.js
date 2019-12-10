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
     let image;
     let canvas;
     imageUpload.addEventListener('change', async () => {
        if (image){
            image.remove();
        }
        if (canvas){
            canvas.remove();
        }
        image = await faceapi.bufferToImage(imageUpload.files[0]);
        canvas = faceapi.createCanvasFromMedia(image);
        imgContainer.append(image);
        imgContainer.append(canvas);
        const displaySize = { width: image.width, height: image.height };
        faceapi.matchDimensions(canvas, displaySize);
        const detections = await faceapi.detectAllFaces(image)
        .withFaceLandmarks().withFaceDescriptors();
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        resizedDetections.forEach(detection => {
            const box = detection.detection.box;
            const drawBox = new faceapi.draw.DrawBox(box, { label: "face" });
            drawBox.draw(canvas);
        })
     });
 }