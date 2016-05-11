var Message_lr = new ParseObjectType("Message_lr")

$(document).ready(function() {

  var $form = $('#message-form');
  var $messageBoard = $('.message-board');

  $form.on("submit", function(event) {

    event.preventDefault();

    var $title = $('#title').val();
    var $keyword = $('#keyword').val();
    var $message = $('#message').val();
    var teaser = $message.trimToLength(120)

    var messageObj = {
      title: $title,
      keyword: $keyword,
      text: $message,
      teaser: teaser,
      upVotes: 0
    };

    Message_lr.create(messageObj, function(err, result) {
      if (err) {
        console.error(err);
      } else {
        messageObj.objectId = result.objectId;
        renderMessage(messageObj);
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
        console.log(messages)
        messages.forEach(renderMessage);
        searchKeywords(messages);
      }
    });
  }

  function searchKeywords(array) {
    for (i=0; i<array.length; i++) {
      var keyword = array[i].keyword;
      var title = array[i].title;
      var teaser = array[i].teaser;
      var re = new RegExp(keyword, "g");
      if ($(".panel-body:contains('" + keyword + "')")) {
        var newHTML =  $(".panel-body:contains('" + keyword + "')").html().replace(re, "<a href='#' data-toggle='popover' title='" + title + "' data-trigger='focus' data-placement='top' data-content='" + teaser + "'>" + keyword + "</a>") ;
        $(".panel-body:contains('" + keyword + "')").html(newHTML);
      } else {
        console.log("idk");
      }
    }
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

  String.prototype.trimToLength = function(m) {
  return (this.length > m)
    ? jQuery.trim(this).substring(0, m).split(" ").slice(0, -1).join(" ") + "..."
    : this;
};

});
