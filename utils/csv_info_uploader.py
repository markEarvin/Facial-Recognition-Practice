from google.cloud import datastore
import google.cloud.exceptions
import csv

ENTRIES_PER_PAGE = 10

def read_and_upload_csv(path=""):
    # for testing only, set the path locally
    path = 'DTC CPS Employee List.csv'
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
    for entry in rows:
        upload_entries(entry)

def transform_row(row):
    transformed = {}
    for key in row.keys():
        new_key = key.lower()
        new_key = new_key.replace(" ", "_")
        transformed[new_key] = row.get(key, "")
    return transformed

def upload_entries(rows, client=None):
    print (len(rows))
    # task1 = datastore.Entity(client.key('Task', 1))

    # task1.update({
    #     'category': 'Personal',
    #     'done': False,
    #     'priority': 4,
    #     'description': 'Learn Cloud Datastore'
    # })

    # task2 = datastore.Entity(client.key('Task', 2))

    # task2.update({
    #     'category': 'Work',
    #     'done': False,
    #     'priority': 8,
    #     'description': 'Integrate Cloud Datastore'
    # })

    # client.put_multi([task1, task2])


if __name__ == "__main__":
    # print (sys.argv)
    read_and_upload_csv()
