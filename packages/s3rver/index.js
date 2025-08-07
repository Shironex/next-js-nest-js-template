const fs = require('fs')
const S3rver = require('s3rver')
const corsConfig = require.resolve('./cors.xml')

new S3rver({
  port: 4569,
  address: '0.0.0.0',
  silent: false,
  directory: './',
  configureBuckets: [
    {
      name: 'example',
      configs: [fs.readFileSync(corsConfig)],
    },
  ],
}).run()

console.log('S3rver running on port 4569')
