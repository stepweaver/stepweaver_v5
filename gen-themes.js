const fs=require("fs");
const themes=require("./theme-data.json");
let css="/* Auto-generated theme definitions */
@layer theme {
";
for(const[name,t]of Object.entries(themes)){css+="  [data-theme=""+name+""] {
";for(const[k,v]of Object.entries(t)){css+="    --"+k+": "+v+";
";}css+="  }

";}css+="}
";fs.writeFileSync("C:/Users/stephen/source/stepweaver_v5/styles/themes.css",css);console.log("themes.css: "+css.split("
").length+" lines");