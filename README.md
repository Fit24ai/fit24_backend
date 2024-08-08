# Port number

PORT=3000

# URL of the Mongo DB

# main dev

MONGODB_URL = "mongodb+srv://health-app:974l0s2wggHDUQoS@health-cluster.cxczp2q.mongodb.net/health-cluster"

# JWT

# JWT secret key

JWT_SECRET=thisisasamplesecret

# Number of minutes after which an access token expires

JWT_ACCESS_EXPIRATION_MINUTES=30

# Number of days after which a refresh token expires

JWT_REFRESH_EXPIRATION_DAYS=30

# Number of minutes after which a reset password token expires

JWT_RESET_PASSWORD_EXPIRATION_MINUTES=10

# Number of minutes after which a verify email token expires

JWT_VERIFY_EMAIL_EXPIRATION_MINUTES=10

# SMTP configuration options for the email service

# For testing, you can use a fake SMTP service like Ethereal: https://ethereal.email/create

# dummy down

# SMTP_HOST=email-server

# SMTP_PORT=587

# SMTP_USERNAME=email-server-username

# SMTP_PASSWORD=email-server-password

# EMAIL_FROM=support@yourapp.com

# main

SMTP_HOST= 'smtp.gmail.com'
SMTP_PORT=587

# SMTP_Secure: false, // true for 465, false for other ports

SMTP_USERNAME= 'hiwebsite44@gmail.com'
SMTP_PASSWORD= 'zqfo cbyy gigz ylsy'
EMAIL_FROM= 'hiwebsite44@gmail.com'

BASE_URL = 'http://localhost:3000'
TEMP_RESET_EMAIL = 'sample456@yopmail.com'

DEV_ID=fit24-testing-uMFyxV4lo8
API_KEY=UR2dqKT3lLPFPbM0Fsek43W9jhXnHr62
SECRET=munnilal

# http://localhost:3000/v1/docs

npx eslint . --fix
