function getMessageInfo(message,thread){
  if(thread==null){thread=message.getThread();}
  return({
    subject:message.getSubject(),
    body:message.getPlainBody(),
    release:message.getDate(),
    from:message.getFrom(),
    to:message.getTo(),
    link:thread.getPermalink(),
  });
}
function getThreadInfo(thread,limit){
  var first=thread.getMessages()[0];
  var body=first.getPlainBody();
  if(limit!=null){body=body.substring(0,limit)}
  return({
    subject:thread.getFirstMessageSubject(),
    body:body,
    release:thread.getLastMessageDate(),
    from:first.getFrom(),
    to:first.getTo(),
    threadid:thread.getId(),
    link:thread.getPermalink(),
  });
}
function getMailDescription(mail){
  var match=new RegExp('((\\n((>|\\s)(\\s|　)*>|(\\s|　)*(From|差出人|送信元)[:：](\\s|　)*["\']?\\s*'+USER_NAME+'\\s*["\']?))|'+USER_ADDRESS+'>>?(\\s|　)*のメール[：:]|'+USER_NAME+' wrote[：:])','m');  // /[^>,]+(\S>[^>,]+)*/m;
  var matched=match.exec(mail.body);
  var bodylast=mail.body.length-1;
  if(matched!==null){bodylast=matched.index}
  return(
         '*件名  :* <'+mail.link+'|'+mail.subject+'>'
          + '\n*差出人:* '+mail.from
          + '\n*宛先  :* '+mail.to
          + '\n*日時  :* '+mail.release.toString()
          + '\n```'+mail.body.slice(0, bodylast).replace(/(\n\s+\n)+/g,'\n\n')+'```\n'
  );
}
function getTrelloCardDescription(card){
  var header=' <'+card.shortUrl+'|'+card.name+'> \n'+card.dateLastActivity+'\n';
  if(card.desc==''||card.desc.match(/^\s+$/m))return(header);
  else{
    return(header+'```'+card.desc+'```\n');
  }
}
function replyMessage(response_url,payload){
  var response={payload:JSON.stringify(payload),method:'POST'};
  return(UrlFetchApp.fetch(response_url,response));
}
function postSlackMessage(payload){
    var options = {
      'method' : 'POST',
      'payload' : payload
    };
    return(UrlFetchApp.fetch('https://slack.com/api/chat.postMessage', options));
}
function searchTrello(query){
    return(JSON.parse(UrlFetchApp.fetch('https://api.trello.com/1/search?query='+encodeURI(query)+'&idBoards=mine&idOrganizations='+TRELLO_IDORGANIZATIONS+'&modelTypes=cards&board_fields=name,shortUrl%2CidOrganization&boards_limit=10&card_fields=all&cards_limit=10&cards_page=0&card_board=true&card_list=true&card_members=false&card_stickers=false&card_attachments=false&organization_fields=name%2CdisplayName&organizations_limit=10&member_fields=avatarHash%2CfullName%2Cinitials%2Cusername%2Cconfirmed&members_limit=10&partial=false&key='+TRELLO_KEY+'&token='+TRELLO_TOKEN).getContentText()));
}
