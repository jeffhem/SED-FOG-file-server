# Use an official Python runtime as a parent image
FROM node:8

# Set the working directory to /app
WORKDIR /storage_service

# Copy the current directory contents into the container at /app
COPY package*.json ./

# Install any needed packages specified in requirements.txt
RUN npm install

# Bundle app source
COPY . .

# Make port 80 available to the world outside this container
EXPOSE 5000

# Define environment variable
ENV NODE_ENV production PORT 5000

# Run app.py when the container launches
CMD [ "npm", "start" ]