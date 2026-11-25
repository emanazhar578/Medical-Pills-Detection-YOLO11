const $ = id => document.getElementById(id);
let selected, previewUrl;
function select(file){
 if(!file) return;
 if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>10*1024*1024){$('status').textContent='Choose a JPG, PNG or WEBP image under 10 MB.';return;}
 selected=file; if(previewUrl) URL.revokeObjectURL(previewUrl); previewUrl=URL.createObjectURL(file);
 $('preview').src=previewUrl; $('preview').hidden=false; $('filename').textContent=file.name; $('detect').disabled=false; $('status').textContent='Image ready.';
 $('result').hidden=true; $('download').hidden=true; $('placeholder').hidden=false; $('rows').replaceChildren(); $('count').textContent='—'; $('mean').textContent='—';
}
$('file').addEventListener('change',e=>select(e.target.files[0]));
$('drop').addEventListener('dragover',e=>{e.preventDefault();$('drop').classList.add('active');});
$('drop').addEventListener('dragleave',()=>$('drop').classList.remove('active'));
$('drop').addEventListener('drop',e=>{e.preventDefault();$('drop').classList.remove('active');if(!$('file').disabled)select(e.dataTransfer.files[0]);});
$('confidence').addEventListener('input',e=>$('value').textContent=e.target.value+'%');
$('detect').addEventListener('click',async()=>{
 if(!selected)return; $('detect').disabled=true; $('file').disabled=true; $('confidence').disabled=true; $('status').textContent='Detecting pills…';
 const data=new FormData(); data.append('image',selected);data.append('confidence',$('confidence').value/100);
 try{const response=await fetch('/detect',{method:'POST',body:data});const result=await response.json();if(!response.ok)throw Error(result.error||'Detection failed');
 $('result').src=result.image;$('result').hidden=false;$('placeholder').hidden=true;$('download').href=result.image;$('download').hidden=false;$('count').textContent=result.count;
 $('mean').textContent=result.count?(result.detections.reduce((a,b)=>a+b.confidence,0)/result.count).toFixed(1)+'%':'—'; $('rows').replaceChildren();
 result.detections.forEach((d,i)=>{const tr=document.createElement('tr');[i+1,d.label,d.confidence.toFixed(1)+'%'].forEach(v=>{const td=document.createElement('td');td.textContent=v;tr.append(td);});$('rows').append(tr);}); $('status').textContent=`Completed: ${result.count} pills detected.`;
 }catch(e){$('status').textContent=e.message;}finally{$('detect').disabled=false;$('file').disabled=false;$('confidence').disabled=false;}
});
