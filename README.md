# Gusteau (CIS4500 Project)

## How to Run the App Locally
1. Download the app folder.
2. Navigate to the `client` directory and run `npm install --force`, followed by `npm start`.
3. In a separate terminal from the previous step, navigate to the `server` directory and again run `npm install --force`, followed by `npm start`.
4. Open `localhost:3000` in your browser to see our app's frontend! To see the backend, open `localhost:8080/<route>`.

## Dependencies

### Client dependencies
The following dependencies are required and can be found in `client/package.json`:
```
"dependencies": {
    "@dhaiwat10/react-link-preview": "^1.15.0",
    "@emotion/react": "^11.10.5",
    "@emotion/styled": "^11.10.5",
    "@fortawesome/fontawesome-svg-core": "^6.4.0",
    "@fortawesome/free-brands-svg-icons": "^6.4.0",
    "@fortawesome/free-regular-svg-icons": "^6.4.0",
    "@fortawesome/free-solid-svg-icons": "^6.4.0",
    "@fortawesome/react-fontawesome": "^0.2.0",
    "@mui/icons-material": "^5.11.16",
    "@mui/material": "^5.11.1",
    "@mui/x-data-grid": "^5.17.17",
    "@react-oauth/google": "^0.11.0",
    "@rsuite/icons": "^1.0.2",
    "@testing-library/jest-dom": "^5.16.5",
    "@testing-library/react": "^13.4.0",
    "@testing-library/user-event": "^13.5.0",
    "axios": "^1.3.6",
    "bcryptjs": "^2.4.3",
    "link-preview-js": "^3.0.4",
    "react-facebook-login": "^4.1.1",
    "react-icons": "^4.8.0",
    "react-material-ui-carousel": "^3.4.2",
    "react-router-dom": "^6.10.0",
    "react-scripts": "5.0.1",
    "react-social-icons": "^5.15.0",
    "react-social-login-buttons": "^3.6.1",
    "reactjs-social-login": "^2.6.2",
    "recharts": "^2.2.0"
  }
```

### Server dependencies
The following dependencies are required can be found in `server/package.json`:
```
"dependencies": {
    "body-parser": "^1.20.2",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "env": "^0.0.2",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.0",
    "mysql": "^2.18.1",
    "nodemon": "^2.0.22",
    "supertest": "^6.3.3"
  }
```
