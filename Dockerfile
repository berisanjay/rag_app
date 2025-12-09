# ---------- Base image ----------
FROM node:20-bullseye

# ---------- Install Python 3 and pip ----------
RUN apt-get update && \
    apt-get install -y python3 python3-pip python3-venv git build-essential && \
    ln -sf /usr/bin/python3 /usr/bin/python && \
    python -m pip install --upgrade pip && \
    rm -rf /var/lib/apt/lists/*

# ---------- Set working directory ----------
WORKDIR /usr/src/app

# ---------- Copy Node.js files and install ----------
COPY package*.json ./
RUN npm install --production

# ---------- Copy Python requirements ----------
COPY requirements.txt ./
RUN python -m pip install --no-cache-dir -r requirements.txt

# ---------- Copy the rest of the app ----------
COPY . .

# ---------- Expose port ----------
EXPOSE 8080

# ---------- Start the app ----------
CMD ["node", "server.js"]
