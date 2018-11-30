# Lambda Functions
Each .py file in this directory maps to an AWS Lambda function. These functions are **not** automatically updated by `upload.bat`,
so after you make changes to them you'll need to upload the new version to Lambda. In most cases you can just open the editor
(https://console.aws.amazon.com/lambda) and copy/paste the new version. The function `ifloodSendAlerts` uses the `shapely`
python library, so the library files (`/shapely`) needed to be uploaded along with `ifloodSendAlerts.py` in a zip folder.
Now that this is done, you should be able to update `ifloodSendAlerts.py` through the online editor just like any other
function, but if you ever need to recreate the Lambda function from scratch you'll need to
[upload a zip](https://docs.aws.amazon.com/lambda/latest/dg/lambda-python-how-to-create-deployment-package.html#python-package-dependencies)
of `/shapely` and `ifloodSendAlerts.py`.