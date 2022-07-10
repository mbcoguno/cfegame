// Configure your import map in config/importmap.rb. Read more: https://github.com/rails/importmap-rails

import "@hotwired/turbo-rails";
import "jquery";
import "jquery_ujs";
import "bootstrap";

// TODO: Move following files as separcate modules.
// app.js
var app;

$(document).on("turbo:load", function () {
  if ($('#maincontainer').length) {
    app = new Game();
  } else if (app && app.timerID) {
    clearInterval(app.timerID);
  }
});

// geme.es6.js
class Game {
  constructor() {
    //this.info = JSON.parse(JSON.stringify(info));
    //this.view = view;
    //console.log( info );
    this.view = new GameField();
    this.update_status = this.update_status.bind(this);
    this.request_status();
  }

  update_status(json) {
    console.log("status updated");
    console.log(json);
    console.log("timerID = " + this.timerID);
    // 如果沒有資料回傳，直接結束不做事。
    if (!json) {
      return;
    }
    this.info = json;
    this.view.update_view(json);
    console.log("myturn = " + json.myturn);
    if (json['status'] == "prepare") {
      this.timerID = setInterval(
        () => this.find_opponent(),
        1000
      );
    } else if (json.myturn) {
      this.timerID = clearInterval(this.timerID);
      if (json['current']['members'][0]['annex']['freeze']) {
        this.turn_end();
      } else if (json['current']['members'][0]['hands'].length == 0 && json['current']['action'].length == 0) {
        this.draw_cards();
      }
    } else {
      if (typeof this.timerID == "undefined") {
        console.log("setting refreshing timer");
        this.timerID = setInterval(
          () => this.request_status(),
          1000
        );
      }
    }
  }

  find_opponent() {
    console.log("find_opponent");
    let url = [
      this.info['id'],
      "players",
      this.info['current']['members'][0]['id'],
      "find_opponent"
    ].join("/");
    fetch(url)
      .then((response) => response.json())
      .then(this.update_status);
  }

  request_status() {
    console.log("requesting status");
    let url = [
      $("#maincontainer").data("game_id"),
      "players",
      $("#player").data("id"),
      "info"
    ].join("/");
    fetch(url)
      .then((response) => response.json())
      .then(this.update_status);
  }

  card_selected(card, in_hand) {
    console.log("in card_selected");
    console.log(card);
    let cid = card.data("id");
    let ps = this.info['current'];
    let action = ps['action'];
    let hands = ps['members'][0]['hands'];
    let from = null, to = null;
    if (in_hand) {
      from = hands;
      to = action;
    } else {
      from = action;
      to = hands;
    }
    let target_index = from.findIndex((elem, index) => {
      return elem.id == cid;
    });
    let removed_cards = from.splice(target_index, 1);
    to.push(removed_cards[0]);
    this.request_possible_moves(action);
  }

  confirm_choice() {
    var selected_ids = this.collect_cards(this.info['choices'], "selected");
    if (this.info['opponent']['members'][0]['annex']['showhand']) {
      this.select_opponent_hands(selected_ids);
    } else {
      this.fill_self_hands(selected_ids);
    }
  }

  fill_self_hands(selected_ids) {
    if (selected_ids.length > 1) {
      console.log("discard too manay!");
      return;
    }
    console.log(selected_ids);
    let url = [
      this.info['id'],
      "players",
      this.info['current']['members'][0]['id'],
      "discard"
    ].join("/");
    var self = this;
    $.ajax({
      type: "GET",
      url: url,
      data: { cards: selected_ids[0] }
    }).done((data) => {
      console.log("discard !");
      console.log(data);
      self.info['current']['members'][0]['hands'] = data['hands'];
      self.info['discard'] = data['discard'];
      console.log(self.info);
      self.update_status(self.info);
      $('#choose').one('hidden.bs.modal', (e) => {
        self.turn_end();
      });
      $('#choose').modal('hide');
    });
  }

  select_opponent_hands(selected_ids) {
    console.log(selected_ids);
    let url = [
      this.info['id'],
      "players",
      this.info['current']['members'][0]['id'],
      "select"
    ].join("/");
    var self = this;
    $.ajax({
      type: "GET",
      url: url,
      data: { cards: selected_ids, opponent: this.info['opponent']['members'][0]['id'] }
    }).done((data) => {
      console.log("discard !");
      console.log(data);
      self.update_status(data);
      $('#choose').one('hidden.bs.modal', (e) => {
        self.draw_cards();
      });
      $('#choose').modal('hide');
    });
  }

  turn_end() {
    let url = [
      this.info['id'],
      "players",
      this.info['current']['members'][0]['id'],
      "turn_end"
    ].join("/");
    var self = this;
    $.ajax({
      type: "GET",
      url: url
    }).done((data) => {
      console.log("turn end");
      console.log(data);
      self.update_status(data);
    });
  }

  collect_cards(action, condition = null) {
    let filtered = action;
    if (condition != null) {
      filtered = filtered.filter((card, index) => {
        return card[condition];
      });
    }
    let card_ids = filtered.map((card, index) => {
      return card.id;
    });
    return card_ids;
  }

  request_possible_moves(action) {
    console.log("request possible moves");
    let card_ids = this.collect_cards(action);
    let url = [
      this.info['id'],
      "players",
      this.info['current']['members'][0]['id'],
      "possible_moves"
    ].join("/");
    var self = this;
    $.ajax({
      type: "GET",
      url: url,
      data: { cards: card_ids }
    }).done((data) => {
      console.log("possible_moves:");
      console.log(data);
      self.info['possible_moves'] = data.map((rule, index) => {
        return rule;
      });
      console.log(self.info);
      self.update_status(self.info);
    });
  }

  perform_rule(rule) {
    let action = this.info['current']['action'];
    let card_ids = this.collect_cards(action);
    console.log(rule.data("id"));
    let url = [
      this.info['id'],
      "players",
      this.info['current']['members'][0]['id'],
      "perform"
    ].join("/");
    var self = this;
    $.ajax({
      type: "GET",
      url: url,
      data: { cards: card_ids, rule: rule.data("id") }
    }).done((data) => {
      console.log("rule performed");
      console.log(data);
      self.update_status(data);
      if (data['opponent']['members'][0]['annex']['showhand']) {
        self.select_cards(data['opponent']['members'][0]['hands']);
      } else {
        self.draw_cards();
      }
    });
  }

  draw_cards() {
    let url = [
      this.info['id'],
      "players",
      this.info['current']['members'][0]['id'],
      "draw"
    ].join("/");
    var self = this;
    $.ajax({
      type: "GET",
      url: url,
      dataType: "json"
    }).done((data) => {
      console.log("card drawed");
      console.log(data);
      this.info['choices'] = data.map((card, index) => {
        card.selected = false;
        return card;
      });
      console.log(this.info);
      this.view.update_view(this.info);
      $('#choose').modal('show');
    });
  }

  select_cards(hands) {
    this.info['choices'] = hands.map((card, index) => {
      card.selected = false;
      return card;
    });
    console.log(this.info);
    this.view.update_view(this.info);
    $('#choose').modal('show');
  }

  toggle_choice(clicked) {
    this.info['choices'] = this.info['choices'].map((card, index) => {
      if (card.id == clicked.data('id')) {
        card.selected = !(card.selected);
      }
      return card;
    });
  }

  recycle(card) {
    let url = [
      this.info['id'],
      "players",
      this.info['current']['members'][0]['id'],
      "recycle"
    ].join("/");
    var self = this;
    $.ajax({
      type: "GET",
      url: url,
      data: { cards: card.data("id") }
    }).done((data) => {
      console.log("recycled");
      console.log(data);
      self.update_status(data);
    });
  }

};

// game_field.js
class GameField {
  constructor() {
    $("#player .action").on("click", ".card", (e) => {
      app.card_selected($(e.target), false);
    });
    $("#player .hand").on("click", ".card", (e) => {
      app.card_selected($(e.target), true);
    });
    $("#moves").on("click", ".rule", (e) => {
      app.perform_rule($(e.target));
    });
    $("#choose").on("click", "button", (e) => {
      app.confirm_choice();
    });
    $("#choose").on("click", ".card", (e) => {
      console.log("in click choose");
      $(e.target).toggleClass("selected");
      app.toggle_choice($(e.target));
    });
    $(".secondary .discard").on("click", ".card", (e) => {
      app.recycle($(e.target));
    });
  }

  update_view(game_data) {
    var cards_data;
    var show;
    $(".secondary .discard").empty().append(this.generate_card(game_data.discard, true));
    var message = game_data.status == "over" ?
      (game_data.winning ? "You Win!" : "You Lose") :
      (game_data.myturn ? "Your Turn" : "Opponent Turn");
    $("#message_field").text(message);
    this.display_player(true, game_data.current);
    this.display_player(false, game_data.opponent);
    $("#field").text(game_data.field);
    $("#choose .modal-body").empty().append(this.generate_card_list(game_data.choices, true, false));
    $("#moves .row").empty().append(this.generate_rule_list(game_data.possible_moves));
  }

  display_player(is_current, data) {
    var html_id;
    var visible;
    var action_cards;
    var used_cards;
    var hero = data.members[0].annex.hero ? data.members[0].annex.hero : "無職業";
    // 防止對手尚未出現時，opponent物件不存在的問題。
    if (!data.members[0]) {
      data.members[0] = { "last_acts": [], "hands": [], "shield": 0, "star_history": [] };
    }

    if (is_current) {
      html_id = "#player";
      visible = true;
      action_cards = this.generate_card_list(data.action, true, true);
      used_cards = this.generate_last_act(data.members[0].last_acts[0]);
    } else {
      html_id = "#opponent";
      visible = false;
      action_cards = this.generate_last_act(data.members[0].last_acts[0]);
      used_cards = this.generate_last_act(data.members[0].last_acts[1]);
    }
    $(html_id + " .hand").empty().append(this.generate_card_list(data.members[0].hands, visible, false));
    $(html_id + " .life").empty().append(data.life);
    $(html_id + " .shield").empty().append(data.members[0].shield);
    $(html_id + " .action").empty().append(action_cards);
    $(html_id + " .used").empty().append(used_cards);
    $(html_id + " .star_history").empty().append(this.generate_star_history(data.members[0].star_history));
    $(html_id + " .current_star").empty().append($("<div>").text("★").addClass("star " + data.star));
    $(html_id + " .hero").text(hero)
  }

  generate_star_history(star_history) {
    let all_star = ["venus", "jupiter", "mercury", "mars", "saturn"];
    let stars = all_star.map((star, index) => {
      if (star_history.indexOf(star) != -1) {
        return $("<div>").text("★").addClass("star " + star);
      } else {
        return $("<div>").text("☆").addClass("star " + star);
      }
    });
    return stars;
  }

  generate_card(card_data, is_small) {
    let class_list = ["card"];
    let text = "";
    let card_id = card_data ? card_data.id : null;
    if (is_small) {
      class_list.push("card-sm");
    } else {
      class_list.push("card-lg");
    }

    if (card_data && card_data.element) {
      class_list.push(card_data.element);
      text = card_data.level;
      if (card_data.selected) {
        class_list.push("selected");
      }
    }

    return $("<div>").text(text).addClass(class_list.join(" ")).data("id", card_id);
  }

  generate_card_list(cards_data, show, is_small) {
    var cards = [];
    if (show) {
      cards = cards_data.map((card, index) => {
        return this.generate_card(card, is_small);
      }
      );
    } else {
      for (var i = 0; i < cards_data; i++) {
        cards.push(this.generate_card({}, is_small));
      }
    }
    return cards;
  }

  generate_last_act(last_act) {
    if (last_act && last_act.cards_used) {
      return this.generate_card_list(last_act.cards_used, true, true);
    } else if (last_act && last_act.cards_count) {
      return this.generate_card_list(last_act.cards_count, false, true);
    } else {
      return [];
    }
  }

  generate_rule_list(rules_data) {
    var rules = [];
    rules = rules_data.map((rule, index) => {
      return $("<div>").text(rule.name).addClass("col-md-4 rule").data("id", rule.id);
    });
    console.log(rules);
    return rules;
  }
};
 
// session.js
$(document).bind("page:load ready", function () {
  $('.alert').slideUp(1500);
});
