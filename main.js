const VERSION=1;
const path=require("path");
const https=require("https");
const socket=require("./lib/socket");
const{app,BrowserWindow,Menu,nativeImage,dialog,ipcMain}=require("electron");
async function getDefinitions(){return new Promise((resolve,reject)=>{https.get("https://187.be/pal/definitions.json",res=>{let data="";res.on("data",chunk=>{data+=chunk});res.on("end",()=>{resolve(JSON.parse(data))})}).on("error",err=>{reject(err)})})}
async function createWindow(){
	const win=new BrowserWindow({
		width:665,
		height:765,
		webPreferences:{
			nodeIntegration:!0,
			contextIsolation:!0,
			enableRemoteModule:!0,
            preload:path.join(__dirname,"lib/preload.js")
		},
        titleBarStyle:"hidden",
        titleBarOverlay:{
            height:44,
            color:"#6B44C7",
            symbolColor:"#FFF",
        },
        resizable:!1,
        maximizable:!1,
        transparent:!0,
	});
	win.loadFile("index.html");
    ///win.webContents.openDevTools();
    await socket.init(ipcMain,win,app,dialog,DEFINITIONS,VERSION)
    /*
	const menuTemplate=[{
			label:"File",
			submenu:[
                {
					label:"Open",
                    icon:icons.parse("open"),
					click:()=>console.log("Open clicked")
				},
				{
					label:"Save",
                    icon:icons.parse("save"),
					click:()=>console.log("Save clicked")
				},
				{
					type:"separator"
				},
				{
					label:"Exit",
                    icon:icons.parse("exit"),
					click:()=>app.quit()
				}
			]
		},
		{
			label:"Help",
			submenu:[{
				label:"About",
				click:()=>console.log("About clicked")
			}]
		}
	];
	const menu=Menu.buildFromTemplate(menuTemplate);
	Menu.setApplicationMenu(menu);
    */
}
app.on("window-all-closed",()=>{
	if(process.platform!=="darwin"){
		app.quit();
	}
});
app.on("activate",()=>{
	if(BrowserWindow.getAllWindows().length===0){
		createWindow();
	}
});
let DEFINITIONS=null;
(async()=>{
    DEFINITIONS=await getDefinitions();
    await app.whenReady();
    await createWindow();
})().then()