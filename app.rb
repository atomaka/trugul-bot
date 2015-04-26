require './environments'

set :public_folder, 'public'

# CONTROLLER
get '/' do
  @raids = Raid.order('created_at DESC').page(params[:page])
  leaders = Leader.all
  last_update = leaders.first ? leaders.first.created_at : DateTime.new(0)
  rebuild_leaders if last_update + 300 < DateTime.now

  @top20 = leaders.map { |l| { user: l.leader, date: nil } }

  @top20.each_with_index do |hash, i|
    @raids.each do |raid|
      if raid.attacker == hash[:user] || raid.defender == hash[:user]
        @top20[i][:date] = raid.created_at
        break
      end
    end
  end

  @top20 = @top20.select { |h| h[:date] }.sort_by { |h| h[:date] } + @top20.reject { |h| h[:date] }

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
