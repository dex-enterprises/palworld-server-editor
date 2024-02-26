let lastFilePath=!1;
const ini=require("./ini");
const notify=async(win,dialog,message,type="info",buttons=[])=>{
    await dialog.showMessageBox(win,{
        type,
        message,
        buttons,
        title:"Palworld Server Editor"
    })
}
exports.init=async(ipcMain,win,app,dialog,DEFINITIONS,VERSION)=>{
    const web=win?.webContents||!1;
    ipcMain.on("api",async(e,cmd,args)=>{
        ///console.log("[API]",cmd,args||null);
        try{
            if(cmd==="minimize-app"){
                win.minimize()
            }else
            if(cmd==="close-app"){
                app.quit()
            }else
            if(cmd==="version"){
                web.send("version",VERSION?parseFloat(VERSION).toFixed(1):"1.0")
            }else
            if(cmd==="definitions"){
                web.send("definitions",DEFINITIONS||{})
            }else
            if(cmd==="open-file"){
                let R=await dialog.showOpenDialog(win,{
                    properties:["openFile"],
                    filters:[
                        {name:"Config Files",extensions:["ini"]},
                        {name:"Backup Files",extensions:["bak"]},
                        {name:"Text Files",extensions:["txt"]},
                    ]
                })
                try{
                    if(!R.canceled){
                        try{
                            lastFilePath=R.filePaths[0];
                            web.send("open-file",await ini.decode(R.filePaths[0]));
                            await notify(win,dialog,"Your Palworld Server Settings file is imported")
                        }catch(ex){
                            web.send("open-file",{});
                            console.log("[API]","open-file:",ex);
                            await notify(win,dialog,"This PalWorldSettings.ini file is invalid!","error",["Oops"])
                        }
                    }
                }catch(ex){
                    web.send("open-file",{});
                    console.log("[API]","open-file:",ex);
                    await notify(win,dialog,"Something went wrong, please try again.","warning")
                }
            }else
            if(cmd==="save-file"&&args){
                try{
                    let options={
                        title:"Save Palworld Settings file",
                        filters:[
                            {name:"Config Files",extensions:["ini"]},
                            {name:"Backup Files",extensions:["bak"]},
                            {name:"Text Files",extensions:["txt"]},
                        ],
                        properties:["showOverwriteConfirmation"]
                    };
                    if(lastFilePath)options.defaultPath=lastFilePath;
                    const{filePath}=await dialog.showSaveDialog(win,options);
                    const fp=await ini.save(filePath,await ini.encode(args,DEFINITIONS));
                    await notify(win,dialog,"Palworld Settings file saved to "+fp)
                    web.send("save-file",fp)
                }catch(ex){
                    web.send("save-file",!1);
                    console.log("[API]","save-file:",ex);
                    await notify(win,dialog,"Something went wrong, please try again.","warning")
                }
            }
        }catch(ex){
            console.log("[API]","Error:",ex)
        }
    })
}
module.exports=exports