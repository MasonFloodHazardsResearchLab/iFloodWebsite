# iFlood Website 🌊
This is the repo for the iFlood web interface currently hosted at [iflood.vse.gmu.edu](http://iflood.vse.gmu.edu). Originally developed by [William O'Connell](https://williamoconnell.me).

### Structure
The site is built using the static site generator [Harp](http://harpjs.com/). Templates use EJS and styles are written in SASS. Harp compiles these source files into HTML and CSS. The files are hosted on Amazon S3, with Amazon's CloudFront CDN to help improve load times.

There are two separate S3 buckets. Bucket `gmu-iflood-data` is where forecast data is uploaded. Bucket `gmu-iflood-interface` hosts the front end website which makes AJAX calls to the data bucket.

Alerts are handled through AWS API Gateway, which calls a collection of Lambda functions. The source for these functions can be found in `/lambda`, but if you make any changes to them you'll need to update the version in AWS as well.

### How to update
In order to make changes to the site, you'll first need to install harp (`npm install -g harp`) and set up the [AWS CLI](https://aws.amazon.com/cli/). Best practice would be to set up a [new IAM user for yourself](https://console.aws.amazon.com/iam/home#/users) (making sure to check the "programmatic access" box so AWS will generate CLI access keys for you), but I've placed my access keys on the research drive (Z:/Website_Media/_AWS_KEYS) just in case.
 
Once that's up and running, you can make your code changes in the `/public` folder and run `upload.bat`. Harp will compile your changes to the `/www` folder, which will then be uploaded to S3. Keep in mind that old cached files may stay in CloudFront for up to 24 hours, so you might want to [invalidate the cache](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Invalidation.html) so CloudFront will know to look for the new version. Don't forget to commit your changes!