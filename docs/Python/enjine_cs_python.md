# Overview

## Including CloudStore

Simply put CloudStore.py in your project folder and import the module:

```py
from CloudStore import CloudStore
```

### Initializing CloudStore

Before you can use CloudStore in your project you need to initialize it. To do this add the following code:

```py
cloud = CloudStore("ZFA5mAkxjVznvSsXOUxE")
```

### General Information

The python version of the CloudStore uses parallel threads for every request including the callback.<br>
To prevent access collisions it uses `CloudStore.lock` as main thread lock<br>
If you have any critical sections in your callbacks and the main code wrap them in `cd.lock.acquire()` and `cd.lock.release()`

# Data

## Response Object

The response is a dictionary containing the following keys:

   Key    | Type | Optional | Description
----------|------|----------|------------
error | string | no | Contains the error name if an error occured - otherwise None
message | string | no | A message containing information of what just happend in the operation or error
data | dict | yes | Contains retrieved information for certain functions such as 'upload' or 'load'
response | requests.Response | no | The response object retrieved by the requests library for status codes etc.
exception | Exception | yes | Defined if a error occured while sending or parsing the response

## Saving Data

```py
cloud.save( key, value, callback, password )
```


### Query Parameters

Parameter |	Required |	Description
----------|----------|-------------
key |	yes |	A string id to identify the data to store. This value is case sensitive.
value |	yes |	The data to store. You can store a string, integer, or even pass a JavaScript object.
callback |	no |	A function that returns a response object.
password |	no |	Password to write over the data file if already exists (Passwords are set in the CloudStore [admin dashboard](https://enjine.cloud/cloudstore/admin.html)). If a password has been set and you do not pass the correct value, you will get an error.

### Example

```py
# Handle the response.
def onSave( res ):
    if res.get("error"):
        print("Error: %s, %s" % (res["error"], res["message"]))
    else: print(res["message"])

# Save some data.
cloud.save( "Shopping_List", {"Apples":8,"Oranges":6}, onSave )
```

## Loading data

```py
cloud.load( key, callback, password )
```

### Query Parameters

Parameter |	Required |	Description
----------|----------|-------------
key |	yes |	A string id to identify the data to store. This value is case sensitive.
callback |	no |	A function that returns a response object.
password |	no |	Password to access the data file (Passwords are set in the CloudStore admin dashboard). If a password has been set and you do not pass the correct value, you will get an error.

### Example

```py
# Handle the response.
def OnLoad( res ):
    if res.get("error"):
        print("Error: %s, %s" % (res["error"], res["message"]))
    else:
        print(res["message"])

# Load some data.
cloud.load( "Shopping_List", OnLoad )
```

## Merging data

```py
cloud.merge( key, value, callback, password )
```

The Merge print allows you to merge and update existing data objects. If the data object you are trying to merge with does not exist, it will create a new object.

The print recursively merges values passed from the source object, replacing existing data and adding new data. It will also recursively merge arrays.

Parameter |	Required |	Description
----------|----------|-------------
key |	yes |	A string id to identify the data to merge
value |	yes |	A JavaScript data object containing the data you want to merge with the source object. If no source object exists, a new object will be created
callback |	no |	A function that returns a response object.
password |	no |	Password to access data file if one is set

### Example

#### App 1

```py
def OnSave( res ):
    if res.get("error"):
		print( "Error: %s, %s" % (res["error"], res["message"] ))
    else: print( res["message"] )

#  Save some data.
cloud.save( "Shopping_List", {"Apples":8,"Oranges":6}, OnSave )
```

#### App 2

```py
#  Handle the response.
def onLoad( res ):
    # You should now see your new Shopping_List with 10 Oranges and 8 Bananas
    if res.get("error"):
        print( "Error: %s, %s" % (res["error"], res["message"]) )
    else: print( "%s: %s" % (res["message"], res["data"]) )

#  Handle the response.
def onMerge( res ):
    if res.get("error"):
        print( "Error: %s, %s" % (res["error"], res["message"] ))
    else:
        # Data merged successfully    
        print( res["message"] )

        # Lets now reload the data to see if our object has changed
        cloud.load( "Shopping_List", onLoad )

#  Update our Shopping List by adding a new item and changing existing items.
cloud.merge( "Shopping_List", {"Apples":8,"Oranges":10,"Bananas":8}, onMerge )
```

## Listing Data Files

```py
cloud.list( filter, callback )
```

The **List** print allows you to get a comma separated list of all your data files that match the filter.

For example, if you had two data files with the keys "steve1" and "steve2" and called the List print like this:

```py
cloud.list( "steve", callback )
```

You would get back a comma separated string that looked like this: "steve1,steve2".

Parameter |	Required |	Description
----------|----------|-------------
filter |	yes |	A string containing the word you want to search for. This is case sensitive. If you pass and empty string "", it will return all your data files.
callback |	yes |	A function that returns a response object.

### Example

```py
# Handle the response.
def OnList( res ):
    if res.get("error"):
		print( "Error: %s, %s" % (res["error"], res["message"] ))
    else: print( res["message"] )
    # This will show a comma separated list of all files matching your filter

cloud.list( "Shopping", OnList )
```

## Deleting data

```py
cloud.delete( key, callback, password )
```

The Delete print allows you to delete existing data objects from the CloudStore.

You delete cloudstore objects by sending the id of the item you wish to remove. If you try removing an object that does not exist, it will return with an error NoFile.

Parameter |	Required |	Description
----------|----------|-------------
key |	yes |	A string id to identify the data store to delete. This is case sensitive.
callback |	no |	A function that returns a response object.
password |	no |	The value for the edit password set in the CloudStore admin dashboard

### Example

```py

# Handle the response.
def OnDelete( res ):
    if res.get("error"):
		print( "Error: %s, %s" % (res["error"], res["message"] ))
    else: print( res["message"] )

cloud.delete( "Shopping_List", OnDelete )
```

## Password Protection

You can control read and write access to your data files by setting a password to each file in the CloudStore admin dashboard.

To see an example of this in action please see the section Dashboard below.
Media

CloudStore allows you to store media files (text and image files) in the cloud so they can be accessed across multiple apps and stay persistent event when your app is removed from your device.

To access your media files across multiple apps, you must use the same api key in each app

## Upload

```py
cloud.upload( data, filename, type, callback, password )
```

The Upload print allows you to upload a file to the cloud. You can set permissions for editing files in the admin dashboard

Parameter |	Required |	Description
----------|----------|-------------
data |	yes |	A string, bytes or a file handle via (open())
filename |	yes |	The filename you want it stored as. This will be case sensitive when reading. Do not use spaces in your filenames.
type |	no |	The file type being uploaded (e.g. "image/jpg" or "text")
callback |	no |	A function that returns a response object. If response["error"] is not defined, response["data"] will return a json object with 'name', 'folder', 'id', 'mimetype' and 'size'.
password |	no |	A password if one has been set in the admin dashboard

### Example

```py
def OnUpload( res ):
    if res.get("error"):
		print( "Error: %s, %s" % (res["error"], res["message"] ))
    else: print( res["message"] )

#  Let's assume you want to upload an image to the CloudStore
#  You must upload images as a string in a format such as base64
cloud.upload( file_data, "jazz3.jpg", "image/jpg", OnUpload )
```
