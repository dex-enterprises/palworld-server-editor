const{contextBridge,ipcRenderer}=require("electron");
function arrayToObject(arr){
    return arr.reduce((obj,item,index)=>{
        obj[index]=item;
        return(obj)
    },{})
}
contextBridge.exposeInMainWorld("server",{
    on:(cmd,func)=>ipcRenderer.on(cmd,(e,...args)=>func(...args)),
    send:(cmd,args={})=>ipcRenderer.send("api",cmd,Array.isArray(args)?arrayToObject(args):(typeof(args)!=="object"?{"0":args}:args))
})