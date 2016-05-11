var Message_lr = new ParseObjectType("Message_lr")

$(document).ready(function() {

  var $postForm = $('#message-form');
  var $messageBoard = $('.message-board');
  var $keywordForm = $('#keyword-form')

  $keywordForm.on("submit", function(event){
    event.preventDefault();
    var $keyword = $('#keyword').val();
    var $context = $('#context').val();

    var keywordObj = {
      kind: "keyword",
      keyword: $keyword,
      context: $context
    }

  Message_lr.create(keywordObj, function(err, result){
    if (err) {
      console.log(err);
    } else {
      console.log(result);
      searchKeywords(keywordObj)
      $('.modal').modal('hide');
    }
  })
  })

  $postForm.on("submit", function(event) {

    event.preventDefault();

    var $title = $('#title').val();
    var $message = $('#message').val();

    var messageObj = {
      kind: "post",
      title: $title,
      text: $message,
      upVotes: 0
    };

    Message_lr.create(messageObj, function(err, result) {
      if (err) {
        console.error(err);
      } else {
        messageObj.objectId = result.objectId;
        renderMessage(messageObj);
        // searchKeywords(result);
        $('.modal').modal('hide');
      }
    });
  });

  // on initialization of app (when document is ready) get fan messages
  getPosts();

  function getPosts() {

    $messageBoard.on('click', '.fa', function(e) {
      var $this = $(this);
      if ($this.hasClass('vote-up')) {
        updateVote($this.closest('.message'));
      } else if ($this.hasClass('delete')) {
        removePost($this.closest('.message'));
      } else {
        console.error('IDK');
      }
    });

    function removePost($messageEl) {
      var messageId = $messageEl.data('id');

      Message_lr.remove(messageId, function(err) {
        if (err) {
          console.error(err);
        } else {
          $('[data-id="' + messageId + '"]').remove();
        }
      });
    }

    function updateVote($messageEl) {

      var messageId = $messageEl.attr('data-id');
      var upVotes = $messageEl.attr('data-upvotes');
      var voteCount = $messageEl.find(".vote-count")

      upVotes++;

      Message_lr.update(messageId, { upVotes: upVotes }, function(err, result) {
        if (err) {
          console.error(err);
        } else {
          $messageEl.attr('data-upvotes', upVotes);
          voteCount.html(upVotes)
        }
      });
    }

    Message_lr.getAll(function(err, messages) {
      if (err) {
        console.error(err);
      } else {
        for (i=0; i<messages.length; i++) {
          if (messages[i].kind === "post") {
            renderMessage(messages[i]);
          } else if (messages[i].kind === "keyword") {
            console.log(messages[i]);
            // searchKeywords(messages[i]);
          } else {
            console.log("idk");
          }
        }
      }
    });
  }

  function searchKeywords(keywordObj) {

      var keyword = keywordObj.keyword;
      var context = keywordObj.context;
      var re = new RegExp(keyword, "g");

      // if ($(".panel-body:contains('Rohingya')")) {
        var oldHTML =  $(".panel-body:contains('" + keyword + "')").html()
        var newHTML = oldHTML.replace(re, "<a href='#' data-toggle='popover' title='" + keyword + "' data-trigger='focus' data-placement='top' data-content='" + context + "'>" + keyword + "</a>") ;
        $(".panel-body:contains('" + keyword + "')").html(newHTML);
      // } else {
      //   console.log("idk");
      // }

    $('[data-toggle="popover"]').click(function(event){
      event.preventDefault();
      $('[data-toggle="popover"]').popover();
    })
  }

  function renderMessage(messageData) {
    var html = compile(messageData);
    $messageBoard.prepend(html);
  }

  function compile(messageData) {
    var source = $("#message-template").html();
    var template = Handlebars.compile(source);
    var html = template(messageData);
    return html;
  }

});
