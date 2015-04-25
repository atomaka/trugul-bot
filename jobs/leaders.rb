require 'sinatra/activerecord'
require 'mechanize'
require 'nokogiri'

require './models/leader'

def rebuild_leaders
  puts "rebuilding_leaders called"
  Leader.destroy_all

  mechanize = Mechanize.new
  page = mechanize.get('http://trugul.com/highscores')
  leaders = page.search "//table[@id='highscores_table']//tr[@class='clickable']/td[2]"

  leaders.each do |td_user|
    user = td_user.text.scan(/[A-Za-z0-9]+/).first

    Leader.new(leader: user).save
  end
end
