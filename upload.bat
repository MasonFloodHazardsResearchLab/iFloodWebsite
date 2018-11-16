call harp compile
aws s3 sync ./www s3://gmu-iflood-interface --delete
aws cloudfront create-invalidation --distribution-id E1Z7PVBPK4FC81 --paths /*