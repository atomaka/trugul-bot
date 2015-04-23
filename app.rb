require 'sinatra'
require 'sinatra/activerecord'
require 'json'
require './environments'

set :public_folder, 'public'

# CONTROLLER
get '/' do
  @raids = Raid.all.reverse
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
def readable_number(value)
  numbers.each do |number, symbol|
    if value.to_f / number.to_f > 1
      return (value.to_f / number.to_f).to_s + symbol
    end
  end

  return value
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
