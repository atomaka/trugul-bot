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
  @username = params['username'] ? params['username'] : 'mafiaman'
  user_defenses = Raid.defenses_for_user(@username)
  user_attacks = Raid.attacks_for_user(@username)

  first_negative = user_defenses.first_negative
  @kill_date = first_negative ? first_negative.created_at : DateTime.now
  @kill_user = first_negative ? first_negative.attacker : '<strong>UNKILLED</strong>'

  @soldiers_killed = user_defenses.soldiers_lost_to_date(@kill_date)
  @soldiers_killed += user_attacks.soldiers_lost_to_date(@kill_date)

  @contributor_attacks = user_defenses.contributor_attacks(@kill_date)
  @contributor_soldiers = user_defenses.contributor_soldiers(@kill_date)

  @contributor_defenses = user_attacks.contributor_defenses(@kill_date)
  @contributor_defenders = user_attacks.contributor_defenders(@kill_date)

  @contributors = []
  @contributor_attacks.each do |k, v|
    attacks = @contributor_attacks[k] || 0
    defenses = @contributor_defenses[k] || 0
    lost = @contributor_soldiers[k] || 0
    lost += @contributor_defenders[k] if @contributor_defenders[k]
    @contributors << {
                       username: k,
                       attacks: attacks,
                       defenses: defenses,
                       lost: lost
                     }
  end

  @contributors = @contributors.sort_by { |c| c[:lost] }.reverse

  erb :bossfight
end
