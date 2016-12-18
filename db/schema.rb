# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20160808144737) do

  create_table "authorizations", force: :cascade do |t|
    t.string   "provider"
    t.string   "uid"
    t.integer  "user_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "card_event_links", force: :cascade do |t|
    t.integer "card_id"
    t.integer "event_id"
  end

  create_table "cards", force: :cascade do |t|
    t.integer  "element",         default: 0
    t.integer  "level"
    t.integer  "position"
    t.integer  "cardholder_id"
    t.string   "cardholder_type"
    t.datetime "created_at",                  null: false
    t.datetime "updated_at",                  null: false
  end

  create_table "decks", force: :cascade do |t|
    t.integer  "game_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "event_player_links", force: :cascade do |t|
    t.integer "event_id"
    t.integer "player_id"
  end

  create_table "events", force: :cascade do |t|
    t.string   "effect"
    t.integer  "turn_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "games", force: :cascade do |t|
    t.string   "winner"
    t.string   "field"
    t.integer  "status",       default: 0
    t.integer  "team_amount",  default: 2
    t.integer  "member_limit", default: 1
    t.integer  "turn",         default: 0
    t.integer  "first",        default: 0
    t.boolean  "equal_member", default: true
    t.datetime "created_at",                  null: false
    t.datetime "updated_at",                  null: false
  end

  create_table "players", force: :cascade do |t|
    t.string   "star_history"
    t.string   "sustained"
    t.integer  "shell",        default: 0
    t.integer  "hand_limit",   default: 5
    t.integer  "sequence"
    t.integer  "user_id"
    t.integer  "team_id"
    t.datetime "created_at",               null: false
    t.datetime "updated_at",               null: false
  end

  create_table "rules", force: :cascade do |t|
    t.string   "name"
    t.string   "description"
    t.integer  "series"
    t.string   "condition"
    t.integer  "form"
    t.integer  "subform"
    t.string   "material"
    t.string   "formula"
    t.string   "effect"
    t.integer  "rule_id"
    t.datetime "created_at",  null: false
    t.datetime "updated_at",  null: false
  end

  create_table "teams", force: :cascade do |t|
    t.integer  "life",       default: 200
    t.integer  "life_limit", default: 200
    t.string   "star"
    t.integer  "maximum",    default: 1
    t.integer  "game_id"
    t.datetime "created_at",               null: false
    t.datetime "updated_at",               null: false
  end

  create_table "turns", force: :cascade do |t|
    t.integer  "number"
    t.integer  "game_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "users", force: :cascade do |t|
    t.string   "name"
    t.string   "email"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

end
