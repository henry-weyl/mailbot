function processInteractiveMessage(payload){
  if(payload.token!=SLACK_VERIFICATION_TOKEN){
    return;
  }
  var text='';
  var blocks=[];
  payload.actions.forEach(function(action){
    var command=action.text.text;
    if(command.match(/^Show entire thread/)){
      var threadid = action.value;
      var thread=GmailApp.getThreadById(threadid);
      if(thread==null){
        replyMessage(payload.response_url,{replace_original:true,text:'スレッドが見つかりませんでした',response_type: 'ephemeral'});
      }
      else{
        thread.getMessages().forEach(function(message){
          var maildesc=getMailDescription(getMessageInfo(message));
          text+=maildesc
          blocks.push({
            'type': 'section',
            'text': {
              'type': 'mrkdwn',
              'text': maildesc
            }
          },{
            'type': 'actions',
            'elements': [
              {
                'type': 'button',
                'text': {
                  'type': 'plain_text',
                  'emoji': true,
                  'text': 'Share message'
                },
                'style': 'primary',
                'value': message.getId()
              }
            ]
          });
        });
        replyMessage(payload.response_url,{replace_original:true,text:text,blocks:blocks,response_type: 'ephemeral'});
      }
      return 200;
    }
    else if(command.match(/^Share message/)){
      var messageid = action.value;
      var message = GmailApp.getMessageById(messageid);
      if(message==null){
        replyMessage(payload.response_url,{replace_original:true,text:'メッセージが見つかりませんでした',response_type: 'ephemeral'});
      }
      else{
        text='Shared by <@'+payload.user.id+'>\n'+getMailDescription(getMessageInfo(message));
        blocks=[{
          'type': 'section',
          'text': {
            'type': 'mrkdwn',
            'text': text
          }
        }];
        replyMessage(payload.response_url,{delete_original: true});
        postSlackMessage({
          token:SLACK_BOT_TOKEN,
          channel:payload.channel.id,
          text:text,
          blocks:JSON.stringify(blocks),
          unfurl_links:false
        });
      }
      return 200;
    }
    else if(command.match(/^Mark as read/)){
      var threadid = action.value;
      var thread=GmailApp.getThreadById(threadid);
      if(thread==null){
        return 200;
      }
      else{
        thread.markRead();
        publishView(payload.user.id)
        return 200;
      }
    }
    else if(command.match(/^Open card/)){
      if(action.url.match(/^https:\/\/trello.com\/c\//)){
        return 200;
      }
    }
  });
  return;
}