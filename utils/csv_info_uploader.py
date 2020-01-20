from google.cloud import datastore
import google.cloud.exceptions

from random import seed
from random import randint

import csv, sys, os, glob

ENTRIES_PER_PAGE = 10

def read_and_upload_csv(path="", client=None):
    rows = []
    try:
        with open(path) as csvfile:
            reader = csv.DictReader(csvfile)
            count = 0
            # we have to paginate rows so as to keep the requests small
            row_entry = []
            for row in reader:
                if count >= ENTRIES_PER_PAGE:
                    rows.append(row_entry)
                    row_entry = []
                    count = 0
                new_row = transform_row(row)
                row_entry.append(new_row)
                count += 1
            if len(row_entry):
                rows.append(row_entry)
        # now let's upload per page
        print (len(rows))
        for entry in rows:
            upload_entries(entry, client)
    except Exception as e:
        print (e)

def transform_row(row):
    """
    Set all keys to lower case and replace all spaces with underscore '_'.
    Creating a new dictionary altogether.
    """
    transformed = {}
    for key in row.keys():
        new_key = key.lower()
        new_key = new_key.replace(" ", "_")
        transformed[new_key] = row.get(key, "")
    return transformed

def get_random_number(seed_value = 1):
    seed(seed_value)
    return randint(0, 9999999)

def upload_entries(rows, client=None):
    """
    This uploads the content of an array to the Datastore.
    Contents of array should be dictionaries.
    If client does not exist, this will raise an error.
    """
    tasks = []
    try:
        for entry in rows:
            task = datastore.Entity(client.key('Employee', entry.get("eid", get_random_number())))
            task.update(entry)
            tasks.append(task)
        # based on testing, this uploads the data and is encoded to base64 on the fly.
        # meaning each query will have to use base64 encoded strings to adapt to the Entities.
        client.put_multi(tasks)
    except Exception as e:
        print (e)

def main(project_id, path):
    print ("uploading contents of '{}' to project '{}'".format(path, project_id))
    client = datastore.Client(project_id)
    read_and_upload_csv(path, client)

def print_help():
    print ("""
    Instructions on how to use this script:

    First setup the authentication by providing a service account as stated here >> https://cloud.google.com/docs/authentication/production
    Then run the follwing command: `python csv_info_uploader.py <project_id> <csv_file>`.
    Example: python csv_info_uploader.py test-project-123 mycsv.csv

    If you have multiple CSV files, you may alternatively run any of the following commands:
    $ `python csv_info_uploader.py <project_id>`
    $ `python csv_info_uploader.py <project_id> .`
    $ `python csv_info_uploader.py <project_id> ./`
    """)


# how to authenticate: follow the providing service account credentials section here:: https://cloud.google.com/docs/authentication/production

if __name__ == "__main__":
    # print (sys.argv)
    if len(sys.argv) < 2 or sys.argv[1] == "help":
        print_help()
        sys.exit()
    # it is automatically assumed that in the absence of csv file parameter, the first param is the project id
    # and that the code shall scan for all csv files under the directory and upload all.
    elif len(sys.argv) == 2 or sys.argv[2] == "." or sys.argv[2] == "./":
        csv_files = glob.glob("*.csv")
        for csv_file in csv_files:
            # print (csv_file)
            main(sys.argv[1], csv_file)
        sys.exit()
    elif len(sys.argv) > 2:
        main(sys.argv[1], sys.argv[1])
        sys.exit()
    sys.exit()
