//=============================================================================
// cloudstore.js v1.0
//=============================================================================

/** 
  * @desc This class holds functions for communicating with enjine.io cloud storage utility.
  * @authors Copyright 2020 enjine.io, support@enjine.io
*/

class CloudStore
{
    constructor(key, server)
    {
        //Properties
        if(!server) this.server = "https://enjine.cloud/cloudstore"
        else this.server = server;
        this.m_apiKey = key;
        this.m_maxRate = 3000;
        this.m_tlast = 0;
        this.m_retry = true;
        this.m_version = 1;
    }
    
    rateCheck()
    {
        var n = +new Date();
        var tdiff = n - this.m_tlast;
        if(tdiff < this.m_maxRate) return false
        this.m_tlast = n;
        return true
    }
    
    // SEND DATA THROUGH XMLHTTPREQUEST
    async sendData(url,options)
    {
        try {
            if(url === undefined) return Promise.reject("url or options not defined");
            if(options !== undefined && options.method === undefined) options.method = 'POST'    
            
            const result = await fetch(url,options)
            return result.json()
        } catch(error) {
            console.error(error)
            return {error:"Error sending data!"}
        }
    }
    
    save(file, obj, callback, password)
    {
        try {
            if( !this.rateCheck() ) {
                setTimeout( ()=>{ this.save(file,obj,callback,password) }, this.m_maxRate + 500 )
                return
            }            
            const json = {key: this.m_apiKey, file: file, options: null, id: "_data", value: obj, password: password}            
            const url = this.server + "/store/save"
            const options = {body:JSON.stringify(json),headers:{"Content-type":"application/json; charset=UTF-8"}}
            this.sendData(url,options).then((response) => { if(callback) callback(response); })        
        } catch(error) {
            console.error(error)
            if(callback) callback({error:"Error saving data!"})
        }
    }
    
    merge(file, obj, callback, password)
    {
        try {
            if( !this.rateCheck() ) {
                setTimeout( ()=>{ this.merge(file,obj,callback,password) }, this.m_maxRate + 500 )
                return
            }
            const json = { key: this.m_apiKey, file: file, options: "merge", id: "_data", value: obj, password: password}
            const url = this.server + "/store/save"
            const options = { body:JSON.stringify(json), headers:{"Content-type":"application/json; charset=UTF-8"} }        
            this.sendData(url,options).then((response) => { if(callback) callback(response); })
        } catch(error) {
            console.error(error)
            if(callback) callback({error:"Error merging data!"})
        }
    }
    
    delete(file, callback, password)
    {
        try {
            if( !this.rateCheck() ) {
                setTimeout( ()=>{ this.delete(file,callback,password) }, this.m_maxRate + 500 )
                return
            }
                        
            const json = { key: this.m_apiKey, file: file, options: "delete", id: "_data", value: null, password: password}
            const url = this.server + "/store/save"
            const options = { body:JSON.stringify(json), headers:{"Content-type":"application/json; charset=UTF-8"} }        
            this.sendData(url,options).then((response) => { if(callback) callback(response); })
            
        } catch(error) {
            console.error(error)
            if(callback) callback({error:"Error deleting data!"})
        }        
    }
    
    load(file, callback, password)
    {
        try {
            if( !this.rateCheck() ) {
                setTimeout( ()=>{ this.load(file,callback,password) }, this.m_maxRate + 500 )
                return
            }
            
            var json = { key: this.m_apiKey, file: file, options: null, id: "_data", password: password };
            const url = this.server + "/store/load"
            const options = { body:JSON.stringify(json), headers:{"Content-type":"application/json; charset=UTF-8"}}       
            this.sendData(url,options).then((response) => { 
                response.data = response.message || "";
                if(callback) callback(response);
            })

        } catch(error) {
            console.error(error)
            if(callback) callback({error:"Error loading data!"})
        }        
    }
    
    list(file, callback)
    {
        try {
            if( !this.rateCheck() ) {
                setTimeout( ()=>{ this.list(file,callback) }, this.m_maxRate + 500 )
                return
            }

            if(!file) file = "";                                    
            var json = { key: this.m_apiKey, file: file, options: "list", id: "_data" };
            const url = this.server + "/store/load"
            const options = { body:JSON.stringify(json), headers:{"Content-type":"application/json; charset=UTF-8"}}
            this.sendData(url,options).then((response) => { 
                response.data = response.message || "";
                if(callback) callback(response); }
            )

        } catch(error) {
            console.error(error)
            if(callback) callback({error:"Error listing data!"})
        }        
    }
    
    upload(data, name, type, callback, password)
    {
        try {  
            if( !this.rateCheck() ) {
                //setTimeout( ()=>{ this.upload(data, name, type, callback, password) }, this.m_maxRate + 500 )
                //we don't want to keep trying to upload the same file so we'll just return
                return
            }

            var formData = new FormData();            
            const blob = typeof data=="string" ? this.b64toBlob(data, name, type) : data
            
            formData.append("file", blob);            
            formData.append("key", this.m_apiKey);
            formData.append("password", password);
            
            const url = this.server + "/upload-2"
            const options = { body:formData }     
            this.sendData(url,options).then((response) => { if(callback) callback(response); })

        } catch(error) {
            console.error(error)
            if(callback) callback({error:"Error uploading the file!"})
        }        
    }
    
    b64toBlob(b64Data, fileName='',contentType='', sliceSize=512) {
        try {
            const byteCharacters = atob(b64Data);
            const byteArrays = [];

            for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            const slice = byteCharacters.slice(offset, offset + sliceSize);

            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
            }    
            console.log(byteArrays);
            const blob = new File(byteArrays, fileName, {type: contentType});
            return blob;
        } catch(error) {
            console.error(error)
            return ""
        }
    }
}
