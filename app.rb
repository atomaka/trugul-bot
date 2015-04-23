require 'sinatra'
require 'sinatra/activerecord'
require 'json'
require 'mechanize'
require 'nokogiri'
require './environments'

set :public_folder, 'public'

# CONTROLLER
get '/' do
  @raids = Raid.all.reverse

  mechanize = Mechanize.new
  page = mechanize.get('http://trugul.com/highscores')
  highscores = page.search "//table[@id='highscores_table']//tr[@class='clickable']/td[2]"

  require 'pp'
  @top20 = {}
  highscores.each do |td_user|
    user = td_user.text.scan(/[A-Za-z0-9]+/)
    @top20[user.first] = nil
  end

  @top20.keys.each do |top20|
    @raids.each do |raid|
      if raid.attacker == top20 || raid.defender == top20
        @top20[top20] = raid.created_at
        break
      end
    end
  end

  # get last attack for each
  # order by date

  erb :index
end

post '/' do
  response['Access-Control-Allow-Origin'] = 'http://trugul.com'

  @raid = Raid.new(params[:raid])

  if @raid.save
    content_type :json
    { :message => 'Raid saved' }.to_json
  else
    content_type :json
    { :message => 'Raid failed to save' }.to_json
  end
end

#HELPERS
def player_style(player)
  "color:#{players[player]};font-weight: bold" if players.keys.include?(player)
end

def players
  {
    'greggnic' => '#3c763d',
    'atomaka' => '#31708f',
    'mafiaman' => '#a94442'
  }
end

def readable_number(value)
  numbers.each do |number, symbol|
    if value.to_f / number.to_f > 1
      return sprintf('%.2f', value.to_f / number.to_f) + '<strong>' + symbol + '</strong>'
    end
  end

  value = 0.0 unless value
  return sprintf('%.2f', value) + "_"
end

def numbers
  {
    '1000000000000000' => 'Q',
    '1000000000000' => 'T',
    '1000000000' => 'B',
    '1000000' => 'M',
    '1000' => 'K'
  }
end

# MODEL
class Raid < ActiveRecord::Base
  def money=(value)
    value = value.to_s.gsub(/[$,]/, '').to_f
    write_attribute(:money, value)
  end

  def soldiers=(value)
    value = value.to_s.gsub(/[$,]/, '').to_f
    write_attribute(:soldiers, value)
  end
end
