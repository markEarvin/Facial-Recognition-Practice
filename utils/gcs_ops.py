#!/usr/bin/env python

# Copyright 2019 Google Inc. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the 'License');
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import sys

# [START storage_list_files]
from google.cloud import storage


def list_blobs(bucket_name):
    """Lists all the blobs in the bucket."""
    # bucket_name = "your-bucket-name"

    storage_client = storage.Client()

    # Note: Client.list_blobs requires at least package version 1.17.0.
    blobs = storage_client.list_blobs(bucket_name)

    for blob in blobs:
        print(blob.name)

def list_buckets():
    """Lists all buckets."""

    storage_client = storage.Client()
    buckets = storage_client.list_buckets()

    for bucket in buckets:
        print(bucket.name)

def upload_blob(bucket_name, path, object_name):
    """Uploads a file to the bucket."""
    # bucket_name = "your-bucket-name"
    # path = "local/path/to/file"
    # object_name = "storage-object-name"

    storage_client = storage.Client()
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(object_name)

    blob.upload_from_filename(path)

    print(
        "File {} uploaded to {}.".format(
            source_file_name, destination_blob_name
        )
    )

def make_blob_public(bucket_name, blob_name):
    """Makes a blob publicly accessible."""
    # bucket_name = "your-bucket-name"
    # blob_name = "your-object-name"

    storage_client = storage.Client()
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(blob_name)

    blob.make_public()

    print(
        "Blob {} is publicly accessible at {}".format(
            blob.name, blob.public_url
        )
    )

def get_hash(object_name):
    pass

def scan_for_folders(path="./"):
    pass

def scan_for_files_or_objects(path="./"):
    pass



def print_help():
    print """Usage: python gcs_objects.py <command>
    Command can be:
        help: Prints this help
        list: Lists all the objects in the specified bucket
        create: Upload the provided file in specified bucket
        delete: Delete the provided filename from bucket
    """


# [END storage_list_files]


# if __name__ == "__main__":
#     list_blobs(bucket_name=sys.argv[1])

if __name__ == "__main__":
    if len(sys.argv) < 2 or sys.argv[1] == "help" or \
        sys.argv[1] not in ['list', 'create', 'delete', 'get']:
        print_help()
        sys.exit()
    if sys.argv[1] == 'list':
        if len(sys.argv) == 3:
            list_objects(sys.argv[2])
            sys.exit()
        else:
            print_help()
            sys.exit()
    if sys.argv[1] == 'create':
        if len(sys.argv) == 4:
            # create_object(sys.argv[2], sys.argv[3])
            pass
            sys.exit()
        else:
            print_help()
            sys.exit()
    if sys.argv[1] == 'delete':
        if len(sys.argv) == 4:
            # delete_object(sys.argv[2], sys.argv[3])
            pass
            sys.exit()
        else:
            # print_help()
            sys.exit()