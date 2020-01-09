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
import hashlib
import os

# [START storage_list_files]
from google.cloud import storage

SEP = os.path.sep


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
    """Uploads a file to the bucket. object's folder name should be hashed"""
    # bucket_name = "your-bucket-name"
    # path = "local/path/to/file"
    # object_name = "storage-object-name"

    storage_client = storage.Client()
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(object_name)

    blob.upload_from_filename(path)

    print(
        "File {} uploaded to {}.".format(
            path, object_name
        )
    )
    # make public??
    blob.make_public() 

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

def is_image(filename):
    """
        Checks if the filename is a valid image file. Currently support PNG and JPG files.
    """
    fname = filename.lower()
    if fname.endswith(".png") or fname.endswith(".jpg") or fname.endswith("jpeg"):
        return True
    return False

def scan_for_folders(path="./"):
    ret = []
    scanned = os.listdir(path)
    for item in scanned:
        if os.path.isdir(item):
            ret.append(item)
    return ret

def scan_for_files_or_objects(path="./"):
    ret = []
    scanned = os.listdir(path)
    for item in scanned:
        if is_image(item):
            ret.append(
                {
                    "filename": item,
                    "filepath": os.path.join(os.path.abspath(path), item)
                }
            )
    return ret

def get_hash(message):
    m = hashlib.sha256()
    m.update(message)
    digest = m.hexdigest()
    return digest

def get_sub_dirs(path="./"):
    ret = []
    return ret

def get_files(path="./"):
    ret = []
    return ret

def begin_upload(bucket, path="./"):
    print ("uploading blobs ...")
    try:
        folders = scan_for_folders(path)
        for folder in folders:
            folder_hash = get_hash(folder)
            files = scan_for_files_or_objects(folder)
            for fitem in files:
                object_name = folder_hash + "/" + fitem.get("filename", "")
                upload_blob(bucket, fitem.get("filepath", "./"), object_name)
        print ("done uploading blobs ...")
    except Exception as e:
        print (e)

def test_upload_blob(bucket = "lala_face_recognition_test"):
    """
        tests our uploading capability by performing the following:
        1. scan current wording directory for sub folders
        2. create a dictionary of all images in the subfolders
        3. upload each images as blob (SHA256_Digest of parent folder + '/' + filename)
    """    
    print ("this is test. uploading subfolders to " + bucket + "...")
    try:
        folders = scan_for_folders()
        for folder in folders:
            folder_hash = get_hash(folder)
            print (folder_hash)
            files = scan_for_files_or_objects(folder)
            print (files)
            for fitem in files:
                object_name = folder_hash + "/" + fitem.get("filename", "")
                upload_blob(bucket, fitem.get("filepath", "./"), object_name)
    except Exception as e:
        print (e)



def print_help():
    print """Usage: python gcs_ops.py <command> <bucket name> ..optional <path>
    example: python gcs_ops.py upload test_bucket /images/tests
    Command can be:
        help: Prints this help
        list: Lists all the objects in the specified bucket
        upload: Upload the provided files under all subfolders in specified bucket

    TODO: flags
    """


# [END storage_list_files]


# if __name__ == "__main__":
#     # list_blobs(bucket_name=sys.argv[1])
#     # for testing
#     test_upload_blob()


if __name__ == "__main__":
    print (sys.argv)
    if len(sys.argv) < 2 or sys.argv[1] == "help" or \
        sys.argv[1] not in ['list', 'upload', 'test']:
        print_help()
        sys.exit()
    if sys.argv[1] == 'list':
        if len(sys.argv) == 2:
            list_buckets()
            sys.exit()
        elif len(sys.argv) == 3:
            list_blobs(sys.argv[2])
            sys.exit()
        else:
            print_help()
            sys.exit()
    if sys.argv[1] == 'upload':
        if len(sys.argv) >= 3:
            if (len(sys.argv) > 3):
                begin_upload(sys.argv[2], sys.argv[3])
            else:
                begin_upload(sys.argv[2])
            sys.exit()
        else:
            print_help()
            sys.exit()

    if sys.argv[1] == 'test':
        if len(sys.argv) == 3:
            test_upload_blob(sys.argv[2])
            sys.exit()
        elif len(sys.argv) == 2:
            test_upload_blob()
            sys.exit()
        else:
            print_help()
            sys.exit()