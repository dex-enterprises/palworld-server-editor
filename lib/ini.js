const fs=require("fs");
const path=require("path");
function parseINIString(data){
    const result={};
    const sectionMatch=data.match(/^\[(.*?)\]/);
    if(!sectionMatch)return(result);
    const sectionName=sectionMatch[1];
    result[sectionName]={};
    const optionsString=data.substring(data.indexOf("=(")+2,data.lastIndexOf(")"));
    const optionsPairs=optionsString.split(",").map(pair=>pair.trim());
    optionsPairs.forEach(pair=>{
        const index=pair.indexOf("=");
        if(index===-1)return;
        const key=pair.substring(0,index).trim();
        let value=pair.substring(index+1).trim();
        try{
            value=JSON.parse(value.replace(/'/g,'"'))
        }catch(ex){
            if(value==="")value=null;else
            if(!isNaN(value))value=Number(value);else
            if(value.toLowerCase()==="true"||value.toLowerCase()==="false")value=value.toLowerCase()==="true";
        }
        result[sectionName][key]=value
    })
    return(result)
}
exports.decode=filePath=>{
    return new Promise((resolve,reject)=>{
        fs.readFile(filePath,"utf8",(err,data)=>{
            if(err){
                reject(err);
                return;
            }
            const filteredData=data.split(/\r?\n/).filter(line=>!line.trim().startsWith(";")&&!line.trim().startsWith("#")).join("\n");
            if(!filteredData.startsWith("[/Script/Pal.PalGameWorldSettings]")){
                reject(new Error("File does not start with the required header"));
                return;
            }
            let R=parseINIString(filteredData);
            resolve(R?.["/Script/Pal.PalGameWorldSettings"]||{})
        })
    })
}
exports.encode=(json,definitons)=>{
    return new Promise((resolve,reject)=>{
        let L=[];
        let R="[/Script/Pal.PalGameWorldSettings]\nOptionSettings=(";
        for(const key of Object.keys(json)){
            if(key.startsWith("___"))continue;
            let value=json[key];
            let type=definitons?.[key];
            if(type)type=type?.type;
            if(type){
                if(type==="bool")value=value?"True":"False";else
                if(type==="float")value=parseFloat(value).toFixed(6);else
                if(type==="string"||type==="password"||type==="radio")value=`"${value}"`;
            }else{
                if(typeof(value)==="string")value=`"${value}"`;else
                if(typeof(value)==="boolean")value=value?"True":"False";else
                if(typeof(value)==="number"&&!Number.isInteger(value))value=parseFloat(value).toFixed(6);
            }
            L.push(`${key}=${value||'""'}`)
        }
        R+=L.join(",")+")";
        resolve(R.trim())
    })
}
exports.save=async(filePath,content)=>{
    try{
        await fs.promises.writeFile(filePath,content,"utf8");
        return(filePath)
    }catch(ex){
        console.error("ini.save(filePath,content)","Error saving the file:",ex);
        throw(ex)
    }
}
module.exports=exports