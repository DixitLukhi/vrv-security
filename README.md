# Gold Touch Jewels E-Commerce Platform (Backend)

Gold Touch offers a unique way to purchase and customize 925 silver, gold, platinum, and diamond jewelry online. The platform provides a seamless experience for users to browse, customize, and purchase high-quality jewelry. This project involves the development of a scalable e-commerce backend platform that integrates various technologies for secure data management, user authentication, product management, and payment processing.

## Table of Contents

1. Overview
2. Key Features & Technologies
3. Technologies Used
4. How to Run the Project

## Overview

Gold Touch is a comprehensive e-commerce platform offering customization options for high-quality jewelry made from 925 silver, gold, platinum, and diamonds. It enables customers to personalize their jewelry pieces by selecting materials, designs, and weights. The platform also integrates secure user authentication, order management, product management, and payment processing features.

## Key Features & Technologies

## Authentication & Authorization
- Role-Based Access Control (RBAC) for managing user roles (Admin, User).
- Secure user authentication using JWT tokens for registration, login, and logout functionality.
- Admin roles have full access to manage products and user data, while Users have restricted access to their accounts and orders.

## Product Customization
- Customers can choose materials like 925 silver, gold, platinum, and diamonds for their jewelry.
- Customization options include weight, design, and other user-specific preferences.

## Payment Processing
- Integration with PayPal for secure and efficient payment processing for jewelry orders.

## Storage & Media Management
- AWS S3 is used for storing product images and media files, ensuring fast and scalable access to media.
- The Google Drive API is integrated to manage custom user-generated content efficiently.

## Data Management & Scalability
- The platform is designed to scale with growing product catalogs and an expanding user base.
- MongoDB is used to store user data, product details, orders, and reviews securely.

## Product Management & Reviews
- Admins can manage product catalogs: add, update, or delete products.
- Users can submit reviews for products, and these reviews are authenticated based on their roles and login status.

## Technologies Used
- Backend: Node.js with Express.js
- Database: MongoDB for managing user data, products, orders, and reviews.
- Authentication: JSON Web Tokens (JWT) for secure user authentication.
- Payment Integration: PayPal for payment processing.
- File Storage: AWS S3 for storing product images and other media files.
- APIs: Google Drive API for managing user-uploaded content.
- Role-Based Access Control (RBAC): Ensuring proper access control based on user roles.

## How to Run the Project

1. Clone the repository to your local machine.
```sh
git clone https://github.com/DixitLukhi/vrv-security.git
```

2. Navigate to the project directory.
```sh
cd vrv-security
```

3. Install the required dependencies.
```sh
npm install
```

4. Set up your environment variables in a .env file for secure information like PayPal credentials, JWT secrets, and MongoDB connection strings.
```sh
cd vrv-security
```

5. Start the server.
```sh
npm start
```

6. Navigate to http://localhost:1234 to access the platform.

