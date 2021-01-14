
from CloudStore import CloudStore
import time

cloud = CloudStore("ZFA5mAkxjVznvSsXOUxE")



# Handle the response.
def onSave( res ):
    print(res)
    if res.get("error"):
        print("Error: %s, %s" % (res["error"], res["message"]))
    else: print(res["message"])
    print(20*"-")
 
# Save some data.
print("save")
cloud.save( "Shopping_List", {"Apples":8,"Oranges":6}, onSave )



def onUpload( res ):
    print(res)
    if res.get("error"):
        print("Error: %s, %s" % (res["error"], res.get("message")))
    else: print(res["message"])
    print(20*"-")

time.sleep(3.1)
print("upload")
cloud.upload( b"myfile", "file.txt", "text", onUpload )

#  Handle the response.
def onLoad( res ):
    # You should now see your new Shopping_List with 10 Oranges and 8 Bananas
    print(res)
    if res.get("error"):
        print("Error: %s, %s" % (res["error"], res["message"]))
    else: print( res["message"] )
    print(20*"-")

#  Handle the response.
def onMerge( res ):
    print(res)
    if res.get("error"):
        print( "Error: %s, %s" % (res["error"], res["message"] ))
    else:
        # Data merged successfully    
        print( res["message"] )
        print(20*"-")
 
        # Lets now reload the data to see if our object has changed
        print("merge > load")
        cloud.load( "Shopping_List", onLoad )

#  Update our Shopping List by adding a new item and changing existing items.
time.sleep(3.1)
print("merge")
cloud.merge( "Shopping_List", {"Apples":8,"Oranges":10,"Bananas":8}, onMerge )



# Handle the response.
def OnList( res ):
    print(res)
    if res.get("error"):
        print( "Error: %s, %s" % (res["error"], res["message"] ))
    else: print( res["message"] )
    # This will show a comma separated list of all files matching your filter
    print(20*"-")

time.sleep(6.2)
print("list")
cloud.list( "Shopping", OnList )


# Handle the response.
def OnDelete( res ):
    print(res)
    if res.get("error"):
        print( "Error: %s, %s" % (res["error"], res["message"] ))
    else: print( res["message"] )
    print(20*"-")

time.sleep(3.1)
print("delete")
cloud.delete( "Shopping_List", OnDelete )
