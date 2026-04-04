FROM node:20-alpine

# curl gerekli (font indirme için)
RUN apk add --no-cache curl

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

# NotoSans fontlarını build sırasında indir
RUN REGULAR_URL=$(curl -s "https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400" | grep -o "https://fonts.gstatic.com[^)]*" | head -1) \
    && curl -sL "$REGULAR_URL" -o assets/fonts/NotoSans-Regular.ttf \
    && curl -sL "https://fonts.gstatic.com/s/notosans/v42/o-0mIpQlx3QUlC5A4PNB6Ryti20_6n1iPHjcz6L1SoM-jCpoiyAaBN9d.ttf" \
       -o assets/fonts/NotoSans-Bold.ttf \
    && echo "Fonts downloaded: $(ls -lh assets/fonts/NotoSans*.ttf)"

EXPOSE 3023

CMD ["node", "app.js"]
