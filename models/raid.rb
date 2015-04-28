class Raid < ActiveRecord::Base
  def money=(value)
    value = value.to_s.gsub(/[$,]/, '').to_f
    write_attribute(:money, value)
  end

  def soldiers=(value)
    value = value.to_s.gsub(/[$,]/, '').to_f
    write_attribute(:soldiers, value)
  end

  def self.defenses_for_user(username)
    where('defender = ?', username)
  end

  def self.attacks_for_user(username)
    where('attacker = ?', username)
  end

  def self.first_negative
    where('money < 0').order(:created_at).first
  end

  def self.soldiers_lost_to_date(date)
    where('created_at <= ?', date).sum(:soldiers)
  end

  def self.contributor_attacks(date)
    where('created_at <= ?', date).group(:attacker).count(:id)
  end

  def self.contributor_defenses(date)
    where('created_at <= ?', date).group(:defender).count(:id)
  end

  def self.contributor_soldiers(date)
    where('created_at <= ?', date).group(:attacker).sum(:soldiers)
  end

  def self.contributor_defenders(date)
    where('created_at <= ?', date).group(:defender).sum(:soldiers)
  end
end
