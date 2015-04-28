class Raid < ActiveRecord::Base
  def money=(value)
    value = value.to_s.gsub(/[$,]/, '').to_f
    write_attribute(:money, value)
  end

  def soldiers=(value)
    value = value.to_s.gsub(/[$,]/, '').to_f
    write_attribute(:soldiers, value)
  end

  def self.for_user(username)
    where('defender = ?', username)
  end

  def self.first_negative
    where('money < 0').order(:created_at).first
  end

  def self.to_date(date)
    where('created_at < ?', date)
  end

  def self.soldiers_lost
    sum(:soldiers)
  end

  def self.by_attacker
    group(:attacker)
  end
end
