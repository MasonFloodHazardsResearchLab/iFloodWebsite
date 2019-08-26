call harp compile # when using this on the LINUX machine use "harp compile" instead
aws s3 sync ./www s3://gmu-iflood-interface --delete
aws cloudfront create-invalidation --distribution-id E1Z7PVBPK4FC81 --paths /*
