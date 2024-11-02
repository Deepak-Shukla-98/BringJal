Technologies Used
•	Node.js (v18.x)
•	AWS Lambda for serverless functions
•	Serverless Framework for deployment management
•	MongoDB Atlas for database
•	Google Distance Matrix API for calculating distances between delivery stops
___________________________________________________________________________________________________________

Endpoints
---------
Base URL
•	Base URL: https://q02ndr4ll4.execute-api.us-east-1.amazonaws.com/dev

API Routes
Method	    Endpoint	                Description
POST	    api/users/create	        Register a new user
POST	    api/users/login	            User login and JWT authentication
GET	        api/users	                Fetch all users, with optional sorting and filtering
PUT	        api/users/edit/{id}	        Update user profile, requires JWT authentication
Delete      api/users/delete/{id}       Delete user profile, requires JWT authentication
POST	    api/inventories/create	    Create a new inventory location
PUT	        api/inventories/edit/{id}   Update inventory details
GET	        api/path/shortest_path	    Calculate the shortest delivery route
___________________________________________________________________________________________________________

Route Details
1. User Registration - POST api/users/create
•	Description: Registers a new user and stores their data in the database with hashed password storage.
•	Response: Returns the newly created user ID and a success message.
•	Request Body: 
{
  "name": "John Doe",
  "mobile": "1234567890",
  "email": "john@example.com",
  "coordinates": {
    "latitude": 12.9716,
    "longitude": 77.5946
  },
  "password": "password123"
}
___________________________________________________________________________________________________________

2. User Login - POST api/users/login
•	Description: Authenticates a user and provides a JWT token for protected routes.
•	Response: Returns a JWT token if login is successful.
•	Request Body:
{
    "email": "john.smith@example.com",
    "password": "password123"
}
___________________________________________________________________________________________________________

3. Get All Users - GET api/users/
•	Description: Fetches all registered users with optional sorting and filtering by registration date.
•	Query Parameters:
•	sort: latest or oldest (default: latest)
•	registrationDate: Date filter in DD/MM/YYYY format
•	Response: Returns a list of users, sorted and filtered as per query parameters.
___________________________________________________________________________________________________________

4. Update User Profile - PUT api/users/edit/{id}
•	Description: Updates user profile information. Only authenticated users can update their own profile.
•	Request Header:
•	Authorization: Bearer token from the /login endpoint.
•	Response: Returns the updated user profile information.
•	Request Body (Example): 
{
  "name": "John Doe Updated",
  "mobile": "0987654321"
}
___________________________________________________________________________________________________________

5. Create Inventory - POST api/inventories/create
•	Description: Adds a new inventory location to the database.
•	Response: Returns the ID and details of the created inventory location.
•	Request Body:
{
  "name": "Warehouse A",
  "capacity": 100,
  "coordinates": {
    "latitude": 12.9352,
    "longitude": 77.625
  }
}
___________________________________________________________________________________________________________

6. Update Inventories - Put api/inventories/edit/{id}
•	Description: Updates inventory details. 
•	Response: Returns updated inventory data.
___________________________________________________________________________________________________________

7. Calculate Shortest Delivery Route - GET /shortest_path
•	Description: Calculates the shortest route from an origin inventory to all user locations and finally to the destination inventory using the Google Distance Matrix API.
•	Response: Returns an optimized route, including each stop with distance and duration, and the total distance.
___________________________________________________________________________________________________________

Project Setup and Configuration
Prerequisites
•	Node.js and npm
•	MongoDB Atlas account
•	Google API Key with Distance Matrix API enabled
•	AWS Account with access to deploy Lambda functions
•	Serverless Framework installed globally
•   npm install -g serverless

1. Clone the Repository
•   git clone <repository-url>
•   cd bringjal
___________________________________________________________________________________________________________

2. Install Dependencies
•   npm install
___________________________________________________________________________________________________________

3. Set Up Environment Variables
•   Create a .env file in the root directory and add the following:
•   ATLAS_URI=your_mongodb_atlas_connection_string
•   GOOGLE_API_KEY=your_google_api_key
•   JWT_SECRET=your_jwt_secret
•   PORT= port_number
___________________________________________________________________________________________________________

4. AWS setup
•   npm install -g serverless
•   Connect serverless frame with your aws account 
    serverless config credentials --provider aws --key <your-key> --secret <secret-key>
•   Create serverless template
    serverless create -t aws-nodejs
___________________________________________________________________________________________________________

5. Define serverless.yml
•   Ensure serverless.yml is configured as below
#
service: bringjal
frameworkVersion: "3"

provider:
  name: aws
  runtime: nodejs18.x
  memorySize: 2048
  stage: dev
  timeout: 15 

functions:
  hello:
    handler: handler.hello
    events:
     - http: ANY /{proxy+}
     - http: ANY /
    environment:
     ATLAS_URI=your_mongodb_atlas_connection_string
     GOOGLE_API_KEY=your_google_api_key
     JWT_SECRET=your_jwt_secret
     PORT= port_number
#
___________________________________________________________________________________________________________

6. Update handleer.js file
    npm install serverless-http
#
'use strict';
const app = require('./app')
const serverless = require('serverless-http')
module.exports.hello = serverless(app)
#
___________________________________________________________________________________________________________

7. Update package.json
add deploy command in scripts
"deploy" : "serverless deploy"
___________________________________________________________________________________________________________

8. Deploy Project:
npm run deploy
