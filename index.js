const express = require('express');
const request = require('request');
const { createCanvas, loadImage } = require('canvas');
const GIFEncoder = require('gifencoder');

const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

const geoip = require('geoip-lite');


app.get('/', async (req, res) => {
  res.setHeader('content-type', 'image/gif');
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const geo = geoip.lookup(ip);

  // Load the image into a canvas
  const canvas = createCanvas(600, 400);
  const ctx = canvas.getContext('2d');

  // Generate the zooming GIF frames
  const encoder = new GIFEncoder(600, 400);
  encoder.createReadStream().pipe(res);
  encoder.setRepeat(0);
  encoder.setDelay(100);
  encoder.start();

  const createImage = async (zoom = 0.7) => {
    return new Promise((resolve, reject) => {
      request(`https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/static/${geo.ll[1]},${geo.ll[0]},${zoom},0,45/300x220@2x?access_token=pk.eyJ1IjoiZmEzN2siLCJhIjoiY2xoMWt5MGxjMTRibzNxcnRia2YzeWM0bSJ9.nLzyzB4sQrrFGwBoZxR3MQ`, { encoding: null }, async (error, response, body) => {
        if (error || response.statusCode !== 200) {
          return;
        }
        const img = await loadImage(body);
        ctx.drawImage(img, 0, 0, 600, 435);

        // Overlay the user's city name on the image
        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText(geo.city, 300, 50);

        encoder.addFrame(ctx.getImageData(0, 0, 600, 400).data);
        resolve();
      });
    });
  };

  await createImage();
  for (let i = 1; i < 10; i += 0.25) {
    await createImage(i);
  }
  encoder.finish();
});



// Too lazy to not duplicate it.
app.get('/HD', async (req, res) => {
  res.setHeader('content-type', 'image/png');
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const geo = geoip.lookup(ip);

  // Load the image into a canvas
  const canvas = createCanvas(600, 400);
  const ctx = canvas.getContext('2d');

  // Generate the zooming GIF frames
  const encoder = new GIFEncoder(600, 400);
  encoder.createReadStream().pipe(res);
  encoder.setRepeat(0);
  encoder.setDelay(100);
  encoder.start();

  const createImage = async (zoom = 0.7) => {
    return new Promise((resolve, reject) => {
      request(`https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/static/${geo.ll[1]},${geo.ll[0]},${zoom},0,45/1280x853@2x?access_token=pk.eyJ1IjoiZmEzN2siLCJhIjoiY2xoMWt5MGxjMTRibzNxcnRia2YzeWM0bSJ9.nLzyzB4sQrrFGwBoZxR3MQ`, { encoding: null }, async (error, response, body) => {
        if (error || response.statusCode !== 200) {
          return;
        }
        const img = await loadImage(body);
        ctx.drawImage(img, 0, 0, 600, 410);

        // Overlay the user's city name on the image
        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText(geo.city, 300, 50);

        encoder.addFrame(ctx.getImageData(0, 0, 600, 400).data);
        resolve();
      });
    });
  };

  await createImage();
  for (let i = 1; i < 10; i += 0.25) {
    await createImage(i);
  }
  encoder.finish();
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
