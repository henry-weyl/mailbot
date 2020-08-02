function processSlashCommand(parameter){
  if(parameter.token!=SLACK_VERIFICATION_TOKEN || parameter.command != SLACK_SLASHCOMMAND){
    return;
  }
  var command = parameter.text;
  var responsetext='';
  var blocks=[];
  if(command.match(/^search mail/im)){
    var query=command.replace(/^search mail (.*)/im,'$1');
    const threads = GmailApp.search(query); //条件にマッチしたスレッドを取得
    if(threads.length<1){
      responsetext=query+' はヒットしませんでした';
    }
    else if(threads.length>7){
      responsetext=query+' で'+threads.length+'件ヒットしました'
    }
    else{
      responsetext=query+' で'+threads.length+'件ヒットしました\n\n'
      var threadlist=[];
      threads.forEach(function(thread){
        threadlist.push(getThreadInfo(thread,200));
      });
      threadlist.forEach(function(mail){
        var maildesc=getMailDescription(mail);
        responsetext+=maildesc+'\n';
        blocks.push({
          'type': 'section',
          'text': {
            'type': 'mrkdwn',
            'text': maildesc
          }
        });
        blocks.push({
          'type': 'actions',
          'elements': [
            {
              'type': 'button',
              'text': {
                'type': 'plain_text',
                'emoji': true,
                'text': 'Show entire thread'
              },
              'style': 'primary',
              'value': mail.threadid
            }
          ]
        });
      });
    }
    var response = {blocks:JSON.stringify(blocks),response_type:'ephemeral'};
    return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
  }
  else if(command.match(/^search trello/im)){
    var query=command.replace(/^search trello (.*)/im,'$1');
    responsetext="";
    var trellosearch=searchTrello(query);
    var cards = JSON.parse(trellosearch.getContentText()).cards;
    if(cards.length<1){responsetext=query+' はヒットしませんでした';}
    else{
      responsetext=query+' で'+cards.length+'件ヒットしました\n\n';
      cards.forEach(function(card){
        responsetext+=getTrelloCardDescription(card)+'\n';
      });
    }
    var response = { text: responsetext,response_type:'ephemeral'};
    return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
  }
  var response={
    text:SLACK_SLASHCOMMAND+' コマンドをお使いいただきありがとうございます\n'+
    'search mail or trello の後に検索文を入力していただけると\n'+
    'mailの場合は'+USER_ADDRESS+'内のスレッドを、\ntrelloの場合はcardを検索いたします。\n'+
    'mailなら*フルネーム* 、label:やafter:20??-(01〜12)が、\n'+
    'trelloなら、label:やboard:、created:20??を使うとヒットしすぎずに済みます。\n'+
    'どちらもタイトルはリンクになっておりますので'+USER_ADDRESS+'にログインした後、アクセスして下さい',
    response_type:'ephemeral'
  }
  return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
}