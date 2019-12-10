const imageUpload = document.getElementById('imageUpload');

 Promise.all([
    faceapi.nets.faceRecognitionNet.loadFromUri('../models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('../models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('../models')
 ]).then(start);

 async function start() {
     const imgContainer = document.createElement('div');
     imgContainer.style.position = 'relative';
     document.body.append(imgContainer);
     const labeledDescriptors = await loadLabeledImages();
     const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors);
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
        const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor));
        console.log(results);
        results.forEach((result, i) => {
            const box = resizedDetections[i].detection.box;
            const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() });
            drawBox.draw(canvas);
        })
     });
 }

 function loadLabeledImages() {
    const gcsBucket = "lala_face_recognition_test";
    const labels = ['Ambo', 'Enteng', 'Earvin', 'Kenneth', 'Lala', 'MamaBear', 'Mommy', 'Obo', 'PapaBear'];
    // const labels = ['Ambo', 'Enteng', 'Earvin', 'MamaBear', 'Mommy', 'Obo', 'PapaBear'];
    // Ambo and PapaBear image samples are not working. Or at least one of those. The following array below works
    // const labels = ['Kenneth', 'Earvin','Obo', 'Lala', 'Mommy', 'Enteng', 'MamaBear'];
    // Ambo 1, 2, 4, and 5 .png are working. Not sure why 3 is not. Debugging...
    // const labels = ['Ambo'];
    return Promise.all(
      labels.map(async label => {
        const descriptions = [];
        const maxImages = 5;
        for (let i = 1; i <= maxImages; i++) {
          const img = await faceapi.fetchImage(`https://storage.googleapis.com/${gcsBucket}/${label}/${i}.png`);
          const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
          console.log(detections);
          if (detections) descriptions.push(detections.descriptor);
        }
  
        return new faceapi.LabeledFaceDescriptors(label, descriptions);
      })
    );
  }