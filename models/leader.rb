class Leader < ActiveRecord::Base
  has_one :last_attack, foreign_key: :attacker, primary_key: :leader, class_name: 'Raid'
  has_one :last_defense, foreign_key: :defender, primary_key: :leader, class_name: 'Raid'

  def last_action
    if last_attack == nil && last_defense == nil
      @last_action = nil
    elsif last_defense == nil
      @last_action = last_attack.created_at
    elsif last_attack == nil
      @last_action = last_defense.created_at
    else
       @last_action = (last_attack.created_at > last_defense.created_at) ? last_attack.created_at : last_defense.created_at
    end

    return @last_action
  end
end
