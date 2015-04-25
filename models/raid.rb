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
