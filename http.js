function doPost(e){
  var parameter=e.parameter;
  if(parameter.hasOwnProperty('payload'))
  {
    var payload = JSON.parse(decodeURIComponent(parameter.payload));
    return(processInteractiveMessage(payload));
  }
  else if(parameter.hasOwnProperty('text')){
    return(processSlashCommand(parameter));
  }
  else{
    var postData;
    try{
       postData=JSON.parse(e.postData.getDataAsString());
    }
    catch(e){return;}
    return(processEvent(postData));
  }
}
