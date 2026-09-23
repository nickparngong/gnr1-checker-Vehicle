const SPREADSHEET_ID="1XV_ETbWJFCrAPuYv59KVzq7vGbMVDBAWBweTf2QjGGE";
function doGet(e){
  const plate=e&&e.parameter?e.parameter.plate||"";
  try{
    const ss=SpreadsheetApp.openById(SPREADSHEET_ID), target=norm(plate);
    if(!target)return out({found:false,error:"กรุณาระบุทะเบียนรถ"});
    for(const sh of ss.getSheets()){
      const rows=sh.getDataRange().getDisplayValues(); if(rows.length<2)continue;
      const h=rows[0].map(x=>String(x).trim()); let pi=h.indexOf("ทะเบียนรถ"); if(pi<0)pi=h.findIndex(x=>x.includes("ทะเบียน")); if(pi<0)pi=0;
      for(let r=1;r<rows.length;r++) if(norm(rows[r][pi])===target){
        const v={found:true,sheet:sh.getName()}; h.forEach((k,j)=>{if(k)v[k]=rows[r][j]});
        if(!v["เบอร์โทรประกัน"]&&rows[r][9])v["เบอร์โทรประกัน"]=rows[r][9];
        if(!v["ลิงก์แจ้งซ่อม"]&&rows[r][10])v["ลิงก์แจ้งซ่อม"]=rows[r][10];
        return out(v);
      }
    }
    return out({found:false,searched:plate,error:"ไม่พบทะเบียนนี้ในทุก Sheet"});
  }catch(err){return out({found:false,error:String(err&&err.message?err.message:err)})}
}
function norm(x){return String(x||"").replace(/\s+/g,"").replace(/-/g,"").trim().toUpperCase()}
function out(x){return ContentService.createTextOutput(JSON.stringify(x)).setMimeType(ContentService.MimeType.JSON)}
