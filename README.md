# Facial-Recognition-Practice
This is a practice project for implementing a facial recognition web app using Javascript which interfaces with tensorflow.js via face-api.js

## Common Issues While Testing
CORS - It happens when you host your images somewhere on the internet and you are running your tests using localhost server. What happens is the server identifies your request as untrusted and does not return 'Access-Control-Allow-Origin' on the response header. Thus the CORS issue. 

HACK:: In case you are using Google Cloud Storage to host your images, you may use the hack mentioned here (https://medium.com/@selom/how-to-fix-a-no-access-control-allow-origin-error-message-on-google-cloud-storage-90dd9b7e3ddb).

### Reference
WebDevSimplified - https://github.com/WebDevSimplified/Face-Recognition-JavaScript
