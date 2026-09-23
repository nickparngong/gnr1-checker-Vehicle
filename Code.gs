const SPREADSHEET_ID="1XV_ETbWJFCrAPuYv59KVzq7vGbMVDBAWBweTf2QjGGE";
const SHEET_NAME="Vehicle_Master";
function doGet(e){
  const plate=e?.parameter?.plate||"";
  try{
    const ss=SpreadsheetApp.openById(SPREADSHEET_ID);
    const sh=ss.getSheetByName(SHEET_NAME)||ss.getSheets()[0];
    const rows=sh.getDataRange().getDisplayValues();
    if(rows.length<2)return out({found:false,error:"ไม่พบข้อมูลใน Sheet"});
    const h=rows[0].map(x=>String(x).trim()), pi=h.indexOf("ทะเบียนรถ");
    if(pi<0)return out({found:false,error:"ไม่พบคอลัมน์ ทะเบียนรถ"});
    const target=norm(plate);
    for(let i=1;i<rows.length;i++)if(norm(rows[i][pi])===target){
      const v={found:true};h.forEach((k,j)=>v[k]=rows[i][j]);return out(v);
    }
    return out({found:false,searched:plate});
  }catch(err){return out({found:false,error:String(err?.message||err)})}
}
function norm(x){return String(x||"").replace(/\s+/g,"").replace(/-/g,"").trim().toUpperCase()}
function out(x){return ContentService.createTextOutput(JSON.stringify(x)).setMimeType(ContentService.MimeType.JSON)}