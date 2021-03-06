var hand;
var action;
var used;
var game;
var player;
var button_use;
var button_draw;
var button_end;
var discard_area;
var moves;
var opponent_hand;
var opponent;

function select_card(e){
  var self = $(this);
  self.removeClass('card-lg').addClass('card-sm');
  action.append(self);
  possible_moves(e);
}
function unselect_card(e){
  var self = $(this);
  self.removeClass('card-sm').addClass('card-lg');
  hand.append(self);
  possible_moves(e);
}
function discard(e){
  console.log("in the discard");
  var self = $(this);
  //var player = $('#player');
  $.ajax({
    type: "GET",
    url: ["/discard", game.data('game_id'), player.data('player_id'), self.data("id")].join("/"), //"/discard/" + game.data('game_id') + "/" + player.data('player_id') + "/" + self.data("id"),
    dataType: "json"
  }).done(function(msg){
    console.log("Card discarded!");
    console.log(msg);
    hand.find('.card').remove();
    $.each( msg['hands'], function(i, c){
      hand.append(create_card(c));
    });
    $('.secondary .discard .card').remove();
    $('.secondary .discard').append(create_card(msg['discard'],false,true));
    hand.off( 'click', '.draw.card', discard );
    hand.on( 'click', '.card', select_card );
  });
}
function use_cards(e){
  //var player = $('#player');
  var card_ids = [];
  action.find('.card').each(function(){
    var self = $(this);
    card_ids.push({
      id: self.data('id')
    });
  });
  console.log(card_ids);
  $.ajax({
    type: "GET",
    url: ["/use_cards", game.data('game_id'), player.data('player_id')].join("/"), //"/use_cards/" + game.data('game_id') + "/" + player.data('player_id'),
    data: { cards: card_ids },
    dataType: "json"
  }).done(function(msg){
    console.log("card used!");
    console.log(msg);
    hand.find('.card').remove();
    $.each( msg['hands'], function(i, c){
      hand.append(create_card(c));
    });
    action.find('.card').remove();
    used.find('.card').remove();
    $.each( msg['cards_used'], function(i, c){
      used.append(create_card(c, false, true));
    });
  });
}

function draw_cards(e){
  //var player = $('#player');
  hand.off( 'click', '.card', select_card );
  $.ajax({
    type: "GET",
    url: ["/draw", game.data('game_id'), player.data('player_id')].join("/"), //"/draw/" + game.data('game_id') + "/" + player.data('player_id'),
    dataType: "json"
  }).done(function(msg){
    console.log("card drawed");
    console.log(msg);
    $.each(msg, function(i, c){
      hand.append(create_card(c, true));
    });
    hand.on( 'click', '.draw.card', discard );
  });
}
function turn_end(e){
  //var player = $('#player');
  $.ajax({
    type: "GET",
    url: ["/turn_end", game.data('game_id'), player.data('player_id')].join("/"), //"/turn_end/" + game.data('game_id') + "/" + player.data('player_id')
    dataType: "json"
  }).done(function(msg){
    console.log("turn ended");
    console.log(msg);
    action.find('.card').each(function(idx, elem){
      $(elem).click();
    });
    disable_activity();
    interval = setInterval(request_status, 1000);
  });
}
function request_status(){
  console.log( "requesting status" );
  if( game.length ){
    $.ajax({
      type: "GET",
      url: ["/info", game.data('game_id'), player.data('player_id')].join("/"), //"/info/" + game.data('game_id') + "/" + player.data('player_id'),
      dataType: "json"
    }).done( update_status );
  } else {
    clearInterval(interval);
  }
}
function recycle(e){
  self = $(this);
  $.ajax({
    type: "GET",
    url: ["/recycle", game.data('game_id'), player.data('player_id'), self.data("id")].join("/"), //"/recycle/" + game.data('game_id') + "/" + player.data('player_id') + "/" + self.data("id"),
    dataType: "json"
  }).done(function(msg){
    console.log("recycled");
    console.log(msg);
    discard_area.find('.card').remove();
  });
}

function possible_moves(e){
  var card_ids = [];
  action.find('.card').each(function(){
    var self = $(this);
    card_ids.push( self.data('id') );
  });
  console.log(card_ids);
  $.ajax({
    type: "GET",
    url: ["/possible_moves", game.data('game_id'), player.data('player_id')].join("/"), //"/possible_moves/" + game.data('game_id') + "/" + player.data('player_id'),
    data: { cards: card_ids }
  }).done(function(msg){
    console.log("possible_moves:");
    console.log(msg);
    rules_area = $('#common .moves .row');
    rules_area.empty();
    $.each( msg, function(i, c){
      rules_area.append($("<div/>").addClass("col-md-4 rule").data("id", c.id).text(c.name));
    });
  });
}

function perform(e){
  var card_ids = [];
  action.find('.card').each(function(){
    var self = $(this);
    card_ids.push( self.data('id') );
  });
  self = $(this);
  $.ajax({
    type: "GET",
    url: ["/perform", game.data('game_id'), player.data('player_id'), self.data("id")].join("/"),
    data: { cards: card_ids },
    dataType: "json"
  }).done(function(msg){
    console.log("rule performed");
    console.log(msg);
    update_status(msg);
  });
}

function select_card_from_opponent(e){
  var card_ids = opponent_hand.find('.card.selected').map(function(i, e){
    return $(this).data('id');
  }).get();
  console.log("selected cards:");
  console.log(card_ids);
  $.ajax({
    type: "GET",
    url: ["/select", game.data('game_id'), player.data('player_id'), opponent.data('opponent_id')].join("/"),
    data: { cards: card_ids },
    dataType: "json"
  }).done(function(msg){
    console.log("cards selected");
    console.log(msg);
    update_status(msg);
  });
}

function disable_activity(){
  hand.off( 'click' );
  action.off( 'click' );
  button_use.off( 'click' );
  button_draw.off( 'click' );
  button_end.off( 'click' );
  discard_area.off( 'click' );
  moves.off( 'click' )
}
