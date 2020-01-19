from google.cloud import datastore
import google.cloud.exceptions

from random import seed
from random import randint

import csv

ENTRIES_PER_PAGE = 10

def read_and_upload_csv(path="", client=None):
    rows = []
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
    print (len(rows))
    # tasks = []
    # try:
    #     for entry in rows:
    #         task = datastore.Entity(client.key('Employee', entry.get("eid", get_random_number())))
    #         task.update(entry)
    #         tasks.append(task)
    #     client.put_multi(tasks)
    # except Exception as e:
    #     print (e)

def main(project_id, path):
    client = datastore.Client(project_id)
    read_and_upload_csv(path, client)


# how to authenticate: follow the providing service account credentials section here:: https://cloud.google.com/docs/authentication/production

if __name__ == "__main__":
    # print (sys.argv)
    project_id = "august-clover-261601"
    path = 'DTC CPS Employee List.csv'
    main(project_id, path)
