FROM node:20-slim

# Install ffmpeg and python (needed for yt-dlp)
RUN apt-get update && \
    apt-get install -y ffmpeg python3 python3-pip && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

ENV FFMPEG_PATH=/usr/bin/ffmpeg
ENV PORT=5001

EXPOSE 5001

CMD ["node", "src/index.js"]
