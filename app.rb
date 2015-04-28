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

  @first_negative = user_defenses.first_negative
  @soldiers_killed = user_defenses.soldiers_lost_to_date(@first_negative.created_at)

  @contributor_attacks = user_defenses.contributor_attacks(@first_negative.created_at)
  @contributor_soldiers = user_defenses.contributor_soldiers(@first_negative.created_at)

  @contributor_defenses = user_attacks.contributor_defenses(@first_negative.created_at)
  @contributor_defenders = user_attacks.contributor_defenders(@first_negative.created_at)

  @contributors = []
  @contributor_attacks.each do |k, v|
    attacks = @contributor_attacks[k] || 0
    attacks += @contributor_defenses[k] if @contributor_defenses[k]
    lost = @contributor_soldiers[k] || 0
    lost += @contributor_defenders[k] if @contributor_defenders[k]
    @contributors << {
                       username: k,
                       attacks: attacks,
                       lost: lost
                     }
  end

  @contributors = @contributors.sort_by { |c| c[:lost] }.reverse

  erb :bossfight
end
