require './environments'

set :public_folder, 'public'

# CONTROLLER
get '/' do
  @raids = Raid.order('created_at DESC').page(params[:page])
  leaders = Leader.all
  last_update = leaders.first ? leaders.first.created_at : DateTime.new(0)
  if last_update + 300 < DateTime.now
    rebuild_leaders
  end

  leaders = Leader.all.includes(:last_attack, :last_defense)
  @top20 = leaders.reject { |l| l.last_action } + leaders.select { |l| l.last_action }.sort_by { |l| l.last_action }

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

get '/bossfight' do
  puts "RAIDS FOR MAFIAMAN"
  user_raids = Raid.for_user('mafiaman')
  puts "FIRST NEGATIVE"
  @first_negative = user_raids.first_negative
  unless @first_negative == nil
    puts "SOLDIERS LOST"
    @soldiers_lost_to_date = user_raids.to_date(@first_negative.created_at).soldiers_lost
    puts "SOLDIERS BY ATTACKER"
    @soldiers_by_attacker = user_raids.to-date(@first_negative.created_at).by_attacker.soldiers_lost
  end

  erb :bossfight
end
