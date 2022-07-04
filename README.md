# 五行戰鬥牌

最新規則請見[遊戲官方網站](https://www.cfecards.org/rule/latest)。

對規則有疑義可以到[討論區](https://forum.cfecards.org/)留言討論。

## 開發環境

* Rails 7.0.3
* Ruby 3.1.2

## 執行 Rspec

```sh
RAILS_ENV=test bundle exec rails db:reset  # if you have change the db schema
bundle exec rspec
```
