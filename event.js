function processEvent(postData) {
  if(postData.token!=SLACK_VERIFICATION_TOKEN){return;}
  if(postData.type == 'url_verification') {
    return ContentService.createTextOutput(postData.challenge).setMimeType(ContentService.MimeType.TEXT);
  }
  var event=postData.event;
  if(event.type == 'app_home_opened'){
    publishView(event.user);
    return 200;
  }
}
function publishView(user_id){
  var view={
    'type':'home',
    'blocks':createAppHomeBlocks()
  }
  var payload={
    token:SLACK_BOT_TOKEN,
    user_id:user_id,
    view:JSON.stringify(view)
  }
  var options = {
    'method' : 'POST',
    'payload' : payload
  };
  return(UrlFetchApp.fetch('https://slack.com/api/views.publish', options));
}
function createAppHomeBlocks(){
  var blocks=[
    {
      'type': 'header',
      'text': {
        'type': 'plain_text',
        'text': '現在のタスク'
      }
    },
    {
      'type': 'divider'
    }];
  var threads=GmailApp.search('is:unread');
  blocks.push(
    {
      'type': 'section',
      'text': {
        'type': 'mrkdwn',
        'text': '*未読メール:* '+threads.length+'件'
      }
    });
  threads.forEach(function(thread){
    message=thread.getMessages()[thread.getMessageCount()-1];
    blocks.push(
      {
        'type': 'section',
        'text': {
          'type': 'mrkdwn',
          'text': '<'+thread.getPermalink()+'|'+message.getSubject()+'>'
          + '\n差出人: '+message.getFrom()
          + '\n宛先  : '+message.getTo()
          + '\n日時  : '+message.getDate().toString()
        },
        'accessory': {
          'type': 'button',
          'text': {
            'type': 'plain_text',
            'text': 'Mark as read',
            'emoji': true
          },
          'value': thread.getId()
        }
      });
  });
  var cards=searchTrello('list:待ち is:open').cards;
  blocks.push(
    {
      'type': 'divider'
    },
    {
      'type': 'section',
      'text': {
        'type': 'mrkdwn',
        'text': '*待ち:* '+cards1.length+'件'
      }
    });
  cards.forEach(function(card){
    blocks.push(
      {
        'type': 'section',
        'text': {
          'type': 'mrkdwn',
          'text': '<'+card.shortUrl+'|'+card.name+'>'
          +' in <'+card.board.shortUrl+'|'+card.board.name+'>\n'
          +card.dateLastActivity+'\n'
        },
        'accessory': {
          'type': 'button',
          'text': {
            'type': 'plain_text',
            'text': 'Open card',
            'emoji': true
          },
          'url': card.shortUrl
        }
      });
  });
  return(blocks);
}
