FROM node:20-slim

# Install ffmpeg, python, pip, and curl (needed for yt-dlp)
RUN apt-get update && \
    apt-get install -y ffmpeg python3 python3-pip curl && \
    rm -rf /var/lib/apt/lists/*

# Install the latest yt-dlp directly (the one bundled with
# youtube-dl-exec is often outdated and gets blocked by YouTube)
RUN pip3 install --break-system-packages -U yt-dlp

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

ENV FFMPEG_PATH=/usr/bin/ffmpeg
ENV YTDLP_BINARY=/usr/local/bin/yt-dlp
ENV PORT=5001

EXPOSE 5001

CMD ["node", "src/index.js"]