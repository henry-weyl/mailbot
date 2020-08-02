var WHOLE_EMAIL_CHANNEL='';
var SENT_EMAIL_CHANNEL='';
var ATTATCHED_EMAIL_CHANNEL='';
var ATTACTHED_FILE_CHANNELS=WHOLE_EMAIL_CHANNEL+','+ATTATCHED_EMAIL_CHANNEL;
var userlist=[
  {
    pattern:/〇(\s|　)*〇(\s|　)*(△(\s|　)*△|君|様|さ(\s|　)*ま)/,
    name:'〇〇△△',
    familyname:'〇〇',
    id:'',
    channel:''
  }
];
function searchMail(){
  const now = Math.floor((new Date()).getTime()/1000); 
  var cache = CacheService.getScriptCache();
  const lastexecution=parseInt(cache.get('lastexecution'));
  postMailNotification(getMailListAfter(now,lastexecution));
  cache.remove('lastexecution');
  cache.put('lastexecution', now.toString(),3*60*60);
}
function getMailListAfter(now,lastexecution){
  const searchTerms = 'after:'+ lastexecution;
  const threads = GmailApp.search(searchTerms);
  if(threads.length<1){
    return [];
  }
  var mailArray = [];
  const needlessfrom=/@(spam)\.(com|jp|org)/;
  const needlessto=/@(spam)\.(com|jp|org)/;
  threads.forEach(function(thread){
    var threadmsg='';
    thread.getMessages().forEach(function(msg){
      threadmsg+=msg.getPlainBody();
      var msgdate=Math.floor(msg.getDate().getTime()/1000)
      if(msgdate>=lastexecution && !msg.isDraft() && !needlessfrom.test(msg.getFrom()) && !needlessto.test(msg.getTo()) && msgdate<now){
        mailArray.push({
          subject:msg.getSubject(),
          from:msg.getFrom(),
          to:msg.getTo(),
          cc:msg.getCc(),
          release:msg.getDate(),
          body:msg.getPlainBody(),
          thread:threadmsg,
          link:thread.getPermalink(),
          label:thread.getLabels(),
          attachments:msg.getAttachments()
        });
      }
    })
  });
  if(mailArray.length<=1){return(mailArray);}
  mailArray.sort(function(a,b){
    if(a.release>b.release) return 1;
    if(a.release < b.release) return -1;
    return 0;
  });
  return(mailArray);
}

function postMailNotification(mailArray){
  if(mailArray.length<1){
    return;
  }
  mailArray.forEach(function(mail){
    var details=getMailDescription(mail);
    var mentions='';
    var response;
    if(mail.from.match(new RegExp(USER_ADDRESS))){
      postSlackText(WHOLE_EMAIL_CHANNEL,details);
      postSlackText(SENT_EMAIL_CHANNEL,details);
    }
    else{
      userlist.forEach(function(user){
        if(mail.thread.match(user.pattern)){
          mentions+='<@'+user.id+'>';
        }
      });
      console.log(mentions);
      postSlackText(WHOLE_EMAIL_CHANNEL,mentions+'\n'+details);
    }
    if(mail.attachments.length>0){
      postSlackText(ATTATCHED_EMAIL_CHANNEL,details);
      mail.attachments.forEach(
        function(file){
          postFile(ATTACTHED_FILE_CHANNELS,mail,file);
        });
    }
  });
}

function postSlackText(channel,details){
    var payload = {
      'token':SLACK_BOT_TOKEN,
      'channel':channel,
      'text': details,
      'unfurl_links':false,
    };
    var options = {
      'method' : 'POST',
      'payload' : payload
    };
    return(UrlFetchApp.fetch('https://slack.com/api/chat.postMessage', options));
}
function postFile(channel,mail,file){
 var payload={
   'token':SLACK_BOT_TOKEN,
   'channels':channel,
   'file':file.getAs(file.getContentType()),
   'filename':file.getName(),
   'initial_comment': '<'+mail.link+'|'+mail.subject+'>'+'\n'+mail.from,
   'title': file.getName()
 }
 var options = {
   'method' : 'POST',
   'payload' : payload
 };
 return(UrlFetchApp.fetch('https://slack.com/api/files.upload', options));
}